# Run log

## brief-grill · 2026-10-14T18:35:31Z

### Inputs

- `.scratch/never-too-early-sales-run-2/handoff.md`: Han's Brief from a voice session, accepted as the starting point.
- `.scratch/never-too-early-sales-run-2/source-deck.pdf`: the source deck the Brief names.
- `docs/design/design-guide.md`: the named styles the Style line must pick from.
- Han's answers in this session to the attempt 1 reviewer lines.

### Output

- `brief.md`, `status: draft`, with a `process:markdown-harness` `verified` entry, committed with `Gate: draft brief` for Han to approve.
- `docs/design/design-guide.md`: a new `### Board` named style, worded from the Brief's Style line, at Han's word.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Notes

Attempt 1 failed on five lines. A shape-only fix covered two of them: `generated.at` was moved to the last edit, so the handoff's copied `verified` entries, including a `human:han`, no longer count. Han's answers covered the other three:

- He kept the Board style and had it added to the design guide, which listed only Editorial.
- He dropped three Open ideas: the cashflow board as spine, Editorial instead of Board, and the "Sales funel" typo.
- He changed "Live coaching slot next week" to "Live coaching slot first".

Han also answered two needs-human lines. He pointed the source deck Constraint at `reference/source-deck/design-reference.md`, and he added `_Research:_ 1` to Slide 3.

Shape-only fix: the `## Episode Design Reference` section was added for `.scratch/never-too-early-sales-run-2/source-deck.pdf`. `convert-references` writes its link target after the pipeline gate.

- Needs human: Han kept the Slide order as written. Slides 4–5 use the pipeline before Slide 7 defines it, and the cashflow payoff (Slide 6) comes before "Why it takes time". write-dossier may propose a Spine change.
- Needs human: Han kept Q5 as one question, although it covers two causes: engaging in sales, and early results.
