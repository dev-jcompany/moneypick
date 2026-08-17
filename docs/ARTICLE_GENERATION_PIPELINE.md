# MoneyPick Article Generation Pipeline

Updated: 2026-08-18

## Overview

All Article write entry points now use the same normalization and persistence boundary:

```text
Raw Article Input
  -> Article Generation Core
  -> Validation
  -> Article Persistence
  -> moneypick_articles
```

The renderer remains backward compatible. Existing rows with empty `summary` or `faq` continue to render `body_html` through `sanitizePostHtml`. This sprint does not migrate or backfill existing rows.

## Entry points

| Entry point | Route | Shared boundary |
| --- | --- | --- |
| Admin create | `POST /api/articles` | `createArticleThroughPipeline` |
| Admin update | `PATCH /api/articles/[id]` | `updateArticleThroughPipeline` |
| Claude Desktop MCP | `saveDraft` -> draft API | draft API -> shared persistence |
| Scheduled generator | `scheduled-generator.mjs` -> draft API | local Core normalization + draft API persistence |
| Draft API fallback | `POST /api/admin/articles/draft` | `createArticleThroughPipeline` |
| `ARTICLE_PROMPT.md` workflow | Admin create/update | admin shared persistence |

Low-level Supabase writes remain in `lib/db.ts`. Entry points do not call them directly; they call `lib/articles/persistence.ts`.

## Core policy

The shared implementation is `lib/articles/generation-core.mjs`. It is ESM so both Next.js server code and the Node-based MCP/scheduled scripts can use the same executable implementation.

### Manual value priority

```text
Manual explicit valid value
  > existing valid value supplied during edit
  > Core-derived value
  > fallback
```

An explicit non-empty `summary`, valid FAQ array, related calculator list, valid `article_type`, or `pattern_id` is preserved. Empty or invalid optional structures are rebuilt where possible.

### Article type and pattern

- The Core reuses `mcp/pattern-selector.mjs#selectArticleType`.
- A valid explicit `article_type` is preserved.
- Missing or invalid types are selected from title, tags, category, and archetype.
- A supplied pattern is preserved; otherwise the type's `_01` pattern is used as the deterministic fallback.
- The scheduled generator still owns rotation history and passes its selected pattern to the Core.

### Summary schema

DB schema: `text[]`.

- Accept up to five non-empty, unique strings.
- Preserve a valid explicit array.
- Otherwise extract `<li>` values from `.mp-summary`.
- If no `.mp-summary` exists, use lead, meta description, title, and body paragraphs in that order.

### FAQ schema

DB schema: `jsonb` array of `{ q: string, a: string }`.

- Preserve valid explicit q/a entries.
- Otherwise extract `.mp-faq details > summary` and its answer paragraph.
- Empty FAQ is allowed when the Article has no meaningful FAQ.

### Calculator policy

- Preserve explicit calculator links.
- Otherwise match only known calculator keywords.
- The existing `lib/calculators/engine.mjs#generateSampleScenarios` remains the deterministic numeric source.
- The scheduled generator continues to inject deterministic scenarios before AI generation.
- No calculator is forced when no match exists.

### Official source policy

- Reuse `mcp/official-registry.mjs#matchSources`.
- Deduplicate by agency id.
- Append the registry-backed official-source section only when a match exists and the body does not already contain one.
- Agency names and URLs are never invented by the Core.

### Validation

Before a full Article is persisted, the Core checks:

- non-empty title, slug, and `body_html`;
- valid `article_type`;
- string-array summary schema;
- q/a FAQ schema;
- absence of script tags, inline event handlers, and `javascript:` URLs.

Renderer-side `sanitizePostHtml` remains unchanged as a second safety boundary.

## Persistence and partial updates

`lib/articles/persistence.ts` normalizes full create/update payloads before delegating to `lib/db.ts`. Metadata-only PATCH requests, such as thumbnail updates, remain partial and do not invent missing required Article fields.

## Compatibility and operational limits

- No DB migration or production backfill is performed.
- Existing `body_html` remains the rendering source.
- Existing empty `summary`/`faq` rows remain valid.
- The admin UI is not redesigned; new drafts derive missing structures during save.
- MCP and batch persistence must continue using the authenticated draft API.
- Windows and Dev Container development servers must not run simultaneously against the same `.next` directory.

## Verification

- Article Core, persistence, MCP protocol, renderer compatibility, and existing security tests run with Vitest.
- `scheduled-generator.mjs --dry --limit 1` verifies selection/pattern/source/calculator flow without API cost or writes.
- `npm run lint`, `tsc --noEmit`, and `npm run build` verify the complete application.
