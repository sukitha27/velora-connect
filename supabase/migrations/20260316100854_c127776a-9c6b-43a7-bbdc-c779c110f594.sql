
CREATE POLICY "Anon can view conversations" ON public.conversations FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view messages" ON public.messages FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view leads" ON public.leads FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can update leads" ON public.leads FOR UPDATE TO anon USING (true);
