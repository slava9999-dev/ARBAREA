-- Enable UUID extension (safe to run multiple times)
create extension if not exists "uuid-ossp";

-- Function to handle updated_at (safe to run multiple times)
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- -----------------------------------------------------------------------------
-- 1. PROFILES (Users)
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  phone text,
  role text default 'user',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for PROFILES
alter table profiles enable row level security;

-- Policies (DROP first to ensure no duplicates/errors on re-run)
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" 
  on profiles for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" 
  on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- Trigger for PROFILES
drop trigger if exists on_profiles_updated on profiles;
create trigger on_profiles_updated before update on profiles for each row execute procedure handle_updated_at();

-- -----------------------------------------------------------------------------
-- 2. PRODUCTS (Catalog)
-- -----------------------------------------------------------------------------
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for PRODUCTS
alter table products enable row level security;

drop policy if exists "Products are viewable by everyone" on products;
create policy "Products are viewable by everyone" 
  on products for select using (true);

drop policy if exists "Only service role can insert/update products" on products;
create policy "Only service role can insert/update products" 
  on products for all using (auth.role() = 'service_role');

-- Trigger for PRODUCTS
drop trigger if exists on_products_updated on products;
create trigger on_products_updated before update on products for each row execute procedure handle_updated_at();

-- -----------------------------------------------------------------------------
-- 3. ORDERS
-- -----------------------------------------------------------------------------
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  order_id text not null,
  user_id uuid references auth.users on delete set null,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for ORDERS
alter table orders enable row level security;

drop policy if exists "Users can view their own orders" on orders;
create policy "Users can view their own orders" 
  on orders for select using (auth.uid() = user_id);

drop policy if exists "Anyone can create orders" on orders;
create policy "Anyone can create orders" 
  on orders for insert with check (true);

-- Trigger for ORDERS
drop trigger if exists on_orders_updated on orders;
create trigger on_orders_updated before update on orders for each row execute procedure handle_updated_at();

-- -----------------------------------------------------------------------------
-- 4. NEW USER HANDLER (Auto-create profile)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing; -- Safe idempotent insert
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for AUTH
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
