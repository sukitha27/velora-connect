
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Remove anon SELECT policies from protected tables (keep webhook INSERT/UPDATE)
DROP POLICY IF EXISTS "Anon can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anon can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anon can view leads" ON public.leads;
DROP POLICY IF EXISTS "Anon can update leads" ON public.leads;
DROP POLICY IF EXISTS "Anon can update settings" ON public.settings;
DROP POLICY IF EXISTS "Anon can view settings" ON public.settings;

-- Settings: only authenticated can read/write
CREATE POLICY "Auth can view settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth can update settings" ON public.settings FOR UPDATE TO authenticated USING (true);
