# Run log

## brief-grill · 2026-10-13T23:00:23Z

### Inputs

- `.scratch/never-too-early-sales/handoff.md`: Han's Brief from a voice session, saved verbatim.
- `.scratch/never-too-early-sales/source-deck.pdf`: the source deck (filed in Downloads as "Agentic Workflow Basic Workshop (1).pdf").
- `.scratch/never-too-early-sales/grill-answers.md`: Han's answers in three grill rounds.
- `docs/design/design-guide.md`: the named styles.

### Output

- `brief.md`, `status: draft`, with a `process:markdown-harness` `verified` entry, committed in a3a4cb7 with `Gate: draft brief` for Han to approve.
- `docs/design/design-guide.md`: the `Board` named style Han approved, committed in 17f3455.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 3.

### Metrics

- implementor · attempt 1 · pass · 367 s
- reviewer · attempt 1 · fail · rubric "The text under every heading is Han's wording: `.scratch/<slug>/handoff.md` when it exists, his answers in this session, or a shape-only fix the run-log entry names." · 105 s · 67514 tokens
- implementor · attempt 2 · pass · 180 s
- reviewer · attempt 2 · fail · rubric "The text under every heading is Han's wording: `.scratch/<slug>/handoff.md` when it exists, his answers in this session, or a shape-only fix the run-log entry names." · 73 s · 59528 tokens
- implementor · attempt 3 · pass · 170 s
- reviewer · attempt 3 · pass · 35 s · 46963 tokens

### Notes

Han settled the open headings in the grill: Format at 20-30 minutes, a new Board style (added to the design guide), no Threads, Slide 4 (after-sale) folded into Slide 3, our own drawn visuals instead of the third-party screenshots and funnel, and Slide 2 recast as a second reason to start now.

Attempt 1 failed on four lines. Section "Why building an effective sales pipeline takes time" served more than one step. Research questions 2 and 3 were bundled and missed the "repeatable process" claim. And the implementor had written its own words into Style, Format, Slide 3 and an Open idea. Han answered each failed line, moving Slides 7–8 into "How to start doing sales", giving "Start when?" its own Section, splitting the questions into seven, and backing Actionable 3 on Slide 3. The implementor's words went back to Han's.

Attempt 2 failed only on research questions 5 and 6, where "selling early" stood in for Han's "it". Han corrected question 5: the trust comes from engaging in sales and early results such as an LOI or a filled pipeline.

Shape-only fixes: dropped the `<!-- save as -->` line and the trailing source-deck path; rewrote `generated` to `claude-code/opus-5.5`; renumbered the Slides and research questions and their `_Research:_` numbers; capitalised "Live coaching slot" when the Format sentence was split; dropped the "(Open: …)" notes on the old Slides 4, 8 and 9 once Han's answers resolved them.

Needs human: the three Open ideas lines for unchosen candidates (Editorial style, A/B Threads, a separate after-sale Slide) are the implementor's wording, which Han kept "as written".

## categorize-research · 2026-10-13T23:05:50Z

### Inputs

- `brief.md#research-questions`, questions 1–7.
- `GLOSSARY.md`, `## Research categories`.
- `docs/llm-wiki/index.md`: does not exist; no research folders exist in `docs/episodes/*/research/` or `docs/llm-wiki/research/`.

### Output

- Folder names, in question order: `FIN-0001__revenue-lags-costs-in-startups`, `GTM-0001__b2b-sales-cycle-length`, `GTM-0002__b2b-pipeline-conversion-rates`, `GTM-0003__early-selling-market-insight`, `GTM-0004__early-sales-results-build-trust`, `GTM-0005__early-selling-repeatable-process`, `GTM-0006__sales-pipeline-ramp-up-time`.
- `GLOSSARY.md`: new categories `FIN` and `GTM`, committed in 19afb33.

### Checks

- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · 52 s · 47332 tokens

### Notes

`FIN` holds question 1, because cashflow timing is not a sales question. `GTM` holds questions 2–7, because `SALES` is defined from the buyer's side of coaching and consulting, and these questions are about a startup selling its own product.

## customize-pipeline · 2026-10-13T23:07:30Z

### Inputs

- `.agents/skills/new-episode/assets/pipeline.yml`, the template at 26f560f.
- `brief.md`.
- `.scratch/never-too-early-sales/research-folders.md`, the categorize-research folder names.

### Output

- `pipeline.yml`, `status: draft`, `template: 26f560f`, committed in 6bca37e with `Gate: draft pipeline` for Han to approve.

### Checks

- `vitest` staging test: pass.

### Metrics

- implementor · attempt 1 · pass · 90 s

### Notes

Changes from the template:

- `template: 26f560f` names `main`, not `feat/89-new-episode`. The Episode branch was cut from `main`, whose template (last changed in 00c4199) is newer than feat/89's (7ac7829, an ancestor).
- `retrieval` removed: `docs/llm-wiki/index.md` does not exist, so every question is new. The research jobs and `write-dossier` need `customize-pipeline` instead.
- `write-research` expanded into seven jobs, one per question in the Brief's order, each with an `intent` that quotes its question and an output named by its categorize-research folder. `run-log.md` dropped from their references, since it holds no retrieval outcome.
- `write-research-b2b-sales-cycle-length` and `write-research-b2b-pipeline-conversion-rates` also read `source-deck.pdf`, whose funnel example (27:1 over 9.5 months) Slide 8 rests on.
- `write-dossier` wants all seven research jobs by name and reads each research file and `source-deck.pdf`.
- `write-design-spec`'s implementor reads `source-deck.pdf`, where the Board style's cashflow board comes from.
- References to missing files removed: `docs/llm-wiki/index.md` (categorize-research) and `docs/profile/han/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md` (write-dossier and write-voice-script, both agents).
