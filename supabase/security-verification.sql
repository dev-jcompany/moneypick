-- Read-only checks to run after supabase/security-hardening.sql.

-- 1) RLS must be enabled on every application table that exists.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname = any(array[
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
order by c.relname;

-- 2) Review the complete effective policy inventory.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where (schemaname = 'public' and tablename = any(array[
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
  ]))
  or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, cmd, policyname;

-- 3) This query must return zero rows: anon/public write policies.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
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
    and cmd in ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    and ('anon' = any(roles) or 'public' = any(roles))
  )
  or (
    schemaname = 'storage'
    and tablename = 'objects'
    and cmd in ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    and ('anon' = any(roles) or 'public' = any(roles))
    and (coalesce(qual, '') like '%article-images%'
      or coalesce(with_check, '') like '%article-images%')
  );

-- 4) This query must return zero rows: no browser-role grants on inquiries.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'contact_inquiries'
  and grantee in ('anon', 'authenticated', 'PUBLIC');
