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

## retrieval · 2026-10-13T14:24:30Z

### Inputs

- `brief.md#research-questions`, questions 1–6, and its Learning goal, Actionables, Red thread and Analogy, to judge fit.
- `docs/llm-wiki/index.md`: six entries, AIE-0001 to AIE-0006, each read in full.

### Output

- Q1: `reuse docs/llm-wiki/research/AIE-0001__ai-as-onboarding-a-colleague/research.md`
- Q2: `reuse docs/llm-wiki/research/AIE-0002__individual-ai-productivity-gap/research.md`
- Q3: `reuse docs/llm-wiki/research/AIE-0003__organizational-ai-productivity-gap/research.md`
- Q4: `reuse docs/llm-wiki/research/AIE-0004__context-and-brief-improve-ai-output/research.md`
- Q5: `reuse docs/llm-wiki/research/AIE-0005__risks-of-unchecked-ai-output/research.md`
- Q6: `reuse docs/llm-wiki/research/AIE-0006__ai-delegation-as-management-skill/research.md`

### Checks

- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · 37 s · 77338 tokens

### Notes

Every file is fresh (`stale_after` 2027-04-13, `generated.at` 2026-10-13 by claude-code/opus-5.5) and its h1 question and Context fit the claim the Brief makes. No file carries a `verified` entry, so no human check is recorded on the corrected research. Caveats the Dossier must carry, per file:

- AIE-0001: the workshop consultant is testimony with no source; Findings 8–10 and the Anthropic, Nygard, GitHub, agents.md and memory quotes are carried over unfetched, Finding 11's quote is unverified; "amnesiac" is the Brief's word, not a source's.
- AIE-0002: the METR slowdown is disputed and marked out of date by its authors, so no "AI slows people down"; the relocation reading is inference; the BCG study used GPT-4.
- AIE-0003: "95% of pilots fail" is disputed and self-graded, its NANDA copy unverified against the MIT original; the Wharton ROI figure is self-reported; the link to complementary investment is inference.
- AIE-0004: fits only conditionally (relevant, specific, non-discoverable context, not volume); the measured studies disagree and several are preprints.
- Research gap: write-research-context-and-brief-improve-ai-output — no measured evidence for a human-written brief in non-coding knowledge work; judged a caveat, not an `extend`, because the file answers why context measurably helps.
- AIE-0005: the code-security evidence is disputed and uses 2021–22 models; the surgical checklist is not AI evidence; "definition of done" is the file's reading.
- AIE-0006: the central claim (the task, not rank, demands the discipline) is inference; the BCG 43%/17% figures are absent from the published version; the novice boost is disputed. Its h1 drops the Brief's "staff-level", cosmetic.

## write-research-ai-as-onboarding-a-colleague · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 1: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0001__ai-as-onboarding-a-colleague/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-individual-ai-productivity-gap · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 2: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0002__individual-ai-productivity-gap/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-organizational-ai-productivity-gap · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 3: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0003__organizational-ai-productivity-gap/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-context-and-brief-improve-ai-output · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 4: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0004__context-and-brief-improve-ai-output/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-risks-of-unchecked-ai-output · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 5: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0005__risks-of-unchecked-ai-output/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-ai-delegation-as-management-discipline · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 6: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0006__ai-delegation-as-management-skill/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.
