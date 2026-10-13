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
