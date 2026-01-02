-- =====================================================================
-- Migration 001: Initial Schema
-- Description: Core tables, functions, triggers, RLS policies
-- Created: 2026-01-02
-- =====================================================================

-- 0. Extensions
create extension if not exists pgcrypto;

-- =====================================================================
-- FUNCTIONS (MUST BE DEFINED FIRST - before any triggers)
-- =====================================================================

-- Trigger function for auto-updating updated_at
create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

-- Revoke direct execution from public (security)
revoke execute on function handle_updated_at() from public;

-- =====================================================================
-- 1. PROFILES (Users)
-- =====================================================================
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  role text default 'user',
  avatar_url text,
  is_public boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Ensure column exists if table was already created
alter table public.profiles add column if not exists is_public boolean default false;

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
drop policy if exists profiles_select on public.profiles;
create policy profiles_select
  on public.profiles
  for select
  to authenticated
  using (
    auth.uid() = id
    OR coalesce(is_public, false) = true
  );

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- Trigger
drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure handle_updated_at();

-- Indexes
create index if not exists idx_profiles_is_public on public.profiles (is_public);
create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_phone on public.profiles (phone);

-- =====================================================================
-- 2. PRODUCTS (Catalog)
-- =====================================================================
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null,
  old_price numeric,
  category text,
  subcategory text,
  images jsonb,
  colors jsonb,
  sizes jsonb,
  in_stock boolean default true,
  featured boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

-- Public read access
drop policy if exists products_select_public on public.products;
create policy products_select_public
  on public.products
  for select
  using (true);

-- Admin-only modifications
drop policy if exists products_admin_mod on public.products;
create policy products_admin_mod
  on public.products
  for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- Trigger
drop trigger if exists on_products_updated on public.products;
create trigger on_products_updated
  before update on public.products
  for each row execute procedure handle_updated_at();

-- Indexes
create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_in_stock on public.products (in_stock);
create index if not exists idx_products_featured on public.products (featured);

-- =====================================================================
-- 3. ORDERS
-- =====================================================================
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  user_phone text,
  user_name text,
  items jsonb not null,
  subtotal numeric not null,
  shipping numeric default 0,
  total numeric not null,
  delivery_method text,
  delivery_address text,
  delivery_price numeric,
  payment_url text,
  payment_id text,
  status text default 'pending_payment',
  tracking_number text,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- SELECT: User sees own orders, admin sees all
drop policy if exists orders_select on public.orders;
create policy orders_select
  on public.orders
  for select
  to authenticated
  using (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- INSERT: Only authenticated users for themselves
drop policy if exists orders_insert on public.orders;
create policy orders_insert
  on public.orders
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- UPDATE: User can update own orders, admin can update all
drop policy if exists orders_update on public.orders;
create policy orders_update
  on public.orders
  for update
  to authenticated
  using (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role') = 'admin'
  )
  with check (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- DELETE: Admin only (P0 FIX - was missing!)
drop policy if exists orders_delete_admin on public.orders;
create policy orders_delete_admin
  on public.orders
  for delete
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin');

-- Trigger
drop trigger if exists on_orders_updated on public.orders;
create trigger on_orders_updated
  before update on public.orders
  for each row execute procedure handle_updated_at();

-- Indexes (P0 FIX - critical for performance!)
create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_order_id on public.orders (order_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_user_email on public.orders (user_email);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- =====================================================================
-- 4. INDIVIDUAL ORDERS (Custom orders)
-- =====================================================================
create table if not exists public.individual_orders (
  id uuid default gen_random_uuid() primary key,
  order_id text not null,
  -- P0 FIX: Changed from CASCADE to SET NULL for consistency
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  user_name text,
  user_phone text,
  description text not null,
  dimensions jsonb,
  details text,
  file_url text,
  file_name text,
  status text default 'pending',
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.individual_orders enable row level security;

-- SELECT: User sees own, admin sees all
drop policy if exists ind_orders_select on public.individual_orders;
create policy ind_orders_select
  on public.individual_orders
  for select
  to authenticated
  using (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- INSERT: Users can insert for themselves
drop policy if exists ind_orders_insert on public.individual_orders;
create policy ind_orders_insert
  on public.individual_orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- UPDATE: Admin only
drop policy if exists ind_orders_update_admin on public.individual_orders;
create policy ind_orders_update_admin
  on public.individual_orders
  for update
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- DELETE: Admin only (P0 FIX - was missing!)
drop policy if exists ind_orders_delete_admin on public.individual_orders;
create policy ind_orders_delete_admin
  on public.individual_orders
  for delete
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin');

-- Trigger (now safe - handle_updated_at is defined above)
drop trigger if exists on_ind_orders_updated on public.individual_orders;
create trigger on_ind_orders_updated
  before update on public.individual_orders
  for each row execute procedure handle_updated_at();

-- Indexes (P0 FIX - critical for performance!)
create index if not exists idx_ind_orders_order_id on public.individual_orders (order_id);
create index if not exists idx_ind_orders_user_id on public.individual_orders (user_id);
create index if not exists idx_ind_orders_status on public.individual_orders (status);
create index if not exists idx_ind_orders_created_at on public.individual_orders (created_at desc);

-- =====================================================================
-- 5. AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, name, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Security: Revoke direct execution
revoke execute on function public.handle_new_user() from public;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- 6. SCHEMA SECURITY (P0 FIX)
-- =====================================================================
-- Revoke default public schema privileges
revoke all on schema public from public;
grant usage on schema public to authenticated;
grant usage on schema public to service_role;

-- Table-level grants
revoke all on public.profiles from public;
grant select, insert, update, delete on public.profiles to authenticated;

revoke all on public.products from public;
grant select on public.products to anon;
grant select on public.products to authenticated;
grant all on public.products to service_role;

revoke all on public.orders from public;
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;

revoke all on public.individual_orders from public;
grant select, insert, update on public.individual_orders to authenticated;
grant all on public.individual_orders to service_role;

-- =====================================================================
-- End of Migration 001
-- =====================================================================
