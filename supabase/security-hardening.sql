-- MoneyPick production security hardening
-- Run this in the Supabase SQL editor with an owner/postgres role.
-- The service_role bypasses RLS; browser/anon clients must never receive write access.

begin;

-- Core tables: reset policies so legacy "allow_all" and other permissive rules
-- cannot survive under a different policy name.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'categories',
    'tags',
    'posts',
    'notices',
    'subscribers',
    'newsletter_campaigns',
    'calculator_settings',
    'site_settings',
    'contact_inquiries',
    'moneypick_categories',
    'moneypick_articles'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);

      for policy_name in
        select pol.policyname
        from pg_policies pol
        where pol.schemaname = 'public'
          and pol.tablename = table_name
      loop
        execute format('drop policy if exists %I on public.%I', policy_name, table_name);
      end loop;
    end if;
  end loop;
end
$$;

-- Recreate only the policies whose optional tables exist in this deployment.
do $$
begin
  if to_regclass('public.categories') is not null then
    execute 'create policy "categories public read" on public.categories for select to anon using (true)';
  end if;
  if to_regclass('public.tags') is not null then
    execute 'create policy "tags public read" on public.tags for select to anon using (true)';
  end if;
  if to_regclass('public.posts') is not null then
    execute 'create policy "published posts public read" on public.posts for select to anon using (status = ''published'')';
  end if;
  if to_regclass('public.notices') is not null then
    execute 'create policy "visible notices public read" on public.notices for select to anon using (visible = true)';
  end if;
  if to_regclass('public.calculator_settings') is not null then
    execute 'create policy "calculator settings public read" on public.calculator_settings for select to anon using (true)';
  end if;
  if to_regclass('public.site_settings') is not null then
    execute 'create policy "site settings public read" on public.site_settings for select to anon using (true)';
  end if;
  if to_regclass('public.moneypick_categories') is not null then
    execute 'create policy "moneypick categories public read" on public.moneypick_categories for select to anon using (enabled = true)';
  end if;
  if to_regclass('public.moneypick_articles') is not null then
    execute 'create policy "published moneypick articles public read" on public.moneypick_articles for select to anon using (status = ''published'')';
  end if;
  if to_regclass('public.contact_inquiries') is not null then
    execute 'create policy "contact inquiries public insert" on public.contact_inquiries for insert to anon with check (
      type in (''advertising_partnership'', ''article_tip'', ''correction'', ''general'')
      and char_length(sender_email) between 3 and 160
      and char_length(title) between 2 and 120
      and char_length(message) between 10 and 3000
      and status = ''new''
    )';
  end if;
end
$$;

-- Public article images may be read but never uploaded/overwritten/deleted
-- with the browser's anon key.
drop policy if exists "article images public read" on storage.objects;
drop policy if exists "article images public upload" on storage.objects;
drop policy if exists "article images public update" on storage.objects;
drop policy if exists "article images public delete" on storage.objects;

create policy "article images public read"
  on storage.objects for select to anon
  using (bucket_id = 'article-images');

commit;

-- Verification: this result set must be empty.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
from pg_policies
where (
    schemaname = 'public'
    and tablename = any(array[
      'categories',
      'tags',
      'posts',
      'notices',
      'subscribers',
      'newsletter_campaigns',
      'calculator_settings',
      'site_settings',
      'contact_inquiries',
      'moneypick_categories',
      'moneypick_articles'
    ])
    and cmd in ('ALL', 'UPDATE', 'DELETE')
    and ('anon' = any(roles) or 'public' = any(roles))
  )
  or (
    schemaname = 'storage'
    and tablename = 'objects'
    and cmd in ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    and ('anon' = any(roles) or 'public' = any(roles))
    and coalesce(qual, '') like '%article-images%'
  )
order by schemaname, tablename, policyname;
