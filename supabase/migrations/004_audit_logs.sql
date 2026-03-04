-- ============================================================
-- AUDITORÍA: acciones admin/mentor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  payload JSONB DEFAULT '{}',
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admin puede leer audit_logs
DROP POLICY IF EXISTS "Admin read audit_logs" ON public.audit_logs;
CREATE POLICY "Admin read audit_logs" ON public.audit_logs FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Inserción: desde backend (service role) o usuario autenticado con rol admin/mentor
DROP POLICY IF EXISTS "Server or admin mentor insert audit_logs" ON public.audit_logs;
CREATE POLICY "Server or admin mentor insert audit_logs" ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.current_user_role() IN ('admin', 'mentor')
  );
