-- =====================================================================
-- Migration 002: Audit Log
-- Description: Adds audit logging for critical tables
-- Created: 2026-01-02
-- =====================================================================

-- Audit log table
create table if not exists public.audit_log (
  id uuid default gen_random_uuid() primary key,
  table_name text not null,
  record_id uuid not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid references auth.users(id) on delete set null,
  ip_address inet,
  user_agent text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audit_log enable row level security;

-- Only admins can read audit logs
drop policy if exists audit_log_select_admin on public.audit_log;
create policy audit_log_select_admin
  on public.audit_log
  for select
  to authenticated
  using ((auth.jwt() ->> 'role') = 'admin');

-- service_role can insert (for triggers)
drop policy if exists audit_log_insert_service on public.audit_log;
create policy audit_log_insert_service
  on public.audit_log
  for insert
  to service_role
  with check (true);

-- Performance indexes
create index if not exists idx_audit_log_table_name on public.audit_log (table_name);
create index if not exists idx_audit_log_record_id on public.audit_log (record_id);
create index if not exists idx_audit_log_action on public.audit_log (action);
create index if not exists idx_audit_log_created_at on public.audit_log (created_at desc);
create index if not exists idx_audit_log_user_id on public.audit_log (user_id);

-- Audit trigger function
create or replace function audit_trigger_fn()
returns trigger
language plpgsql
security definer
as $$
declare
  audit_row public.audit_log;
begin
  audit_row.id := gen_random_uuid();
  audit_row.table_name := TG_TABLE_NAME::text;
  audit_row.user_id := auth.uid();
  audit_row.created_at := timezone('utc'::text, now());
  
  if (TG_OP = 'DELETE') then
    audit_row.action := 'DELETE';
    audit_row.record_id := old.id;
    audit_row.old_data := to_jsonb(old);
    audit_row.new_data := null;
  elsif (TG_OP = 'UPDATE') then
    audit_row.action := 'UPDATE';
    audit_row.record_id := new.id;
    audit_row.old_data := to_jsonb(old);
    audit_row.new_data := to_jsonb(new);
  elsif (TG_OP = 'INSERT') then
    audit_row.action := 'INSERT';
    audit_row.record_id := new.id;
    audit_row.old_data := null;
    audit_row.new_data := to_jsonb(new);
  end if;
  
  insert into public.audit_log values (audit_row.*);
  
  if (TG_OP = 'DELETE') then
    return old;
  else
    return new;
  end if;
end;
$$;

-- Apply audit triggers to critical tables
drop trigger if exists audit_orders on public.orders;
create trigger audit_orders
  after insert or update or delete on public.orders
  for each row execute function audit_trigger_fn();

drop trigger if exists audit_individual_orders on public.individual_orders;
create trigger audit_individual_orders
  after insert or update or delete on public.individual_orders
  for each row execute function audit_trigger_fn();

-- Grants
grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;

-- =====================================================================
-- End of Migration 002
-- =====================================================================
