-- ============================================================
-- TICKET 2: enrollments (acceso a plataforma) + perfil automático
-- ============================================================

-- Tabla enrollments: acceso mínimo (sin cohort en este ticket)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Usuario solo puede leer su propio enrollment
DROP POLICY IF EXISTS "Users read own enrollment" ON public.enrollments;
CREATE POLICY "Users read own enrollment" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

-- Inserción/actualización de enrollments: solo service role (backend) o admin vía función.
-- No hay política INSERT/UPDATE para anon; el usuario no se auto-inscribe.
-- Para que la API (service role) o triggers inserten, usar SECURITY DEFINER o service_role.

-- Asegurar que profiles tenga default role 'student' (ya en 001; por si se recrea)
ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'student';

-- Trigger: crear perfil al registrar nuevo usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'student'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
