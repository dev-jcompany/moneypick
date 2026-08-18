# MoneyPick Project Status

Updated: 2026-08-17

## Article System V2

Phase 0 + Phase 1 foundation completed (2026-08-18):

- Canonical Content Type registry: 8 types with explicit legacy archetype/articleType mappings
- `article_schema`: nullable JSONB added to Production; all existing rows remain `NULL`
- `ArticleSchemaV2` version 2 envelope and minimal runtime validator
- Invalid or missing schema selects the legacy rendering path
- Legacy `body_html`, `summary`, and `faq` remain unchanged
- Calculator CTA output validates registry entries, removes duplicates, and renders at most 3
- V2 block renderer, Admin V2 form, and Article Agent V2 remain follow-up work

## Production

- Baseline commit: `b4607a2`
- Security baseline: applied
- Next.js: 16.3.0
- Admin security: hardened (Server Component auth + write-route auth + rate limit + logout/cookie expiry)
- Contact inquiry persistence: Production operational
- `contact_inquiries`: Production / RLS enabled, anon access blocked, service-role insert only
- Article admin writes: server/service-role (`createMoneypickArticle`/`updateMoneypickArticle`/`deleteMoneypickArticle`/`getAllMoneypickArticles` all use `serverClient()`), consistent with anon SELECT-published-only RLS policy
- Admin inquiry list: authenticated and no-store
- Automated content pipeline (`mcp/scheduled-generator.mjs`): stops immediately and exits non-zero on Anthropic credit exhaustion or partial generation failure (no longer reports false success)
- Security regression (2026-08-17): PASS — admin login, contact E2E, and article CRUD (create/read/update/publish/delete) all verified against Production; test data removed
- Production deployment: Vercel `dpl_7H53VE2aJfKtywUwWMkQkqyXufk4`, aliased to `moneypick.co.kr` / `www.moneypick.co.kr`

## Remaining follow-up

- SECURITY-P1: Distributed rate limiting (Vercel WAF/Firewall or a shared store such as Upstash Redis) — current rate limiting is per-serverless-instance memory only. Not a P0 blocker for this sprint's close.
