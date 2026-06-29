-- moneypick_articles 테이블 생성
create table if not exists moneypick_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null,
  en_slug     text not null unique,
  icon        text not null default '💡',
  description text not null default '',
  color       text not null default 'green',
  enabled     boolean not null default true,
  sort_order  integer not null default 100,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

insert into moneypick_categories (name, slug, en_slug, icon, description, color, enabled, sort_order)
values
  ('대출연구소', '대출연구소', 'loan', '💰', '전세대출, 주택담보대출, DSR 계산법까지 대출의 모든 것을 알려드립니다.', 'green', true, 1),
  ('부동산연구소', '부동산연구소', 'realestate', '🏠', '취득세, 중개수수료, 청약 정보 등 부동산 필수 지식을 정리합니다.', 'blue', true, 2),
  ('세금연구소', '세금연구소', 'tax', '📊', '연말정산, 종합소득세, 양도소득세 절세 전략을 안내합니다.', 'orange', true, 3),
  ('직장인연구소', '직장인연구소', 'work', '💼', '실업급여, 퇴직금, 4대보험 등 직장인이 꼭 알아야 할 정보를 제공합니다.', 'purple', true, 4),
  ('투자연구소', '투자연구소', 'invest', '📈', 'ISA, 연금저축, ETF 등 스마트한 자산 관리 방법을 알려드립니다.', 'emerald', true, 5)
on conflict (en_slug) do update set
  name = excluded.name,
  slug = excluded.slug,
  icon = excluded.icon,
  description = excluded.description,
  color = excluded.color,
  sort_order = excluded.sort_order,
  updated_at = now();

create table if not exists moneypick_articles (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        unique not null,
  category_key  text        not null,
  category_label text       not null,
  title         text        not null,
  seo_title     text,
  lead          text        not null default '',
  meta_description text,
  body_html     text        not null default '',
  summary       text[]      default '{}',
  faq           jsonb       default '[]',
  tags          text[]      default '{}',
  editor        text        not null default '머니픽 에디터',
  reading_time  text,
  hero_value    text,
  hero_label    text,
  related_calculators jsonb default '[]',
  disclaimer    text,
  thumbnail_url text,
  status        text        not null default 'draft' check (status in ('draft','published')),
  source        text,
  views         integer     default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 기존 테이블에는 create table if not exists가 새 컬럼을 추가하지 않으므로 별도로 보강합니다.
alter table moneypick_articles
  add column if not exists thumbnail_url text;

alter table moneypick_articles
  add column if not exists meta_description text;

alter table moneypick_articles
  add column if not exists seo_title text;

alter table moneypick_articles
  add column if not exists source text;

-- 기존 5개 카테고리만 허용하던 category_key check constraint를 제거합니다.
do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'moneypick_articles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%category_key%'
  loop
    execute format('alter table moneypick_articles drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists moneypick_articles_updated_at on moneypick_articles;

create trigger moneypick_articles_updated_at
  before update on moneypick_articles
  for each row execute function update_updated_at();

drop trigger if exists moneypick_categories_updated_at on moneypick_categories;

create trigger moneypick_categories_updated_at
  before update on moneypick_categories
  for each row execute function update_updated_at();

alter table moneypick_categories enable row level security;

drop policy if exists "moneypick categories public read" on moneypick_categories;
create policy "moneypick categories public read"
  on moneypick_categories for select
  using (true);

drop policy if exists "moneypick categories public insert" on moneypick_categories;
create policy "moneypick categories public insert"
  on moneypick_categories for insert
  with check (true);

drop policy if exists "moneypick categories public update" on moneypick_categories;
create policy "moneypick categories public update"
  on moneypick_categories for update
  using (true)
  with check (true);

drop policy if exists "moneypick categories public delete" on moneypick_categories;
create policy "moneypick categories public delete"
  on moneypick_categories for delete
  using (true);

-- 대표 이미지 업로드용 Storage 버킷
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 현재 관리자 화면은 Supabase anon key로 직접 업로드하므로 버킷 정책이 필요합니다.
drop policy if exists "article images public read" on storage.objects;
create policy "article images public read"
  on storage.objects for select
  using (bucket_id = 'article-images');

drop policy if exists "article images public upload" on storage.objects;
create policy "article images public upload"
  on storage.objects for insert
  with check (bucket_id = 'article-images');

drop policy if exists "article images public update" on storage.objects;
create policy "article images public update"
  on storage.objects for update
  using (bucket_id = 'article-images')
  with check (bucket_id = 'article-images');
