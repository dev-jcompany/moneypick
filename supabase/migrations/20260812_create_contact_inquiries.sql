-- MoneyPick contact inquiry persistence.
-- Browser clients have no direct access; the server uses service_role.

begin;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('advertising_partnership', 'article_tip', 'correction', 'general')),
  sender_email text not null check (char_length(sender_email) between 3 and 160),
  sender_name text check (sender_name is null or char_length(sender_name) <= 80),
  title text not null check (char_length(title) between 2 and 120),
  message text not null check (char_length(message) between 10 and 3000),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  referer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

alter table public.contact_inquiries enable row level security;

do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'contact_inquiries'
  loop
    execute format('drop policy if exists %I on public.contact_inquiries', policy_name);
  end loop;
end
$$;

revoke all on table public.contact_inquiries from public, anon, authenticated;
grant select, insert on table public.contact_inquiries to service_role;

commit;
