
-- Add chat_mode enum type
CREATE TYPE public.chat_mode AS ENUM ('manual', 'bot');

-- Add chat_mode column to conversations with default 'bot'
ALTER TABLE public.conversations ADD COLUMN chat_mode public.chat_mode NOT NULL DEFAULT 'bot';
