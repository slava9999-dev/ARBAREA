-- Storage & Performance Migration

-- 1. Create 'orders' storage bucket (if not exists)
insert into storage.buckets (id, name, public)
values ('orders', 'orders', true)
on conflict (id) do nothing;

-- 2. Storage Policies for 'orders' bucket

-- Allow authenticated users to upload files
drop policy if exists "Authenticated users can upload files" on storage.objects;
create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'orders' AND auth.uid()::text = (storage.foldername(name))[1] );
-- Note: Logic ensures file path starts with user_id, e.g. "user_id/filename"

-- Allow users to view their own files (and admins to view all)
-- Public access is set to TRUE for the bucket, so 'select' might be public.
-- But let's restrict it if needed. Since it's 'public: true', anyone with URL can read.
-- If you want restricted read, set public: false and add select policy.
-- Assuming public access for simplicity of sharing urls in admin panel.

-- 3. Performance Indexes
create index if not exists idx_individual_orders_user_id on public.individual_orders(user_id);
create index if not exists idx_individual_orders_created_at on public.individual_orders(created_at desc);

-- 4. Telegram ID support (Adding column to profiles if missing)
alter table public.profiles add column if not exists telegram_id text unique;
create index if not exists idx_profiles_telegram_id on public.profiles(telegram_id);
