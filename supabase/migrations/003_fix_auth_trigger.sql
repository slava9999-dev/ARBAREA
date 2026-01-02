-- =====================================================================
-- FIX AUTH TRIGGER (Robust Version)
-- Use this to repair broken registration
-- =====================================================================

-- 1. Create a secure function with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Security Fix: Prevent search_path hijacking
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    phone, 
    avatar_url, 
    created_at, 
    updated_at,
    is_public
  )
  VALUES (
    NEW.id,
    NEW.email,
    -- Smart name extraction
    COALESCE(
      NEW.raw_user_meta_data ->> 'name', 
      NEW.raw_user_meta_data ->> 'full_name', 
      NEW.raw_user_meta_data ->> 'user_name',
      split_part(NEW.email, '@', 1)
    ),
    -- Phone might be in metadata or phone column
    COALESCE(NEW.phone, NEW.raw_user_meta_data ->> 'phone'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    false -- Default Private
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    -- Only update name/phone if profile doesn't have them
    name = COALESCE(profiles.name, EXCLUDED.name), 
    updated_at = timezone('utc'::text, now());
  
  RETURN NEW;
END;
$$;

-- 2. Re-create the trigger to be sure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Ensure permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.profiles TO service_role;

-- 4. Retroactive Fix (Create profiles for users who exist but have no profile)
INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT 
  id, 
  email,
  created_at,
  timezone('utc'::text, now())
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;
