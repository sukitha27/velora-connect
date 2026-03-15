
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can upsert settings" ON public.settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update settings" ON public.settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anon can view settings" ON public.settings FOR SELECT TO anon USING (true);

INSERT INTO public.settings (key, value) VALUES
  ('n8n_webhook_url', ''),
  ('whatsapp_api_token', ''),
  ('whatsapp_phone_id', ''),
  ('whatsapp_business_id', ''),
  ('notify_on_waiting', 'true'),
  ('notify_sound', 'true'),
  ('auto_assign', 'false');
