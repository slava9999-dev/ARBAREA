-- =====================================================================
-- ARBAREA DATABASE - FINAL SCHEMA
-- Version: 1.0.0 | Date: 2026-01-02
-- 
-- This script is idempotent (safe to run multiple times)
-- Execute in Supabase Dashboard - SQL Editor
-- =====================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- FUNCTIONS (must be created BEFORE triggers)
-- =====================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Security: revoke direct execution
REVOKE EXECUTE ON FUNCTION handle_updated_at() FROM public;

-- =====================================================================
-- 1. PROFILES (Users)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT false,
  vk_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if not exist (for updating existing DB)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_public') THEN
    ALTER TABLE public.profiles ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'vk_id') THEN
    ALTER TABLE public.profiles ADD COLUMN vk_id TEXT;
  END IF;
END $$;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id 
    OR COALESCE(is_public, false) = true
  );

DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete ON public.profiles;
CREATE POLICY profiles_delete ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Trigger
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles (is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);
CREATE INDEX IF NOT EXISTS idx_profiles_vk_id ON public.profiles (vk_id);

-- =====================================================================
-- 2. PRODUCTS (Catalog)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  category TEXT,
  subcategory TEXT,
  images JSONB,
  colors JSONB,
  sizes JSONB,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS products_select_public ON public.products;
CREATE POLICY products_select_public ON public.products
  FOR SELECT
  USING (true);

-- Admin-only modifications
DROP POLICY IF EXISTS products_admin_mod ON public.products;
CREATE POLICY products_admin_mod ON public.products
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- Trigger
DROP TRIGGER IF EXISTS on_products_updated ON public.products;
CREATE TRIGGER on_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products (in_stock);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (featured);

-- =====================================================================
-- 3. ORDERS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_phone TEXT,
  user_name TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  delivery_method TEXT,
  delivery_address TEXT,
  delivery_price NUMERIC DEFAULT 0,
  payment_url TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'pending_payment',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- SELECT: user sees own, admin sees all
DROP POLICY IF EXISTS orders_select ON public.orders;
CREATE POLICY orders_select ON public.orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- INSERT: only for self
DROP POLICY IF EXISTS orders_insert ON public.orders;
CREATE POLICY orders_insert ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: own or admin
DROP POLICY IF EXISTS orders_update ON public.orders;
CREATE POLICY orders_update ON public.orders
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() ->> 'role') = 'admin'
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- DELETE: admin only
DROP POLICY IF EXISTS orders_delete_admin ON public.orders;
CREATE POLICY orders_delete_admin ON public.orders
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Trigger
DROP TRIGGER IF EXISTS on_orders_updated ON public.orders;
CREATE TRIGGER on_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders (order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON public.orders (user_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- =====================================================================
-- 4. INDIVIDUAL_ORDERS (Custom orders)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.individual_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  user_phone TEXT,
  description TEXT NOT NULL,
  dimensions JSONB,
  details TEXT,
  file_url TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.individual_orders ENABLE ROW LEVEL SECURITY;

-- SELECT: own or admin
DROP POLICY IF EXISTS ind_orders_select ON public.individual_orders;
CREATE POLICY ind_orders_select ON public.individual_orders
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- INSERT: only for self
DROP POLICY IF EXISTS ind_orders_insert ON public.individual_orders;
CREATE POLICY ind_orders_insert ON public.individual_orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: admin only
DROP POLICY IF EXISTS ind_orders_update_admin ON public.individual_orders;
CREATE POLICY ind_orders_update_admin ON public.individual_orders
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- DELETE: admin only
DROP POLICY IF EXISTS ind_orders_delete_admin ON public.individual_orders;
CREATE POLICY ind_orders_delete_admin ON public.individual_orders
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Trigger
DROP TRIGGER IF EXISTS on_ind_orders_updated ON public.individual_orders;
CREATE TRIGGER on_ind_orders_updated
  BEFORE UPDATE ON public.individual_orders
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ind_orders_order_id ON public.individual_orders (order_id);
CREATE INDEX IF NOT EXISTS idx_ind_orders_user_id ON public.individual_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_ind_orders_status ON public.individual_orders (status);
CREATE INDEX IF NOT EXISTS idx_ind_orders_created_at ON public.individual_orders (created_at DESC);

-- =====================================================================
-- 5. DONATIONS (Optional)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  amount NUMERIC NOT NULL,
  payment_id TEXT,
  payment_url TEXT,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- SELECT: own or admin
DROP POLICY IF EXISTS donations_select ON public.donations;
CREATE POLICY donations_select ON public.donations
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- INSERT: for self
DROP POLICY IF EXISTS donations_insert ON public.donations;
CREATE POLICY donations_insert ON public.donations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON public.donations (user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations (status);

-- =====================================================================
-- 6. AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  
  RETURN NEW;
END;
$$;

-- Security
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;

-- Trigger on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================================
-- 7. SCHEMA SECURITY
-- =====================================================================

-- Schema privileges
REVOKE ALL ON SCHEMA public FROM public;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

-- Table privileges
REVOKE ALL ON public.profiles FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

REVOKE ALL ON public.products FROM public;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

REVOKE ALL ON public.orders FROM public;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

REVOKE ALL ON public.individual_orders FROM public;
GRANT SELECT, INSERT, UPDATE ON public.individual_orders TO authenticated;
GRANT ALL ON public.individual_orders TO service_role;

REVOKE ALL ON public.donations FROM public;
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

-- =====================================================================
-- DONE! Database structure:
-- profiles           - User profiles (auto-created on signup)
-- products           - Product catalog
-- orders             - Orders
-- individual_orders  - Custom/individual orders
-- donations          - Donations to master
-- =====================================================================
