---
type: adr
id: FE-013
title: 'Content Store'
domain: frontend
rules: true
# prettier-ignore
files: ['src/content-store/**/*.ts', 'src/episodes/**/episode-metadata.ts', 'docs/adr/0016-content-data-model.md']
# prettier-ignore
paths: ['src/content-store/**/*.ts', 'src/episodes/**/episode-metadata.ts', 'docs/adr/0016-content-data-model.md']
description: 'Every record enters the site through one content store that parses it with a Zod schema whose inferred type is its only type, every field described, and refuses a bad record at build time, naming it.'
---

# Content Store

## Context

A **record** is content data a page reads: an Episode's metadata, an Event, a Playlist. Pages, routes, the sitemap and page metadata all read records, and each reader decides what the site shows — a public page, a `noindex` page, no page.

Without one entry, records were read the way each arrived:

1. **Hand-written types:** an interface beside each record kind, checked only by `tsc`. A record missing `visibility` compiles if the field is optional, and an unlisted Episode then lands in the sitemap — failing open.
2. **Hand-rolled checks:** one module returned a list of problem sentences for its own records; another kind had none. Cross-record rules (a Playlist naming an unregistered Episode) lived wherever someone remembered them.
3. **Many readers:** any module could import a record file, so a new reader skipped every check the others ran.

Options:

- **TypeScript types plus hand checks** (the state above): no runtime parse, and type and check drift apart.
- **JSON or YAML records with JSON Schema:** the files validate, but types need codegen, and a record can no longer be checked by `tsc` where it is written.
- **A CMS or database:** a backend before the platform horizon is a stated non-goal.
- **Zod schemas in one store (chosen):** one parse at build time, the type inferred from the schema, `.describe()` as the field reference.

For this project the reasons and the model — which entities are records, how they relate, which cross-record refusals hold — live in `docs/adr/0016-content-data-model.md`. This record holds the discipline that keeps code and that model in step.

## Decision

### 1. One entry

1. Pages, routes, the sitemap and metadata MUST read records only through the store's one entry module; record files, refusals and Featured are reached by nothing else. Its `catalogue/` (slug lists, Episode id, record routes, visibility, the page catalogue behind the entry) names records without reading them.
2. The store is its own layer between the product areas and `shared/`: no React, and it reaches outside itself and `shared/` only for an Episode's metadata file, imported by the generated Episode registry, so an Episode stays one folder.
3. The schemas are a leaf importing only zod: any module above `shared/`, lib included, takes a record's type from them, so no tier needs a type of its own. A lib module gets record values as arguments.
4. A client leaf MUST NOT import the store at runtime; it gets record values as props, so Zod and the records stay out of the browser bundle.

### 2. The schema is the type

1. Each record kind MUST have exactly one schema file in the store, and the record kinds are exactly the entities the content-model diagram's `%% store:` line names (📜 Rule: `model-matches-store`).
2. A record's type MUST be inferred from its schema; nowhere in `src/` does a hand-written interface or object type describe a record — one named after a stored kind or ending in `Metadata` or `Record` (📜 Rule: `type-from-schema`).
3. Every schema field MUST carry a `.describe()` on its own chain, in a shape written inline: the schema is the field reference an agent reads (📜 Rule: `field-described`).

### 3. Fail closed

1. The store MUST parse every record and apply the cross-record refusals when it loads; a bad record throws, naming its kind, record and field, so the build and the fast suite both fail.
2. A refusal MUST NOT become a silent filter: a record is loaded whole or the build stops.
3. Which refusals exist is the model's business, held in the store's tests; this record fixes only that they fail closed.

## Do's and Don'ts

### Do's

1. **DO** read records from the entry — `import { listEpisodes } from '@/content-store/store'`. (Decision 1)
2. **DO** add a record kind as one `%% store:` entry plus one `schemas/<kind>.schema.ts`, in one change. (Decision 2, 📜 Rule: `model-matches-store`)
3. **DO** export the type from the schema — `export type Event = z.infer<typeof eventSchema>`. (Decision 2, 📜 Rule: `type-from-schema`)
4. **DO** describe each field — `date: isoDate.describe('The day the Event takes place.')`. (Decision 2, 📜 Rule: `field-described`)
5. **DO** throw a sentence that names the record — `Event 2026-10-28-axel: Playlist "x" does not exist`. (Decision 3)
6. **DO** read an Episode's kind, slug and Event from the EpisodeRef the store serves — `matchEpisode(episode.ref, …)`, `page.episode.slug` — never by parsing its Episode id. (Decision 1)

### Don'ts

1. **DON'T** import an `episode-metadata.ts`, an Event, a Playlist or the refusals from outside the store, or re-export them from its entry. (Decision 1)
2. **DON'T** import React, a Slide or the Slide master into the store. (Decision 1)
3. **DON'T** import the store's values into a `*.client.tsx` — `import type` only. (Decision 1)
4. **DON'T** write `interface EpisodeMetadata { … }` in lib, or `satisfies { slug: string }` on a record. (Decision 2)
5. **DON'T** drop a bad record and build the rest — `records.filter(isValid)`. (Decision 3)

## Consequences

**Positive:**

1. **Fails closed:** a forgotten `visibility` stops the build instead of publishing a page.
2. **One type:** schema and type cannot drift; renaming a field is one edit.
3. **One reader:** every page sees records after the same parse and refusals.
4. **Model in step:** the diagram an agent reads names exactly the kinds the store's entry loads.
5. **Self-describing:** each field's meaning sits on the field.
6. **One seam:** the platform horizon swaps the store's source behind its entry; readers change only if the entry turns async.

**Negative:**

1. **A dependency:** Zod becomes a direct dependency the whole build rests on.
2. **Indirection:** a page reads a record through a function, not a plain import.
3. **Text-matched types:** archgate erases types before parsing, so the type rule reads source text and knows a record type by its name; a record type named otherwise slips past it.
4. **Names reserved:** `Record` and `Metadata` as type-name endings, and the stored kinds' names, belong to records anywhere in `src/`.

**Risks:**

1. **Describe text rots into noise** — `.describe('the date')`. **Mitigation:** review checks a description says what a field means to the site, not its name again.
2. **The diagram moves or loses its `%% store:` line.** **Mitigation:** `model-matches-store` fails on a missing file or line, never passes silently.

## Compliance and Enforcement

1. **Rules** (`FE-013-content-store.rules.ts`, error): Decision 2.
2. **Lint** (dependency-cruiser, error; probe tests run the whole rule set over a throwaway tree): Decision 1.
   Tests are exempt from Decision 1.2's one upward edge: the store's folder-to-record test reads the Episodes area's folder walker.
3. **Tests** (fast suite): Decision 3 — each refusal throws its sentence for a bad record.

**Manual review duties:** descriptions say what a field means; refusals name kind, record and field and never filter silently (Decision 3); no reader bypasses the entry through a re-export; scripts and tests outside `src/` read records through the entry too.

**Exceptions:** raise a separate ADR; human approval required.

## References

- `docs/adr/0016-content-data-model.md` — the model, the `%% store:` list, the refusals and why.
- [Zod — basics and `.describe()`](https://zod.dev/) — schemas, `z.infer`, metadata.
