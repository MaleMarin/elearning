-- ============================================================
-- INVITACIONES: códigos para inscripción (enrollment) en cohortes
-- Redeem = crear cohort_members (enrollment activo)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  max_uses INT NOT NULL DEFAULT 1 CHECK (max_uses >= 1),
  uses INT NOT NULL DEFAULT 0 CHECK (uses >= 0),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_code ON public.invitations(code);
CREATE INDEX IF NOT EXISTS idx_invitations_cohort_id ON public.invitations(cohort_id);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON public.invitations(expires_at) WHERE expires_at IS NOT NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS invitations_updated_at ON public.invitations;
CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Solo admin o mentor de la cohorte pueden ver/gestionar invitaciones
DROP POLICY IF EXISTS "Admin all invitations" ON public.invitations;
CREATE POLICY "Admin all invitations" ON public.invitations FOR ALL
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Mentor manage cohort invitations" ON public.invitations;
CREATE POLICY "Mentor manage cohort invitations" ON public.invitations FOR ALL
  USING (public.is_mentor_of_cohort(cohort_id));

-- Nota: el canje (redeem) se hace desde API con service role para validar code e insertar en cohort_members.
-- Los usuarios no leen la tabla invitations por política.
