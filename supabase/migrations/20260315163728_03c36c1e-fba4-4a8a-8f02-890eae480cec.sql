
-- Create enum for conversation status
CREATE TYPE public.conversation_status AS ENUM ('active', 'waiting_agent', 'resolved', 'bot');

-- Create enum for sender type
CREATE TYPE public.sender_type AS ENUM ('user', 'bot', 'agent');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'waiting_agent', 'contacted', 'converted');

-- Conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  customer_name TEXT,
  last_message TEXT,
  status conversation_status NOT NULL DEFAULT 'bot',
  assigned_agent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_type sender_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  customer_name TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  conversation_id UUID REFERENCES public.conversations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies: Allow authenticated users (agents) full access
CREATE POLICY "Agents can view all conversations" ON public.conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can update conversations" ON public.conversations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Agents can insert conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Agents can view all messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Agents can view all leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Agents can update leads" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Agents can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);

-- Allow anon access for webhook inserts (n8n webhook will insert without auth)
CREATE POLICY "Webhook can insert conversations" ON public.conversations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Webhook can update conversations" ON public.conversations FOR UPDATE TO anon USING (true);
CREATE POLICY "Webhook can insert messages" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Webhook can insert leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);

-- Enable realtime for messages and conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_phone ON public.conversations(phone_number);
CREATE INDEX idx_leads_status ON public.leads(status);
