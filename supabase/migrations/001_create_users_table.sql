-- ═══════════════════════════════════════════════════════════════
-- Arbarea Users Table — Phone-Only Registration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ═══════════════════════════════════════════════════════════════

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT 'Гость',
  email TEXT,
  discount INTEGER NOT NULL DEFAULT 10,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index on phone for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- 3. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anonymous reads (for login check)
CREATE POLICY "Allow anon read by phone"
  ON public.users
  FOR SELECT
  USING (true);

-- Allow anonymous inserts (for registration)
CREATE POLICY "Allow anon insert"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Allow updates (for profile editing)
CREATE POLICY "Allow anon update"
  ON public.users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- Verify
-- ═══════════════════════════════════════════════════════════════
-- SELECT * FROM public.users LIMIT 5;
