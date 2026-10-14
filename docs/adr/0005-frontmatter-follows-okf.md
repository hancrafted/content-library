---
type: design-adr
status: proposed
---

# Frontmatter follows Google's Open Knowledge Format

Every markdown file here carries YAML frontmatter that agents read and markdown-harness checks. It follows Google's Open Knowledge Format (OKF) v0.2 ([`okf/SPEC.md`](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)) as closely as it can. Where OKF has a key for a meaning, a file uses that key under its OKF name, with OKF's shape and meaning. A project key is added only for a meaning OKF has no key for. A shared vocabulary means a checker is written once and works in any repo. OKF already names the trust and lifecycle facts this project records: who generated a file, who verified it, and when it goes stale. Our own names for them would have to be translated later.

## Rules

1. **Look up OKF first.** Before adding a key, find it in the spec. When an OKF key carries the meaning, copy it exactly:
   - the name, such as `generated`, not `generated_at` or `researched_on`;
   - the shape, such as the nested `generated: { by, at }`;
   - its value formats: actors as in §7 (`claude-code/opus-5.5`, `human:han`, `process:<id>`), and timestamps as ISO 8601 datetimes with an explicit UTC offset.
2. **Add a project key only for a meaning OKF lacks**, for example the Episode a feedback file belongs to. OKF lets files carry keys it doesn't define. Name a project key in snake_case, as OKF names its own, and state its meaning in its markdown-harness rule.
3. **Never reuse an OKF name for another meaning.** When a project key clashes with an OKF key, the file moves to the OKF meaning. The clash was `status`: ours meant draft, checked or approved, and OKF's means draft, stable or deprecated. The gate stage moved to `verified` and `status` keeps OKF's lifecycle meaning (see [Mappings](#mappings)).
4. **Pin the version.** This ADR follows OKF v0.2. When OKF publishes a new version, review the keys in use against it before adopting it.

## Mappings

Settled in #122. Each is the OKF key for a meaning the project records.

1. **Gates are trust tiers.** A staging file that passes its checks gets `verified: { by: process:markdown-harness, at }` (machine-confirmed); Han's approval adds `{ by: human:han, at }` (human-reviewed), written by the new-episode skill's `approve.ts`, never typed. A `verified` entry counts only while its `at` is at or after `generated.at`, so an edit after approval re-opens the gate.
2. **Staging is `status: draft`.** OKF reads an absent `status` as `stable`; staging files say `draft` until Promotion removes the line.
3. **Agent-written files carry `generated: { by, at }`.** Required on Brief, Dossier, feedback and research files: `verified.at` is compared against it.
4. **Research Sources are frontmatter `sources:`** (`id`, `resource`, `title`), with numeric `id`s 1..n, cited in the body as `[n]` CommonMark shortcut reference links; a link reference definition `[n]: <url> "title"` per source closes the body, so `[n]` opens the source in one click, and footnotes and the body list go. The staging test checks that every cited `[n]` has a definition, each definition URL equals `sources[id=n].resource`, and ids are 1..n. Access dates are not recorded: a ledger would hold them if ever needed.
5. **Every governed file has `type` and `title`**, the title equal to its h1, for retrieval. `description` is required only where an `index.md` lists the file, because the index copies it.
6. **`docs/llm-wiki/` is a declared OKF bundle** (`okf_version` in its `index.md`). The rest of `docs/` follows OKF key by key without the claim.
7. **Not adopted:** `resource` (our concepts are abstract) and `tags` (no consumer). `pipeline.yml` is YAML config, not a markdown file, and keeps its own `status`.

## Considered options

- **House keys** (`researched_on`, `status: approved`): they cost nothing now, but every file would need translating before any OKF tool could read it. Rejected.
- **Full OKF conformance** for the whole repo (a bundle-root `index.md` declaring `okf_version`): ADRs and handoffs carry no frontmatter, so the claim would be false. Declared for `docs/llm-wiki/` only.
- **A project `gate:` key** for Han's approval: one scalar, cheap to read, but invisible to any OKF reader and the same meaning as OKF's `verified`. Rejected.
- **`last_modified` for a source's access date**: OKF's key means when the source changed, a different meaning (rule 3). Rejected, with the date itself.

## Consequences

- Code reads frontmatter with a YAML parser, because OKF's `generated` and `verified` are mappings, written in block or flow form (`frontmatterField`, #123).
- A markdown-harness rule with `unknownKeys: forbidden` has to list each OKF key a file adopts.
- Moving existing keys to their OKF names (research `generated` in #121, the rest in #122) changes every governed file that carries them, and the checks that read them.
- Gate code (the new-episode status script, the orchestrator's checks) reads `verified` and `generated.at` instead of `status`.
