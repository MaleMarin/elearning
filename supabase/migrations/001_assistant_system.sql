-- ============================================================
-- SISTEMA DE ASISTENTE - TABLAS, ÍNDICES Y RLS
-- Ejecutar en Supabase SQL Editor o via CLI
-- ============================================================

-- Extensión para UUIDs (ya suele estar en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles (referencia a auth.users; ajustar si ya existe)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cohortes y cursos (mínimo para RLS)
CREATE TABLE IF NOT EXISTS public.cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inscripción usuario -> cohorte (para RLS mentor/estudiante)
CREATE TABLE IF NOT EXISTS public.cohort_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'mentor')),
  UNIQUE(cohort_id, user_id)
);

-- Posts de comunidad (para flags y unanswered)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 1) assistant_threads
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assistant_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL CHECK (mode IN ('tutor', 'support', 'community')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_threads_user_id ON public.assistant_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_threads_cohort_id ON public.assistant_threads(cohort_id);
CREATE INDEX IF NOT EXISTS idx_assistant_threads_created_at ON public.assistant_threads(created_at DESC);

-- ============================================================
-- 2) assistant_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.assistant_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_messages_thread_id ON public.assistant_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_assistant_messages_created_at ON public.assistant_messages(created_at);

-- ============================================================
-- 3) support_tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved')),
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_cohort_id ON public.support_tickets(cohort_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- ============================================================
-- 4) community_flags
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  flagged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  severity INT NOT NULL DEFAULT 1 CHECK (severity >= 1 AND severity <= 5),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_flags_post_id ON public.community_flags(post_id);
CREATE INDEX IF NOT EXISTS idx_community_flags_status ON public.community_flags(status);

-- ============================================================
-- 5) notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at) WHERE read_at IS NULL;

-- ============================================================
-- 6) weekly_digests (opcional)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weekly_digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_digests_cohort_id ON public.weekly_digests(cohort_id);

-- ============================================================
-- RLS: habilitar en todas las tablas
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_digests ENABLE ROW LEVEL SECURITY;

-- Helper: rol del usuario actual
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: si el usuario es mentor de una cohorte
CREATE OR REPLACE FUNCTION public.is_mentor_of_cohort(p_cohort_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cohort_members
    WHERE cohort_id = p_cohort_id AND user_id = auth.uid() AND role = 'mentor'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: si el usuario pertenece a una cohorte (estudiante o mentor)
CREATE OR REPLACE FUNCTION public.is_member_of_cohort(p_cohort_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cohort_members
    WHERE cohort_id = p_cohort_id AND user_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- POLICIES: profiles
-- ============================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS "Allow insert own profile" ON public.profiles;
CREATE POLICY "Allow insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- POLICIES: cohorts / courses (lectura para miembros)
-- ============================================================
DROP POLICY IF EXISTS "Admin all cohorts" ON public.cohorts;
CREATE POLICY "Admin all cohorts" ON public.cohorts FOR ALL USING (public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Members can read own cohorts" ON public.cohorts;
CREATE POLICY "Members can read own cohorts" ON public.cohorts FOR SELECT
  USING (public.is_member_of_cohort(id) OR public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin all courses" ON public.courses;
CREATE POLICY "Admin all courses" ON public.courses FOR ALL USING (public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Anyone authenticated can read courses" ON public.courses;
CREATE POLICY "Anyone authenticated can read courses" ON public.courses FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================
-- POLICIES: cohort_members
-- ============================================================
DROP POLICY IF EXISTS "Admin all cohort_members" ON public.cohort_members;
CREATE POLICY "Admin all cohort_members" ON public.cohort_members FOR ALL USING (public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Mentor can read own cohort members" ON public.cohort_members;
CREATE POLICY "Mentor can read own cohort members" ON public.cohort_members FOR SELECT
  USING (public.is_mentor_of_cohort(cohort_id));
DROP POLICY IF EXISTS "Users can read own memberships" ON public.cohort_members;
CREATE POLICY "Users can read own memberships" ON public.cohort_members FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- POLICIES: assistant_threads
-- Estudiante: solo sus threads. Mentor: threads de su cohorte. Admin: todo.
-- ============================================================
DROP POLICY IF EXISTS "Users can read own threads" ON public.assistant_threads;
CREATE POLICY "Users can read own threads" ON public.assistant_threads FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can read threads of their cohort" ON public.assistant_threads;
CREATE POLICY "Mentors can read threads of their cohort" ON public.assistant_threads FOR SELECT
  USING (cohort_id IS NOT NULL AND public.is_mentor_of_cohort(cohort_id));

DROP POLICY IF EXISTS "Admin can read all threads" ON public.assistant_threads;
CREATE POLICY "Admin can read all threads" ON public.assistant_threads FOR SELECT
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can insert own threads" ON public.assistant_threads;
CREATE POLICY "Users can insert own threads" ON public.assistant_threads FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own threads" ON public.assistant_threads;
CREATE POLICY "Users can update own threads" ON public.assistant_threads FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================
-- POLICIES: assistant_messages
-- ============================================================
DROP POLICY IF EXISTS "Users can read messages of own threads" ON public.assistant_messages;
CREATE POLICY "Users can read messages of own threads" ON public.assistant_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.assistant_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Mentors can read messages of cohort threads" ON public.assistant_messages;
CREATE POLICY "Mentors can read messages of cohort threads" ON public.assistant_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assistant_threads t
      WHERE t.id = thread_id AND t.cohort_id IS NOT NULL AND public.is_mentor_of_cohort(t.cohort_id)
    )
  );

DROP POLICY IF EXISTS "Admin can read all messages" ON public.assistant_messages;
CREATE POLICY "Admin can read all messages" ON public.assistant_messages FOR SELECT
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can insert messages in own threads" ON public.assistant_messages;
CREATE POLICY "Users can insert messages in own threads" ON public.assistant_messages FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.assistant_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
  );

-- ============================================================
-- POLICIES: support_tickets
-- Usuario: solo los suyos. Mentor: de su cohorte. Admin: todos.
-- ============================================================
DROP POLICY IF EXISTS "Users can read own tickets" ON public.support_tickets;
CREATE POLICY "Users can read own tickets" ON public.support_tickets FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can read tickets of cohort" ON public.support_tickets;
CREATE POLICY "Mentors can read tickets of cohort" ON public.support_tickets FOR SELECT
  USING (cohort_id IS NOT NULL AND public.is_mentor_of_cohort(cohort_id));

DROP POLICY IF EXISTS "Admin can read all tickets" ON public.support_tickets;
CREATE POLICY "Admin can read all tickets" ON public.support_tickets FOR SELECT
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can insert own tickets" ON public.support_tickets;
CREATE POLICY "Users can insert own tickets" ON public.support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Mentors can update tickets of cohort" ON public.support_tickets;
CREATE POLICY "Mentors can update tickets of cohort" ON public.support_tickets FOR UPDATE
  USING (cohort_id IS NOT NULL AND public.is_mentor_of_cohort(cohort_id));

DROP POLICY IF EXISTS "Admin can update all tickets" ON public.support_tickets;
CREATE POLICY "Admin can update all tickets" ON public.support_tickets FOR UPDATE
  USING (public.current_user_role() = 'admin');

-- ============================================================
-- POLICIES: community_posts / community_comments
-- ============================================================
DROP POLICY IF EXISTS "Members can read posts of cohort" ON public.community_posts;
CREATE POLICY "Members can read posts of cohort" ON public.community_posts FOR SELECT
  USING (public.is_member_of_cohort(cohort_id) OR public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Members can insert posts" ON public.community_posts;
CREATE POLICY "Members can insert posts" ON public.community_posts FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.is_member_of_cohort(cohort_id));

DROP POLICY IF EXISTS "Members can read comments" ON public.community_comments;
CREATE POLICY "Members can read comments" ON public.community_comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id = post_id AND (public.is_member_of_cohort(p.cohort_id) OR public.current_user_role() = 'admin'))
  );

DROP POLICY IF EXISTS "Members can insert comments" ON public.community_comments;
CREATE POLICY "Members can insert comments" ON public.community_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id = post_id AND public.is_member_of_cohort(p.cohort_id))
  );

-- ============================================================
-- POLICIES: community_flags
-- Usuarios pueden crear flags. Mentor/Admin pueden leer y actualizar.
-- ============================================================
DROP POLICY IF EXISTS "Users can insert flags" ON public.community_flags;
CREATE POLICY "Users can insert flags" ON public.community_flags FOR INSERT
  WITH CHECK (flagged_by = auth.uid());

DROP POLICY IF EXISTS "Mentors can read flags for cohort posts" ON public.community_flags;
CREATE POLICY "Mentors can read flags for cohort posts" ON public.community_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_posts p
      WHERE p.id = post_id AND public.is_mentor_of_cohort(p.cohort_id)
    )
  );

DROP POLICY IF EXISTS "Admin can read all flags" ON public.community_flags;
CREATE POLICY "Admin can read all flags" ON public.community_flags FOR SELECT
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Mentors can update flags for cohort" ON public.community_flags;
CREATE POLICY "Mentors can update flags for cohort" ON public.community_flags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.community_posts p
      WHERE p.id = post_id AND public.is_mentor_of_cohort(p.cohort_id)
    )
  );

DROP POLICY IF EXISTS "Admin can update all flags" ON public.community_flags;
CREATE POLICY "Admin can update all flags" ON public.community_flags FOR UPDATE
  USING (public.current_user_role() = 'admin');

-- ============================================================
-- POLICIES: notifications
-- Cada usuario solo sus notificaciones
-- ============================================================
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Servicio/backend puede insertar (usar service role en API)
-- Para anon key: permitir solo lectura/update por propio user. Insert vía API con service role o con trigger.

-- ============================================================
-- POLICIES: weekly_digests
-- ============================================================
DROP POLICY IF EXISTS "Members can read digests of cohort" ON public.weekly_digests;
CREATE POLICY "Members can read digests of cohort" ON public.weekly_digests FOR SELECT
  USING (public.is_member_of_cohort(cohort_id) OR public.current_user_role() = 'admin');

-- Solo admin o cron con service role pueden insertar digests (no policy INSERT para anon).

-- Trigger para updated_at en support_tickets
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
