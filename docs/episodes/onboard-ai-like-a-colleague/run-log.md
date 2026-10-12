# Run log

## brief-grill · 2026-10-12T19:40:18Z

### Inputs

- A Brief pasted as a voice handoff, saved verbatim to `.scratch/onboard-ai-like-a-colleague/handoff.md`, with two open questions: the planned length and the marketing one-liner.

### Output

- `brief.md`, `status: draft`, committed with `Gate: draft brief` in 14a1bf8.

### Checks

- `mh check`: fail on the first pass: the Analogy section held an unordered list of the four disciplines, and the section allows prose only. Pass after Han chose to inline the list as one sentence, wording kept.
- `vitest` (`tests/docs/episode-staging.test.ts`): pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, no token count

### Notes

Han settled both open questions in session: the Format's length is "closer to 10 minutes, 15 at most", and the one-liner "Stop prompting AI. Start onboarding it." stays under Open ideas, since the Brief has no heading for it. Every other heading is Han's handoff wording, untouched. No runs CSV row yet: its `run` id is assigned at the orchestrator's step 4, after both gates.

## pipeline-tailor · 2026-10-12T19:58:00Z

### Inputs

- `brief.md`, approved by Han in session (b60cd80).
- The template `.agents/skills/new-episode/assets/pipeline.yml`.
- Han's answers: a human gate after `distill`; read the earlier `amnesiac-freelancer` Episode, fold its two research files into this run's research files, then delete them.

### Output

- `pipeline.yml`, `status: draft`.

### Checks

- `vitest` (`tests/docs/episode-staging.test.ts`): pass.

### Metrics

- implementor · attempt 1 · pass · run in the orchestrator's session, no token count

### Notes

Changes from the template, each with its reason, follow.

`research-match` reads `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md` instead of `docs/llm-wiki/index.md`, which does not exist yet. Both files lack `stale_after`, so neither can be `reuse`; expect `extend` or `new`.
`research` reads the same two files, so each implementor folds their relevant Findings into its new research file, as Han asked. `retries` rises from 2 to 3: questions 2, 3 and 6 rest on disputed productivity studies, and question 6 must reconcile the novice-boost findings.
`consolidate` and `distill` no longer read `docs/profile/han/storytelling-guide.md`, `tone-guide.md` or `mental-model-guide.md`, which do not exist yet. They read `src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.ts` and `docs/research/amnesiac-freelancer-script.md` instead, so the new Episode builds on the old one without copying it.
The `distill` reviewer no longer reads the missing tone guide.
`distill` gets `gate: human`: Han presents this talk live next week and reads the Manuscript before the spec is written.

Pending outside the schema: once every `research` job has passed, the orchestrator deletes `docs/research/ai-onboarding-freelancer.md` and `docs/research/ai-amnesia-mechanics.md`, and repoints the two files that cite them (`src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.ts` line 20 and `docs/research/amnesiac-freelancer-script.md` line 3) to the new research files.
