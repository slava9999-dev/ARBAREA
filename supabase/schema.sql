-- =====================================================================
-- Улучшенный SQL-скрипт: таблицы, триггеры, политики RLS, обработчики
-- =====================================================================

-- 0. Расширение для UUID (используем pgcrypto + gen_random_uuid)
-- Преимущество: чаще доступно в Supabase; не требует uuid-ossp.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Общая триггерная функция для updated_at
-- ---------------------------------------------------------------------
create or replace function handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. PROFILES (Users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  role text default 'user',
  avatar_url text,
  is_public boolean default false, -- явный флаг публичности
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Ensure column exists if table was already created
alter table public.profiles add column if not exists is_public boolean default false;

-- Включаем RLS
alter table public.profiles enable row level security;

-- Политики доступа для profiles
-- Просмотр: только аутентифицированные пользователи могут видеть свой профиль,
-- также разрешаем чтение публичных профилей (is_public = true).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select
  on public.profiles
  for select
  to authenticated
  using (
    auth.uid() = id
    OR coalesce(is_public, false) = true
  );

-- Вставка: только аутентифицированный пользователь может создать профиль для себя
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert
  on public.profiles
  for insert
  to authenticated
  with check (
    auth.uid() = id
  );

-- Обновление: пользователь может обновлять только свой профиль
drop policy if exists profiles_update on public.profiles;
create policy profiles_update
  on public.profiles
  for update
  to authenticated
  using (
    auth.uid() = id
  )
  with check (
    auth.uid() = id
  );

-- Удаление: если необходимо запретить пользователям удалять профили, не создавайте политику.
-- Если хотите разрешить пользователю удалять свой профиль:
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete
  on public.profiles
  for delete
  to authenticated
  using (
    auth.uid() = id
  );

-- Триггер обновления updated_at
drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure handle_updated_at();

-- ЗАПРЕЩАЕМ прямое исполнение функции создания профиля не через триггер
-- (функция handle_new_user создаётся ниже; мы запретим её выполнение анонимным/аутентифицированным)
-- REVOKE следует выполнять после создания функции (см. ниже).

-- ---------------------------------------------------------------------
-- 2. PRODUCTS (Каталог)
-- ---------------------------------------------------------------------
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

-- Чтение: все аутентифицированные (или публичные) пользователи могут читать товары.
-- Если хотите, чтобы и неаутентифицированные пользователи видели товары — используйте TO public.
drop policy if exists products_select_public on public.products;
create policy products_select_public
  on public.products
  for select
  using (true); -- доступно всем (в т.ч. anon), измените на TO authenticated, если нужно

-- Запись/обновление/удаление: только админы (через claim 'role' в JWT)
-- Для корректной работы в JWT должен присутствовать claim "role".
drop policy if exists products_admin_mod on public.products;
create policy products_admin_mod
  on public.products
  for all
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

-- Триггер updated_at
drop trigger if exists on_products_updated on public.products;
create trigger on_products_updated
  before update on public.products
  for each row execute procedure handle_updated_at();

-- ---------------------------------------------------------------------
-- 3. ORDERS
-- ---------------------------------------------------------------------
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

-- SELECT: пользователь видит только свои заказы; админ видит все
drop policy if exists orders_select on public.orders;
create policy orders_select
  on public.orders
  for select
  to authenticated
  using (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'role') = 'admin'
  );

-- INSERT: только аутентифицированный пользователь может создавать заказ (user_id должен совпадать с auth.uid())
-- Если вы хотите разрешать гостевые заказы (без auth), измените политику соответственно.
drop policy if exists orders_insert on public.orders;
create policy orders_insert
  on public.orders
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
  );

-- UPDATE: пользователь может обновлять только свои заказы; админ — любые
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

-- DELETE: по умолчанию запретим пользователям удалять заказы (если нужно — добавить политику)
drop policy if exists orders_delete on public.orders;
-- (не создаём политику => delete запрещён для rls-пользователей, но service_role обходит ограничения)

-- Триггер updated_at
drop trigger if exists on_orders_updated on public.orders;
create trigger on_orders_updated
  before update on public.orders
  for each row execute procedure handle_updated_at();

-- ---------------------------------------------------------------------
-- 4. Автоматическое создание профиля при создании auth.users
-- ---------------------------------------------------------------------
-- Функция-обработчик
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Вставляем профиль: id = новый пользователь; email и имя из метаданных
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

-- Дадим исполнение только владельцу и администраторам (запретим anon/auth напрямую)
revoke execute on function public.handle_new_user() from public;
-- Owner (обычно роль owner) сохраняет право; если нужно, можно GRANT EXECUTE конкретным ролям админа.

-- Триггер на auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. Рекомендации по индексам (повышают производительность RLS)
-- ---------------------------------------------------------------------
-- Индекс на профиля по is_public (если много записей)
create index if not exists idx_profiles_is_public on public.profiles (is_public);

-- Индекс по user_id в orders
create index if not exists idx_orders_user_id on public.orders (user_id);

-- Индекс по tenant/role claims — если вы используете
-- (оставлено как пример, добавить при наличии соответствующих полей)

-- ---------------------------------------------------------------------
-- 6. Права доступа дополнительные (опционально)
-- ---------------------------------------------------------------------
-- Запретить общую схеме public полный доступ к таблицам — явные GRANT/REVOKE по желанию.
-- Пример: запретим public доступ к таблице profiles (оставляем RLS для control)
revoke all on public.profiles from public;
grant select, insert, update on public.profiles to authenticated;

-- Для products: чтение доступно всем (если хотите), но изменения — только admin
-- (grants можно настроить отдельно в зависимости от приложения)

-- =====================================================================
-- Конец скрипта
-- =====================================================================
