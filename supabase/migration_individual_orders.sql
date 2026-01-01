-- Migration: Individual Orders Table
-- Description: Creates table, enables RLS, adds policies and triggers.
-- Safe to re-run (idempotent).

-- 1. Create table if not exists
create table if not exists public.individual_orders (
  id uuid default gen_random_uuid() primary key,
  order_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
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

-- 2. Enable RLS
alter table public.individual_orders enable row level security;

-- 3. Drop existing policies to avoid conflicts on re-run
drop policy if exists ind_orders_select on public.individual_orders;
drop policy if exists ind_orders_insert on public.individual_orders;
drop policy if exists ind_orders_update_admin on public.individual_orders;

-- 4. Create Policies

-- SELECT: Users see their own, Admins see all
create policy ind_orders_select
  on public.individual_orders
  for select
  to authenticated
  using (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- INSERT: Users can insert for themselves
create policy ind_orders_insert
  on public.individual_orders
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
  );

-- UPDATE: Admins can update status
create policy ind_orders_update_admin
  on public.individual_orders
  for update
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- 5. Trigger for updated_at
drop trigger if exists on_ind_orders_updated on public.individual_orders;

create trigger on_ind_orders_updated
  before update on public.individual_orders
  for each row execute procedure handle_updated_at();
