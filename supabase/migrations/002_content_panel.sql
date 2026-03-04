-- ============================================================
-- PANEL DE CONTENIDO: courses/modules/lessons + lesson_resources
-- Mentor solo edita cursos asignados a sus cohortes; admin todo.
-- ============================================================

-- Asignación curso <-> cohorte (un curso puede estar en varias cohortes)
CREATE TABLE IF NOT EXISTS public.cohort_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cohort_id, course_id)
);

-- Actualizar courses: status y updated_at
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_cohort_courses_course_id ON public.cohort_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_cohort_courses_cohort_id ON public.cohort_courses(cohort_id);

-- Módulos (por curso)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);

-- Lecciones (por módulo)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  video_embed_url TEXT,
  estimated_minutes INT,
  order_index INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

-- Recursos de lección (metadatos; archivos en Storage bucket 'resources')
CREATE TABLE IF NOT EXISTS public.lesson_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson_id ON public.lesson_resources(lesson_id);

-- Helper: ¿el usuario actual puede editar este curso? (admin o mentor de alguna cohorte con el curso)
CREATE OR REPLACE FUNCTION public.can_edit_course(p_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.current_user_role() = 'admin' THEN
    RETURN TRUE;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.cohort_courses cc
    INNER JOIN public.cohort_members cm ON cm.cohort_id = cc.cohort_id AND cm.user_id = auth.uid() AND cm.role = 'mentor'
    WHERE cc.course_id = p_course_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: ¿puede editar esta lección? (vía module -> course)
CREATE OR REPLACE FUNCTION public.can_edit_lesson(p_lesson_id UUID)
RETURNS BOOLEAN AS $$
  SELECT public.can_edit_course((
    SELECT c.id FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = p_lesson_id
  ));
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Trigger updated_at para courses, modules, lessons
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS modules_updated_at ON public.modules;
CREATE TRIGGER modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
DROP TRIGGER IF EXISTS lessons_updated_at ON public.lessons;
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.cohort_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;

-- cohort_courses: admin todo; mentor puede leer/insertar para sus cohortes
DROP POLICY IF EXISTS "Admin all cohort_courses" ON public.cohort_courses;
CREATE POLICY "Admin all cohort_courses" ON public.cohort_courses FOR ALL USING (public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Mentor read cohort_courses for own cohorts" ON public.cohort_courses;
CREATE POLICY "Mentor read cohort_courses for own cohorts" ON public.cohort_courses FOR SELECT
  USING (public.is_mentor_of_cohort(cohort_id));
DROP POLICY IF EXISTS "Mentor insert cohort_courses for own cohorts" ON public.cohort_courses;
CREATE POLICY "Mentor insert cohort_courses for own cohorts" ON public.cohort_courses FOR INSERT
  WITH CHECK (public.is_mentor_of_cohort(cohort_id));
DROP POLICY IF EXISTS "Mentor delete cohort_courses for own cohorts" ON public.cohort_courses;
CREATE POLICY "Mentor delete cohort_courses for own cohorts" ON public.cohort_courses FOR DELETE
  USING (public.is_mentor_of_cohort(cohort_id));

-- courses: admin todo; mentor puede update/insert si puede editar (vía cohort_courses después de insert)
DROP POLICY IF EXISTS "Mentor update course if assigned" ON public.courses;
CREATE POLICY "Mentor update course if assigned" ON public.courses FOR UPDATE USING (public.can_edit_course(id));
DROP POLICY IF EXISTS "Mentor insert courses" ON public.courses;
CREATE POLICY "Mentor insert courses" ON public.courses FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'mentor'));

-- modules: admin todo; mentor si puede editar el curso
DROP POLICY IF EXISTS "Admin all modules" ON public.modules;
CREATE POLICY "Admin all modules" ON public.modules FOR ALL USING (public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Mentor modules for editable courses" ON public.modules;
CREATE POLICY "Mentor modules for editable courses" ON public.modules FOR ALL USING (public.can_edit_course(course_id));

-- lessons: admin todo; mentor si puede editar el curso (vía module)
DROP POLICY IF EXISTS "Admin all lessons" ON public.lessons;
CREATE POLICY "Admin all lessons" ON public.lessons FOR ALL USING (public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Mentor lessons for editable courses" ON public.lessons;
CREATE POLICY "Mentor lessons for editable courses" ON public.lessons FOR ALL
  USING (EXISTS (SELECT 1 FROM public.modules m WHERE m.id = lessons.module_id AND public.can_edit_course(m.course_id)));

-- lesson_resources: mismo criterio que lessons
DROP POLICY IF EXISTS "Admin all lesson_resources" ON public.lesson_resources;
CREATE POLICY "Admin all lesson_resources" ON public.lesson_resources FOR ALL USING (public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Mentor lesson_resources for editable lessons" ON public.lesson_resources;
CREATE POLICY "Mentor lesson_resources for editable lessons" ON public.lesson_resources FOR ALL USING (public.can_edit_lesson(lesson_id));

-- Lectura pública (solo published) para estudiantes: courses/modules/lessons visibles si status = published
-- (Los estudiantes ya tienen "Anyone authenticated can read courses". Añadimos políticas para modules/lessons read para miembros de cohorte con el curso)
DROP POLICY IF EXISTS "Read published modules" ON public.modules;
CREATE POLICY "Read published modules" ON public.modules FOR SELECT
  USING (status = 'published' OR public.can_edit_course(course_id));
DROP POLICY IF EXISTS "Read published lessons" ON public.lessons;
CREATE POLICY "Read published lessons" ON public.lessons FOR SELECT
  USING (
    status = 'published' OR
    EXISTS (SELECT 1 FROM public.modules m WHERE m.id = lessons.module_id AND public.can_edit_course(m.course_id))
  );
DROP POLICY IF EXISTS "Read lesson_resources for published lessons" ON public.lesson_resources;
CREATE POLICY "Read lesson_resources for published lessons" ON public.lesson_resources FOR SELECT
  USING (
    public.can_edit_lesson(lesson_id) OR
    EXISTS (SELECT 1 FROM public.lessons l WHERE l.id = lesson_id AND l.status = 'published')
  );

-- ============================================================
-- STORAGE: bucket privado "resources" (path: lesson_id/nombre_archivo)
-- Crear bucket; políticas para mentor/admin que puede editar la lección.
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resources', 'resources', false, 52428800)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 52428800;

-- Helper para Storage: extraer lesson_id del path (formato lesson_id/nombre_archivo)
CREATE OR REPLACE FUNCTION public.lesson_id_from_storage_path(path TEXT)
RETURNS UUID AS $$
  SELECT NULLIF((string_to_array(trim(both '/' from path), '/'))[1], '')::uuid;
$$ LANGUAGE sql IMMUTABLE;

-- Política Storage: solo quien puede editar la lección puede subir/ver/borrar en esa carpeta
DROP POLICY IF EXISTS "Content panel: full access to own lesson paths" ON storage.objects;
CREATE POLICY "Content panel: full access to own lesson paths" ON storage.objects
FOR ALL
USING (
  bucket_id = 'resources'
  AND public.can_edit_lesson(public.lesson_id_from_storage_path(name))
)
WITH CHECK (
  bucket_id = 'resources'
  AND public.can_edit_lesson(public.lesson_id_from_storage_path(name))
);
