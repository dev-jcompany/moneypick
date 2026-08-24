# MoneyPick Project Status

Updated: 2026-08-24
Git baseline: `c749645` (`master`, synchronized with `origin/master` at Sprint start)

## Article V2 Visual Sprint — local implementation complete, Production mutation pending

- Added Visual registries/planning/prompt SSOT with `MONEYPICK_MINIMAL_FLAT`, six Purposes, six Compositions, five Types, and a hard limit of 3.
- Added `visuals[]` asset metadata, `visual` references, `numberResult`, and `comparison` validation/rendering while preserving direct `image` and Legacy fallback.
- Added a server-only OpenAI `gpt-image-2` adapter, one-retry ceiling, auth/credit/rate-limit classification, partial-failure continuation, Sharp WebP optimization, safe hashed paths, and service-role Supabase upload adapter.
- Scheduled generation is opt-in with `IMAGE_GENERATION_ENABLED=true`; default behavior and existing Draft generation remain unchanged.
- Generated three DSR E2E assets with distinct PERSON_OBJECT / CENTER_FOCUS / LEFT_RIGHT compositions and saved them under `public/images/articles/` at 1400×788 WebP (13–41KB).
- Local Schema/Renderer E2E and responsive browser checks passed at 360px, 390px, and desktop. Production Storage upload and Draft creation were not executed because the standing security rule prohibits Production data-changing tests without separate operational approval.
- Runtime configuration (not committed to `.env`): `OPENAI_API_KEY`, optional `IMAGE_GENERATION_MODEL` (default `gpt-image-2`), `IMAGE_GENERATION_ENABLED=true`, `IMAGE_GENERATION_RETRY=1`, optional `ARTICLE_IMAGE_BUCKET` (default `article-images`). Keys are server-only.
- Cost guardrail: medium 1536×1024 is budgeted at approximately USD 0.05/image and USD 0.15 for a normal three-image article, plus small text-input and Storage costs. Reconfirm against the official OpenAI pricing calculator before enabling Production.
- 09:00 scheduler audit: existing `MoneypickGenerator` remains daily at 09:00 KST with six-article default and calls the same `mcp/scheduled-generator.mjs`. Visual planning is now part of that Entry Point; no second scheduler exists. Daily budget is 12–18 images, about USD 0.60–0.90/day or USD 18–27/30 days at the current planning estimate.
- Operational blocker: the 2026-08-24 09:00 task returned exit code 1, and `OPENAI_API_KEY` is currently missing. Dry mode can validate the complete call path without writes, but the next live Visual generation is not ready until the server-only key is configured.

## Executive status

- Production and the security P0 sprint are operationally complete.
- Article System V2 Phase 0 through Phase 7 are implemented: 8 of 8 roadmap phases (100%).
- The schema-aware renderer supports the initial V2 block set and falls back to legacy HTML for missing or invalid schemas.
- The admin editor supports explicit Legacy HTML or Article Schema V2 authoring with Content Type, Pattern, Variant, structured-block validation, and escaped compatibility HTML generation.
- The scheduled Article Agent generates validated V2 blocks, the homepage uses DB-backed variant cards, and article/card analytics emit the V2 performance dimensions.

## Article System V2

Phase 0 through Phase 7 implemented (Phase 2 through Phase 7 on 2026-08-24):

- Canonical Content Type registry: 8 types with explicit legacy archetype/articleType mappings
- `article_schema`: nullable JSONB added to Production; all existing rows remain `NULL`
- `ArticleSchemaV2` version 2 envelope and minimal runtime validator
- Invalid or missing schema selects the legacy rendering path
- Legacy `body_html`, `summary`, and `faq` remain unchanged
- Calculator CTA output validates registry entries, removes duplicates, and renders at most 3
- V2 block validation and rendering: summary, heading, paragraph, checklist, point, warning, example, table, calculator, official sources, and FAQ
- DB rows now pass `article_schema` into the renderer; missing/invalid schemas stay on sanitized legacy `body_html`
- Admin edit reads now use the authenticated server/service-role path rather than a browser anon query
- Admin create/edit supports V2 metadata and block JSON; invalid schemas are rejected before save
- V2 saves retain `article_schema` and generate escaped legacy `body_html` for compatibility
- Scheduled Article Agent requests structured blocks, applies canonical Content Type/Pattern and rotating A/B Variant, validates the envelope, derives compatibility HTML, and sends `articleSchema` to the authenticated draft API
- HOW_TO and TIPS_LIST now have canonical pattern definitions rather than falling back to GUIDE patterns
- Homepage recommendations use published `moneypick_articles` ordered deterministically by views and recency
- Four card variants (`featured`, `standard`, `compact`, `numbered`) are selected from article metadata
- Card clicks and article views emit GA-compatible V2 dimensions; the authenticated admin performance page aggregates internal views by Content Type × Pattern × Variant
- Environment-gated Google Analytics loading and Search Console verification metadata are implemented; actual collection remains a deployment/account configuration check

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
- SECURITY-P2: Browser logout expires the cookie, but stateless sessions cannot be force-revoked server-side before their normal expiry.

## Verification snapshot — 2026-08-24

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS |
| `npm run security:test` | PASS — 2 files, 7 tests |
| `npx vitest run tests/articles tests/security` | PASS — 10 files, 67 tests |
| `npm run security:env` | PASS — values hidden |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| Production `/` | 200 |
| Unauthenticated admin entry | 307 to login |
| `npm run build` | PASS using isolated `.next-verify`; the default shared `.next` remains locked by another local process |

### Local verification constraints

- The repository standard is Node.js 22 (`.nvmrc`), while the current shell is Node.js 24.15.0.
- Multiple local Node processes were active during the build check and the shared `.next` directory was locked.
- Before the next release verification, use Node.js 22, stop every dev/build process that uses this workspace, reinstall from the lockfile, and rerun typecheck, lint, tests, audit, and build.
