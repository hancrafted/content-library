# AGENTS.md

Primary agent memory for this repo. `CLAUDE.md` is a symlink to this file; edit `AGENTS.md` only.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `hancrafted/content-library`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` at the root. When an engineering skill says "ADR", it means a **design-ADR**: it goes in `docs/adr/` with `type: design-adr` front matter. Archgate ADRs in `.archgate/adrs/` are separate, and engineering skills never write them. See `docs/agents/domain.md`.
