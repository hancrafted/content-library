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
2. **Add a project key only for a meaning OKF lacks**, for example a research file's `question`, or the Episode a feedback file belongs to. OKF lets files carry keys it doesn't define. Name a project key in snake_case, as OKF names its own, and state its meaning in its markdown-harness rule.
3. **Never reuse an OKF name for another meaning.** When a project key clashes with an OKF key, the file moves to the OKF meaning. The known clash is `status`: ours means draft, checked or approved, and OKF's means draft, stable or deprecated. Han's approval at a gate looks like OKF's `verified: { by: human:han, at }`. Issue #122 lists each clash and the decision it needs.
4. **Pin the version.** This ADR follows OKF v0.2. When OKF publishes a new version, review the keys in use against it before adopting it.

## Considered options

- **House keys** (`researched_on`, `status: approved`): they cost nothing now, but every file would need translating before any OKF tool could read it. Rejected.
- **Full OKF conformance** (a bundle-root `index.md` declaring `okf_version`, and OKF's whole key set): OKF requires only `type`, so nothing forces this. It stays open in #122.

## Consequences

- Code reads frontmatter with a YAML parser, because OKF's `generated` and `verified` are mappings, written in block or flow form (`frontmatterField`, #123).
- A markdown-harness rule with `unknownKeys: forbidden` has to list each OKF key a file adopts.
- Moving existing keys to their OKF names (research `generated` in #121, the rest in #122) changes every governed file that carries them, and the checks that read them.
