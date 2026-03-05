-- ============================================================
-- TICKET 3: Cohortes, invitaciones, enrollments (códigos)
-- ============================================================

-- ----- cohorts: ampliar columnas -----
ALTER TABLE public.cohorts
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS starts_at DATE,
  ADD COLUMN IF NOT EXISTS ends_at DATE,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS capacity INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS cohorts_updated_at ON public.cohorts;
CREATE TRIGGER cohorts_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ----- invitations: is_active, created_by -----
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Policies: solo admin (estudiantes no leen invitaciones)
-- 006 ya tiene "Admin all invitations" y "Mentor manage cohort invitations"; mantener.

-- ----- enrollments: cohort_id + unique(user_id, cohort_id) -----
-- Crear cohorte legacy para filas existentes sin cohorte
INSERT INTO public.cohorts (id, name, description, capacity, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Acceso general (legacy)',
  'Cohorte por defecto para inscripciones anteriores al sistema de códigos.',
  0,
  true
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES public.cohorts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Backfill: asignar cohorte legacy a enrollments existentes sin cohort_id
UPDATE public.enrollments
SET cohort_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE cohort_id IS NULL;

ALTER TABLE public.enrollments
  ALTER COLUMN cohort_id SET NOT NULL;

DROP INDEX IF EXISTS public.idx_enrollments_user_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_user_cohort ON public.enrollments(user_id, cohort_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status ON public.enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_cohort_status ON public.enrollments(cohort_id, status);

DROP TRIGGER IF EXISTS enrollments_updated_at ON public.enrollments;
CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS enrollments: usuario solo lee los suyos (ya existe "Users read own enrollment")
-- Insert/Update solo vía service role (API redeem). Sin políticas INSERT/UPDATE para anon.

-- ----- RPC atómico: canjear código (solo service role / backend) -----
CREATE OR REPLACE FUNCTION public.redeem_invitation(p_code TEXT, p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv_id UUID;
  v_cohort_id UUID;
  v_max_uses INT;
  v_uses INT;
  v_expires_at TIMESTAMPTZ;
  v_is_active BOOLEAN;
  v_cohort_active BOOLEAN;
  v_capacity INT;
  v_current_count BIGINT;
BEGIN
  SELECT id, cohort_id, max_uses, uses, expires_at, is_active
  INTO v_inv_id, v_cohort_id, v_max_uses, v_uses, v_expires_at, v_is_active
  FROM public.invitations
  WHERE code = upper(trim(p_code))
  FOR UPDATE;

  IF v_inv_id IS NULL THEN
    RAISE EXCEPTION 'Código no válido o no encontrado';
  END IF;
  IF NOT COALESCE(v_is_active, true) THEN
    RAISE EXCEPTION 'Este código no está activo';
  END IF;
  IF v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    RAISE EXCEPTION 'Este código ha caducado';
  END IF;
  IF v_uses >= v_max_uses THEN
    RAISE EXCEPTION 'Este código ya no tiene usos disponibles';
  END IF;

  SELECT is_active, capacity INTO v_cohort_active, v_capacity
  FROM public.cohorts WHERE id = v_cohort_id;
  IF v_cohort_active IS NOT TRUE THEN
    RAISE EXCEPTION 'La cohorte no está activa';
  END IF;

  IF v_capacity > 0 THEN
    SELECT count(*) INTO v_current_count
    FROM public.enrollments
    WHERE cohort_id = v_cohort_id AND status = 'active';
    IF v_current_count >= v_capacity THEN
      RAISE EXCEPTION 'La cohorte ha alcanzado su capacidad máxima';
    END IF;
  END IF;

  INSERT INTO public.enrollments (user_id, cohort_id, status)
  VALUES (p_user_id, v_cohort_id, 'active')
  ON CONFLICT (user_id, cohort_id) DO UPDATE SET status = 'active', updated_at = now();

  UPDATE public.invitations SET uses = uses + 1, updated_at = now() WHERE id = v_inv_id;

  RETURN v_cohort_id;
END;
$$;

-- Índice invitations(code) ya existe en 006.
