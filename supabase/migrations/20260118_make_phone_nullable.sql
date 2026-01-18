-- Make phone column nullable to support email-only registration
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;

-- Ensure email is unique if used as identifier
ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
