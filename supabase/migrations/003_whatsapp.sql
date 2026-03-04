-- ============================================================
-- CANAL WHATSAPP: preferencias, plantillas, logs, webhooks
-- RLS: usuario solo lo suyo; mentor logs de su cohorte; admin todo.
-- ============================================================

-- Preferencias de canal por usuario (1:1 con auth.users)
CREATE TABLE IF NOT EXISTS public.user_channels (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp_number_e164 TEXT,
  whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false,
  whatsapp_opt_in_at TIMESTAMPTZ,
  preferred_channel TEXT NOT NULL DEFAULT 'in_app' CHECK (preferred_channel IN ('whatsapp', 'email', 'in_app')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_channels_whatsapp_opt_in ON public.user_channels(whatsapp_opt_in) WHERE whatsapp_opt_in = true;

-- Plantillas de mensaje (referencia; admin las gestiona)
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'es',
  category TEXT NOT NULL DEFAULT 'MARKETING' CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_templates_name_language ON public.message_templates(name, language);

-- Log de mensajes enviados (relacionado con cohorte para filtro mentor)
CREATE TABLE IF NOT EXISTS public.message_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp')),
  "to" TEXT NOT NULL,
  template_name TEXT,
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  provider_message_id TEXT,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_logs_to ON public.message_logs("to");
CREATE INDEX IF NOT EXISTS idx_message_logs_cohort_id ON public.message_logs(cohort_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_recipient_user_id ON public.message_logs(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_created_at ON public.message_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_logs_provider_message_id ON public.message_logs(provider_message_id) WHERE provider_message_id IS NOT NULL;

-- Eventos webhook WhatsApp (opcional; solo admin para debugging)
CREATE TABLE IF NOT EXISTS public.webhook_events_whatsapp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_whatsapp_created_at ON public.webhook_events_whatsapp(created_at DESC);

-- Tablas para automatizaciones (sesiones, tareas, certificados)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES public.cohorts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  meeting_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_cohort_id ON public.sessions(cohort_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON public.sessions(scheduled_at);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON public.tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_cohort_id ON public.tasks(cohort_id);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON public.certificates(issued_at);

-- RLS
ALTER TABLE public.user_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- user_channels: cada usuario solo su fila
DROP POLICY IF EXISTS "Users own user_channels" ON public.user_channels;
CREATE POLICY "Users own user_channels" ON public.user_channels FOR ALL USING (user_id = auth.uid());

-- message_templates: lectura para todos autenticados; escritura admin
DROP POLICY IF EXISTS "Anyone read message_templates" ON public.message_templates;
CREATE POLICY "Anyone read message_templates" ON public.message_templates FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admin manage message_templates" ON public.message_templates;
CREATE POLICY "Admin manage message_templates" ON public.message_templates FOR ALL USING (public.current_user_role() = 'admin');

-- message_logs: usuario ve sus logs (recipient_user_id = auth.uid()); mentor ve logs de su cohorte; admin todo
DROP POLICY IF EXISTS "Users read own message_logs" ON public.message_logs;
CREATE POLICY "Users read own message_logs" ON public.message_logs FOR SELECT USING (recipient_user_id = auth.uid());
DROP POLICY IF EXISTS "Mentors read cohort message_logs" ON public.message_logs;
CREATE POLICY "Mentors read cohort message_logs" ON public.message_logs FOR SELECT
  USING (cohort_id IS NOT NULL AND public.is_mentor_of_cohort(cohort_id));
DROP POLICY IF EXISTS "Admin all message_logs" ON public.message_logs;
CREATE POLICY "Admin all message_logs" ON public.message_logs FOR ALL USING (public.current_user_role() = 'admin');
-- Inserción: servicio/backend (service role) o admin/mentor al enviar
DROP POLICY IF EXISTS "Admin mentor insert message_logs" ON public.message_logs;
CREATE POLICY "Admin mentor insert message_logs" ON public.message_logs FOR INSERT
  WITH CHECK (
    public.current_user_role() = 'admin'
    OR (cohort_id IS NOT NULL AND public.is_mentor_of_cohort(cohort_id))
  );
DROP POLICY IF EXISTS "Admin mentor update message_logs" ON public.message_logs;
CREATE POLICY "Admin mentor update message_logs" ON public.message_logs FOR UPDATE
  USING (
    public.current_user_role() = 'admin'
    OR (cohort_id IS NOT NULL AND public.is_mentor_of_cohort(cohort_id))
  );

-- webhook_events_whatsapp: solo admin lectura; inserción vía service role o policy que permita al anon desde webhook (mejor: API con service role inserta)
DROP POLICY IF EXISTS "Admin read webhook_events_whatsapp" ON public.webhook_events_whatsapp;
CREATE POLICY "Admin read webhook_events_whatsapp" ON public.webhook_events_whatsapp FOR SELECT USING (public.current_user_role() = 'admin');
-- Inserción desde webhook: no usar anon; el route handler usará service role para insertar.

-- sessions / tasks / certificates: políticas básicas (miembros de cohorte ven sesiones; usuario ve sus tareas/certificados)
DROP POLICY IF EXISTS "Members read cohort sessions" ON public.sessions;
CREATE POLICY "Members read cohort sessions" ON public.sessions FOR SELECT
  USING (public.is_member_of_cohort(cohort_id) OR public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Mentor admin manage sessions" ON public.sessions;
CREATE POLICY "Mentor admin manage sessions" ON public.sessions FOR ALL
  USING (public.is_mentor_of_cohort(cohort_id) OR public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users own tasks" ON public.tasks;
CREATE POLICY "Users own tasks" ON public.tasks FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Mentors read cohort tasks" ON public.tasks;
CREATE POLICY "Mentors read cohort tasks" ON public.tasks FOR SELECT
  USING (cohort_id IS NOT NULL AND public.is_mentor_of_cohort(cohort_id));

DROP POLICY IF EXISTS "Users own certificates" ON public.certificates;
CREATE POLICY "Users own certificates" ON public.certificates FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admin read all certificates" ON public.certificates;
CREATE POLICY "Admin read all certificates" ON public.certificates FOR SELECT USING (public.current_user_role() = 'admin');

-- Trigger updated_at user_channels
DROP TRIGGER IF EXISTS user_channels_updated_at ON public.user_channels;
CREATE TRIGGER user_channels_updated_at BEFORE UPDATE ON public.user_channels FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
