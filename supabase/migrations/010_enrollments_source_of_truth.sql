-- ============================================================
-- Fuente de verdad: membresía por cohorte = enrollments (active)
-- ============================================================
-- Decisión: Opción A. enrollments es la fuente de verdad de acceso/membresía.
-- - is_member_of_cohort() revisa enrollments con status='active'.
-- - is_mentor_of_cohort() sigue en cohort_members (rol mentor, gestión).
-- - Quien tiene enrollment activo puede leer su cohorte y no queda bloqueado por RLS.
-- ============================================================

-- is_member_of_cohort: basado en enrollments (status = 'active')
CREATE OR REPLACE FUNCTION public.is_member_of_cohort(p_cohort_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE cohort_id = p_cohort_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- Ajuste en cohorts: "miembro" = enrollment activo O mentor de la cohorte (cohort_members)
-- Así mentores sin enrollment también ven la cohorte.
DROP POLICY IF EXISTS "Members can read own cohorts" ON public.cohorts;
CREATE POLICY "Members can read own cohorts" ON public.cohorts
  FOR SELECT
  USING (
    public.is_member_of_cohort(id)
    OR public.is_mentor_of_cohort(id)
    OR public.current_user_role() = 'admin'
  );
