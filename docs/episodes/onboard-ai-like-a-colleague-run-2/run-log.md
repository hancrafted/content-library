# Run log

## brief-grill · 2026-10-13T14:12:40Z

### Inputs

- Existing Brief `brief.md`, taken from tag `baseline/onboard-ai-like-a-colleague/run-1` with the `## Style` section added (commit `948e887`).
- Handoff `.scratch/onboard-ai-like-a-colleague-run-2/handoff.md`.

### Output

- `brief.md`, unchanged in its body, with a `process:markdown-harness` `verified` entry, committed with `Gate: draft brief` for Han to approve.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.

### Metrics

- implementor · attempt 1 · pass · 60 s

### Notes

The handoff stated the Brief was approved with `Gate: approved brief`; the branch held no such commit and the Brief had no `verified` entry. The run stops at this gate until Han runs `approve.ts` on `brief.md` and commits with `Gate: approved brief`.

## categorize-research · 2026-10-13T14:16:30Z

### Inputs

- `brief.md#research-questions`, questions 1–6.
- `GLOSSARY.md` Research categories; `docs/llm-wiki/index.md`.

### Output

- 1 → `AIE-0007__ai-as-onboarding-a-colleague`
- 2 → `AIE-0008__individual-ai-productivity-gap`
- 3 → `AIE-0009__organizational-ai-productivity-gap`
- 4 → `AIE-0010__context-and-brief-improve-ai-output`
- 5 → `AIE-0011__risks-of-unchecked-ai-output`
- 6 → `AIE-0012__ai-delegation-as-management-discipline`
- No new category; `GLOSSARY.md` unchanged.

### Checks

- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · 25 s · 41244 tokens

### Notes

The implementor observed that `docs/llm-wiki/research/AIE-0001..0006` already answer questions 1–6 one to one; the names above are reserved only if `retrieval` decides `new` or `extend`. The job's intent has no rule for an already-answered question, so it numbers past the wiki.

## customize-pipeline · 2026-10-13T14:19:30Z

### Inputs

- Template `.agents/skills/new-episode/assets/pipeline.yml` at `feat/89-new-episode` `7ac7829`.
- `brief.md`; the six folder names from `categorize-research`.

### Output

- `pipeline.yml`, `status: draft`, `template: 7ac7829`, committed with `Gate: draft pipeline`.

### Checks

- `vitest` staging test: pass.

### Metrics

- implementor · attempt 1 · pass · 180 s

### Notes

Changes from the template:

- `write-research` expanded into six `write-research-<question-slug>` jobs, one per research question, each with its question as `intent` and its folder from `categorize-research`.
- `write-dossier` wants the six research jobs and reads each research file by name, plus `docs/llm-wiki/index.md`, so a reused llm-wiki file is in its reach.
- Removed the references `docs/profile/han/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md` from `write-dossier` and `write-voice-script`: none exists yet.
- Retries, gates and models unchanged: the Brief gives no reason to change them.
