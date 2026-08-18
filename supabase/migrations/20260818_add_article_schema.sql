-- Phase 1 foundation: additive and backward-compatible.
-- Existing rows remain unchanged and therefore have article_schema = NULL.
alter table public.moneypick_articles
  add column if not exists article_schema jsonb null;
