-- Ensure the users table has the columns required by phone-only registration.
-- Two earlier migrations disagree: 001_create_users_table.sql defines `discount`
-- and `avatar_url`, while 20260103_create_users_table.sql does not. On a database
-- created from the latter, INSERT ... (discount) fails with
-- `column "discount" of relation "users" does not exist`, breaking registration.
-- These statements are idempotent and safe to run on any existing users table.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS discount INTEGER NOT NULL DEFAULT 10;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
