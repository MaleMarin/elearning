-- ============================================================
-- TICKET 5: LMS base — courses, modules, lessons (schema + RLS)
-- ============================================================

-- ----- courses: description, slug, created_by -----
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug) WHERE slug IS NOT NULL;

-- ----- modules: description, unique(course_id, order_index) -----
ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS description TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_modules_course_order ON public.modules(course_id, order_index);

-- ----- lessons: content nullable, unique(module_id, order_index) -----
ALTER TABLE public.lessons
  ALTER COLUMN content DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_module_order ON public.lessons(module_id, order_index);

-- ----- cohort_courses: is_primary -----
ALTER TABLE public.cohort_courses
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT true;

-- cohort_courses: course_id ON DELETE RESTRICT (opcional; si se desea evitar borrar curso con asignaciones)
-- Por defecto 002 tiene ON DELETE CASCADE; no cambiamos para no romper flujos existentes.

-- ----- Helper: ¿el curso está asignado a alguna cohorte del usuario (enrollment active)? -----
CREATE OR REPLACE FUNCTION public.is_course_in_user_cohort(p_course_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments e
    INNER JOIN public.cohort_courses cc ON cc.cohort_id = e.cohort_id AND cc.course_id = p_course_id
    WHERE e.user_id = auth.uid() AND e.status = 'active'
  );
$$;

-- ----- RLS: estudiantes solo ven cursos/módulos/lecciones de su cohorte y publicados -----

-- courses: quitar lectura abierta; admin todo; mentor can_edit; estudiante solo publicado y en su cohorte
DROP POLICY IF EXISTS "Anyone authenticated can read courses" ON public.courses;
DROP POLICY IF EXISTS "Admin all courses" ON public.courses;

CREATE POLICY "Admin all courses" ON public.courses
  FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Student read published courses in cohort" ON public.courses
  FOR SELECT
  USING (
    status = 'published' AND public.is_course_in_user_cohort(id)
  );

-- Mentor read/update/insert (existing mentor policies remain; ensure WITH CHECK where needed)
DROP POLICY IF EXISTS "Mentor update course if assigned" ON public.courses;
CREATE POLICY "Mentor update course if assigned" ON public.courses
  FOR UPDATE
  USING (public.can_edit_course(id))
  WITH CHECK (public.can_edit_course(id));

DROP POLICY IF EXISTS "Mentor insert courses" ON public.courses;
CREATE POLICY "Mentor insert courses" ON public.courses
  FOR INSERT
  WITH CHECK (public.current_user_role() IN ('admin', 'mentor'));

-- Mentor read: puede leer cursos que puede editar
DROP POLICY IF EXISTS "Mentor read editable courses" ON public.courses;
CREATE POLICY "Mentor read editable courses" ON public.courses
  FOR SELECT
  USING (public.can_edit_course(id));

-- modules: estudiante solo published y curso en su cohorte
DROP POLICY IF EXISTS "Read published modules" ON public.modules;
CREATE POLICY "Read published modules" ON public.modules
  FOR SELECT
  USING (
    (status = 'published' AND public.is_course_in_user_cohort(course_id))
    OR public.can_edit_course(course_id)
  );

-- Admin modules WITH CHECK
DROP POLICY IF EXISTS "Admin all modules" ON public.modules;
CREATE POLICY "Admin all modules" ON public.modules
  FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Mentor modules for editable courses" ON public.modules;
CREATE POLICY "Mentor modules for editable courses" ON public.modules
  FOR ALL
  USING (public.can_edit_course(course_id))
  WITH CHECK (public.can_edit_course(course_id));

-- lessons: estudiante solo published y curso en su cohorte
DROP POLICY IF EXISTS "Read published lessons" ON public.lessons;
CREATE POLICY "Read published lessons" ON public.lessons
  FOR SELECT
  USING (
    (status = 'published' AND public.is_course_in_user_cohort((
      SELECT m.course_id FROM public.modules m WHERE m.id = lessons.module_id
    )))
    OR EXISTS (
      SELECT 1 FROM public.modules m
      WHERE m.id = lessons.module_id AND public.can_edit_course(m.course_id)
    )
  );

-- cohort_courses: admin WITH CHECK; mentor WITH CHECK
DROP POLICY IF EXISTS "Admin all cohort_courses" ON public.cohort_courses;
CREATE POLICY "Admin all cohort_courses" ON public.cohort_courses
  FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Mentor read cohort_courses for own cohorts" ON public.cohort_courses;
CREATE POLICY "Mentor read cohort_courses for own cohorts" ON public.cohort_courses
  FOR SELECT
  USING (public.is_mentor_of_cohort(cohort_id));

DROP POLICY IF EXISTS "Mentor insert cohort_courses for own cohorts" ON public.cohort_courses;
CREATE POLICY "Mentor insert cohort_courses for own cohorts" ON public.cohort_courses
  FOR INSERT
  WITH CHECK (public.is_mentor_of_cohort(cohort_id));

DROP POLICY IF EXISTS "Mentor delete cohort_courses for own cohorts" ON public.cohort_courses;
CREATE POLICY "Mentor delete cohort_courses for own cohorts" ON public.cohort_courses
  FOR DELETE
  USING (public.is_mentor_of_cohort(cohort_id));
