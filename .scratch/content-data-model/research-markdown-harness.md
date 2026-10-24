# What can markdown-harness check for source trust and citations?

Research for the wayfinder ticket "What can markdown-harness check for source trust and citations?" (child of the map "Content data model and product vision"). Facts only; decisions belong to the ticket "Citations".

Researched 2026-10-25. Version under test: `@hancrafted/markdown-harness` 0.0.6, the version this repo installs (`package.json`: `"~0.0.6"`) and the latest npm and GitHub release (published 2026-10-07). Upstream: https://github.com/hancrafted/markdown-harness. Upstream `main` is 18 commits ahead of the `v0.0.6` tag; their subjects are all conformance-suite and skill-folder moves, none touches `check`, so the findings below hold for `main` as well.

Legend: **Exists** = works today with no config change; **Config** = works today by writing config in `markdown-harness.config.yaml`; **Change** = needs a change to markdown-harness itself (or code outside it).

## Short answers

| # | Question | Answer |
|---|---|---|
| 1 | Judge a source's trust by its domain | **Config**, for any markdown file: a `pattern` regex on `sources[].resource`, tested end to end. Not possible for Speaker note sources, which live in `slide.tsx`, not markdown. A domain map or tiers (domain to trust level) needs a **Change**. |
| 2 | Check that a cited id exists in another file | **Change.** No rule reads a second file. Today a reference can be checked only for form (a `pattern`) or against a literal value. |
| 3 | Consume or emit JSON Schema for frontmatter | **Change.** Neither direction exists, and the tool's own README says JSON Schema is the wrong model for it. Overlapping keywords are listed below. |

## 1. Trust by source domain

### What the config language offers

1. Frontmatter rules constrain a field by address. `sources[].resource` addresses the `resource` key of every entry of the `sources` list; one level of nesting only. [`field-address.pure.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/frontmatter-harness/lib/check/field-address.pure.ts), [`constraints.types.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/frontmatter-harness/lib/section/constraints.types.ts).
2. The constraint keys are `presence` (`required` | `optional` | `forbidden`), `minLength`, `maxLength`, `format` (`datetime` | `uri` | `actor`), `pattern`, `minItems`, `maxItems`, `itemMaxLength`, `allowed` (closed set of values, each with an `intent`) and `intent`. Set constraints across fields: `exactlyOneOf`, `anyOf`, `allOf`. Rule-level: `unknownKeys: forbidden`. [`section.types.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/frontmatter-harness/lib/section/section.types.ts).
3. `format: uri` is `^\S+$`: one token with no whitespace. No scheme list, no host rules. [`value-format.pure.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/frontmatter-harness/lib/check/value-format.pure.ts). It therefore says nothing about a domain.
4. `pattern` is an ECMAScript regex with the `u` flag, **searched, never anchored** ([`pattern-dialect.pure.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/foundation/lib/config/pattern-dialect.pure.ts)); a rule must carry an `intent` beside every `pattern`, and that sentence is what a violation reports.
5. `allowed` compares a value for equality (`entry.value === value`, [`field-constraint.pure.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/frontmatter-harness/lib/check/field-constraint.pure.ts)). It cannot match a URL by its host.

### Tested

Run with the installed `mh` 0.0.6 in a scratch folder, rule below. A note citing `https://docs.anthropic.com/en/x` passed. A note citing `https://docs.anthropic.com.evil.example/en/x` and `https://medium.com/foo` failed with `FRONTMATTER__PATTERN_MISMATCH` at `sources[0].resource` and `sources[1].resource`, each carrying the rule's `intent` and the offending value; exit code 1.

```yaml
frontmatter:
  rules:
    - ruleId: note
      folders: [notes/]
      intent: 'A note cites only high-trust domains'
      fields:
        sources[].resource:
          presence: required
          format: uri
          pattern: '^https://(docs\.anthropic\.com|platform\.claude\.com|arxiv\.org)/'
          intent: 'A source must be on a high-trust domain.'
```

So an **allowlist of domains is Config**. Limits, all from the sources above:

- The allowlist is one regex string inside the rule. Every rule that needs it repeats it; YAML anchors (`&x` / `*x`) work for sharing inside one config file (this repo's config already does it with `&title`).
- One allowlist means one trust level. A map from domain to level (for example "primary", "secondary", "unvetted"), or "a Speaker note may cite this Source directly only if its domain is level A", has no key. Two levels would be two rules selected by folder or file name, not by the value of a field.
- A rule cannot select on a field value; selection is two literal axes, `folders` and `fileNames`, in the frontmatter Module; the body-structure Module adds a `types` axis (frontmatter `type`). [`selector.types.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/config-contract/lib/selector.types.ts), [`section.types.ts` of body-structure](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/body-structure-harness/lib/section/section.types.ts).
- The check is hermetic by design (no network, no clock, no git): it cannot confirm that a link resolves or that a page is what it claims. [`docs/vision/architecture.md`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/docs/vision/architecture.md) tenet 3. A long `pattern` has no length cap; whether to add one is an open upstream issue (hancrafted/markdown-harness issue 150, "Decide whether pattern gets a length cap or a declared accepted risk").
- `mh` governs **markdown files only**. The corpus walk admits files with the lowercase `.md` extension ([`corpus-entry.pure.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/foundation/lib/tree/corpus-entry.pure.ts)). In this repo, Speaker note sources are `{ slug, url }` objects in `slide.tsx` (for example `src/components/episodes/ai-attention-span/slides/whats-really-in-the-window/slide.tsx`), so no mh rule can reach them today. Reaching them is a **Change**: either the source moves into a markdown record, or the check lives outside mh (a repo test).
- A second Module over file names and folders is on upstream's roadmap, but nothing for YAML, JSON or TypeScript sources (README "Roadmap", upstream issue 63).

### What this repo already does

- `markdown-harness.config.yaml` rule `research` (files named `research.md`, about 24 of them under `docs/llm-wiki/research/<CAT>/<ID>__<slug>/`) already requires `sources` with `minItems: 1`, `sources[].id`, `sources[].resource` (`format: uri`), `sources[].title`, `generated.by` (`format: actor`), `generated.at`, `stale_after`, and sets `unknownKeys: forbidden`. It carries **no domain constraint**.
- Its `intent` for `sources` says a source must be the work itself, "not a page about it", which is a judgment no rule checks (the `intent` text is steering for a reviewing agent, and appears in violations).
- Outside mh, this repo checks the body against the frontmatter in code: `src/lib/research-sources.pure.ts` (called from `src/lib/episode-staging-texts.pure.ts`) checks that `sources[].id` runs 1..n, each `[n]` citation has a definition `[n]: <url> "title"` whose URL equals that source's `resource`, every source is cited, and there are no footnotes. `skills/new-episode/scripts/check-sources.ts` (`npm run check:sources`) fetches each `resource` over the network and classifies it ok, dead or unverifiable.
- Skills have a separate config, `skills/markdown-harness.config.yaml`, run by `npm run check:skills`. It checks the Agent Skills frontmatter only (rule `agentskills-spec`: `name` pattern, `description` `maxLength`, `unknownKeys: forbidden`) and uses `pattern` the same way; it has nothing about sources.
- `.claude/skills/markdown-harness/SKILL.md` and `docs/markdown-harness/` (only `.gitkeep`, no activity log yet) contain no source-trust guidance.

## 2. References between files

### Exists today

- Per file only. Every rule checks one file's own frontmatter (and, for the body-structure Module, its own headings and block kinds). `check` reads only the files a rule governs, and nothing resolves a path, reads a second file or follows a link. [`corpus-governance.pure.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/frontmatter-harness/lib/check/corpus-governance.pure.ts), README "What it does today".
- Body links are not inspected. Block kinds are `prose`, `ordered-list`, `unordered-list`; everything else, including link definitions, is transparent. [`document.types.ts`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/src/packages/body-structure-harness/lib/document/document.types.ts).
- Checking a reference's **form** is **Config**: `pattern` on a field or on `refs[].id`. Tested: with `pattern: '^RQ-\d+$'` on a scalar `refs[].id`, an entry `nope` fails with `FRONTMATTER__PATTERN_MISMATCH` at `refs[1].id` while `RQ-1` passes; a pattern put on a list-valued field (`cites: [RQ-1, nope]`) fails with `FRONTMATTER__CONSTRAINT_SHAPE_MISMATCH` (string constraints on a list), so a list of ids must be a list of mappings (`refs[].id`) to be pattern-checked per entry.
- Checking against a **fixed literal** is **Config**: this repo pins `brief: ./brief.md` with `allowed` in the `staging-dossier` rule. That confirms a value, not that the file exists.
- `unknownKeys`, `exactlyOneOf`, `anyOf`, `allOf` work across fields of one file only.

### Change needed (nothing shipped)

- "The id cited here must exist as a record elsewhere" needs a rule to read a second file or an index of ids. Upstream has no such key, and the vision says no Module reads another Module's section (tenet 12) and `check` is hermetic (tenet 3: no network, no clock, no git call; same tree in, same result out).
- Related upstream work, all **open** and unshipped as of 2026-10-25:
  - Map "Map: drift-detection — binding a document to what it cites, and reporting when the target moved" (upstream issue 96): records what a governed markdown document cites, via repo-relative path plus heading slug, in a hidden ledger. Config key `drift-detection:` / `citation-binding-via-hash:`. It reports that a cited target **moved**, not that a cited id **exists**. Sub-questions still open: which citation forms enrol (issue 104: inline links, reference links, bare paths), whether the cited file must also be governed (issue 101).
  - "Add a cross-Module validation extension point before indexes" (issue 215): validators run on the **config**, not on corpus content.
  - "Move neutral frontmatter reading into foundation before indexes consumes it" (issue 211) and "Add directory subjects to check and query without synthesizing files" (issue 212): groundwork for the third Module (index files), which would generate index sections from folder contents.
  - README "Roadmap, on the horizon": "A second Module: folders and files" and "Index generation".
- How a new check would be added: upstream composes Modules in one place, `src/packages/cli/module-set.ts` (`MODULE_SET = [frontmatterModule, bodyStructureModule]`), and the recognised top-level config keys are computed from that list. There is no plugin or user-code hook. The installed package has no `main` or `exports` in `package.json` (only `bin`: `mh`, `markdown-harness`), so it cannot be imported as a library; "An importable library surface" is a roadmap item.
- Today an id-existence check must live outside mh. This repo's own precedent is `src/lib/research-sources.pure.ts` (a vitest-run pure function) and `skills/new-episode/scripts/check-sources.ts`. Research ids in this repo (`LLM-0001`) are in the **folder name** (`docs/llm-wiki/research/LLM/LLM-0001__llm-output-nondeterminism/research.md`), not in frontmatter; mh has no key that reads a folder name into a value (selectors are tokens, not captures).

## 3. JSON Schema for frontmatter

### Exists today

- Nothing consumes or emits JSON Schema. Searched the upstream repository (`src`, `docs`, `skills`, README, `.archgate`) for "JSON Schema", "AJV": the only hits are research notes and design-ADR 0001, which cite JSON Schema as prior art, plus README "Why not an existing tool".
- The README states mh belongs to the **path-attached settings** family, not the schema family: "If you read 'frontmatter schema' and pictured JSON Schema per directory, that is the wrong picture." Its stated reason for not using JSON Schema plus AJV directly: "Subtractive by construction — Core §10.2 makes a sibling subschema unable to relax what another requires"; and AJV's raw errors lose a schema's own `description` where mh reports the rule's `intent`. Dependencies are only `marked` and `yaml` ([`package.json`](https://github.com/hancrafted/markdown-harness/blob/v0.0.6/package.json)).
- What mh does emit is JSON, but not JSON Schema: every command answers in JSON (`check`: violations with `field`, `violation` code, `requirement`; `query <path>`: the rule that governs the path and a `requirements.fields` list, one object per field with its constraint keys and `intent`). Tested with `mh frontmatter query ids/new.md`: the result is `{ field, presence, pattern, intent }` objects, a list of the config's own constraint vocabulary, not a schema document. That output is the closest existing machine-readable view of what a rule expects.
- The config is YAML and its grammar is mh's own (ordered rules, first match wins, no merge; mandatory `intent` per rule). The "portable artifact" upstream names is the config language, response format and conformance corpus, not a schema export (README "What it does today").

### Overlap, for a mapping (facts about both sides)

Keyword by keyword, from the mh types above and the JSON Schema Validation spec (https://json-schema.org/draft/2020-12/json-schema-validation):

| mh key | nearest JSON Schema keyword | difference found |
|---|---|---|
| `minLength`, `maxLength` (strings only) | `minLength`, `maxLength` | same names; mh reports a collision (`CONSTRAINT_SHAPE_MISMATCH`) if the value is the wrong shape, JSON Schema ignores a keyword for other types |
| `minItems`, `maxItems` (lists only) | `minItems`, `maxItems` | same names |
| `pattern` | `pattern` | both ECMA 262, both unanchored (the JSON Schema spec says patterns are "not implicitly anchored"); mh adds the `u` flag and a mandatory `intent` |
| `allowed: [{ value, intent }]` | `enum` | mh has a per-value `intent`; JSON Schema `enum` has none |
| `presence: required` | `required` | mh means present **and non-empty**; JSON Schema `required` means present only |
| `presence: forbidden` | `not` / `false` subschema | no direct keyword |
| `unknownKeys: forbidden` | `additionalProperties: false` | similar |
| `exactlyOneOf` / `anyOf` / `allOf` (lists of field addresses) | `oneOf` / `anyOf` / `allOf` over `required` | similar |
| `format: datetime` | `format: date-time` | mh checks form only: `2026-02-30T00:00:00Z` passes; offset mandatory |
| `format: uri` | `format: uri` | mh is `^\S+$`; JSON Schema `uri` is RFC 3986 and accepts a stricter set |
| `format: actor` | none | `<producer>/<version>`, `human:<id>`, `process:<id>` |
| `itemMaxLength` | `items` plus `maxLength` | one key in mh |
| `sources[].resource` address | nested `properties` / `items` | mh reaches one level of nesting |
| rule `intent`, constraint `intent` | `description` | `intent` is mandatory per rule and appears in violations |
| `ruleId`, `folders`, `fileNames`, `excludeFiles`, ordered first-match | none | JSON Schema has no path selection or precedence |
| `assess.stale`, `stale_after` freshness | none | |

### Zod side

- Zod documents `z.toJSONSchema()`, default target Draft 2020-12 (`draft-7` also available), and `z.fromJSONSchema()`, which the page marks experimental and "not considered part of Zod's stable API" (https://zod.dev/json-schema). `.describe()` and `.meta()` register metadata on a schema (https://zod.dev/metadata); Zod's metadata page says `.meta()` is the recommended form and `.describe()` remains available.
- This repo does not depend on Zod yet (`package.json` has no `zod`), so any Zod-to-schema step is new either way.

### Change needed

- Consuming JSON Schema in an mh rule (to share one source with the Zod store schemas) needs a new config key and a validator inside mh, with a decision on the dependency admission bar (upstream ADR `ARCH-001-dependency-admission-bar`) and on the vision boundary quoted above.
- Emitting JSON Schema from an mh rule needs a new command or flag; none exists. The `query` output is the nearest structure.
- Without any change to mh, both can be kept in step by a script in this repo that reads `mh query <path>` (or the config YAML) and compares its field list with `z.toJSONSchema()` output. The mapping table above names the keywords that would need translating, and those mh keys with no JSON Schema equivalent (`actor`, `intent`, `excludeFiles`, first-match precedence).

## Sources

1. Installed package, version 0.0.6: `node_modules/@hancrafted/markdown-harness/package.json`, `README.md`, `dist/` (compiled output of the source below).
2. Upstream repository at the `v0.0.6` tag and `main`: https://github.com/hancrafted/markdown-harness (source under `src/packages/`, `docs/vision/product.md`, `docs/vision/architecture.md`, `docs/design-adr/`).
3. Upstream issues: 96, 101, 104, 105, 150, 211, 212, 215 (https://github.com/hancrafted/markdown-harness/issues).
4. npm registry record for `@hancrafted/markdown-harness` (latest 0.0.6, modified 2026-10-07).
5. This repo: `markdown-harness.config.yaml`, `skills/markdown-harness.config.yaml`, `package.json`, `src/lib/research-sources.pure.ts`, `skills/new-episode/scripts/check-sources.ts`, `.claude/skills/markdown-harness/SKILL.md`, `docs/llm-wiki/research/LLM/LLM-0001__llm-output-nondeterminism/research.md`.
6. JSON Schema Validation, Draft 2020-12: https://json-schema.org/draft/2020-12/json-schema-validation
7. Zod: https://zod.dev/json-schema and https://zod.dev/metadata
8. Experiments run locally with the installed `mh` 0.0.6 against throwaway files (domain `pattern` allowlist; id `pattern` on `refs[].id` and on a list-valued field; `mh frontmatter query`).
