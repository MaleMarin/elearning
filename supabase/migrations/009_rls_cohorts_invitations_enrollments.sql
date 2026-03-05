-- ============================================================
-- RLS: corrección de policies (USING + WITH CHECK) y enrollments
-- ============================================================

-- ----- Helper functions: search_path seguro y uso de auth.uid() -----
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_mentor_of_cohort(p_cohort_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cohort_members
    WHERE cohort_id = p_cohort_id AND user_id = auth.uid() AND role = 'mentor'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_member_of_cohort(p_cohort_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cohort_members
    WHERE cohort_id = p_cohort_id AND user_id = auth.uid()
  );
$$;

-- ============================================================
-- COHORTS
-- ============================================================
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin all cohorts" ON public.cohorts;
CREATE POLICY "Admin all cohorts" ON public.cohorts
  FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Members can read own cohorts" ON public.cohorts;
CREATE POLICY "Members can read own cohorts" ON public.cohorts
  FOR SELECT
  USING (public.is_member_of_cohort(id) OR public.current_user_role() = 'admin');

-- ============================================================
-- INVITATIONS
-- ============================================================
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin all invitations" ON public.invitations;
CREATE POLICY "Admin all invitations" ON public.invitations
  FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Mentor manage cohort invitations" ON public.invitations;
CREATE POLICY "Mentor manage cohort invitations" ON public.invitations
  FOR ALL
  USING (public.is_mentor_of_cohort(cohort_id))
  WITH CHECK (public.is_mentor_of_cohort(cohort_id));

-- ============================================================
-- ENROLLMENTS
-- ============================================================
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own enrollment" ON public.enrollments;
CREATE POLICY "Users read own enrollment" ON public.enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin read all enrollments" ON public.enrollments;
CREATE POLICY "Admin read all enrollments" ON public.enrollments
  FOR SELECT
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Mentor read enrollments of own cohorts" ON public.enrollments;
CREATE POLICY "Mentor read enrollments of own cohorts" ON public.enrollments
  FOR SELECT
  USING (public.is_mentor_of_cohort(cohort_id));

-- Inserción/actualización de enrollments: solo service role o RPC (redeem_invitation).
-- No hay políticas INSERT/UPDATE para anon/authenticated.
