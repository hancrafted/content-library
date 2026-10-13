# write-design-spec grill decisions (new-episode, after run 1)

Settled with Han, 2026-10-13, in session 5909c675 (this file's grill), prompted by run 1's design questions in session cc067f5d (e.g. #103's ticket stopped on "No catalog match"). The spec for run-2 step 3 in `docs/handoff/new-episode-run-2.md`. Q numbers are the grill's.

## The job

1. Q1: A new job `write-design-spec` runs after `write-spec`, in the orchestrator session, per ticket, like `implement-episode`. Its implementor first writes the Episode's visual language (recurring motifs, motion, accent use) into the spec issue (Q9), then spawns one designer subagent per ticket in parallel; a failed rubric line goes back to that ticket's designer only.
2. Q2: The design answer lives in the ticket body, edited in place with `gh issue edit`, never as a comment (retries update, handoff decision 2).
3. Q3: Full creative freedom within the context the pipeline gives and the ADRs (FE-002, FE-007, FE-009, FE-011). The designer uses the `ui-ux-pro-max:slides` skill. A one-off Scene from `SlideFrame` and the kit's `<Title>` is allowed (FE-002 §3).
4. Q4: Every Slide is designed, not only the misses.
5. Q8: A new part or motion lives in the Slide's own folder (a server part, or its own `*.client.tsx`); it moves to `slide-shared/` once a second Slide needs it (FE-007 Do 7).
6. Q11 and Han's Q10 note: The answer names parts, tokens, props and i18n keys, plus a low-fidelity text wireframe (ASCII in a code block) for every Slide that is not a Slide library entry used as is. No rendered prototype: the rendered check stays in `implement-episode`.
7. References: Brief, Dossier, Manuscript, FE-002, FE-007, FE-009, FE-011, the Slide library, `docs/design/README.md` and `docs/design/design-guide.md`.
8. Q17 rubric:
   1. Every Slide of the ticket has a design answer.
   2. Every Slide that is not a Slide library entry used as is has a text wireframe.
   3. The design follows the spec issue's visual language.
   4. Every overruled `master:` or `motion:` names its reason.
   5. Colour, size and weight are tokens (FE-011); every import is one FE-007 §5 allows.
   6. Q18/Q23: The Slide follows FE-009: no fixed height, no clipping, Foreground clear of the chrome. A Slide is a scrolling web section, not a fixed frame: the Slide wrapper's "at least viewport height" (FE-009 §3.2) is the only height rule.
9. Schema: a `PLUGIN_SKILLS` allowlist beside `SPAWNING_SKILLS` in `src/lib/episode-pipeline-fields.pure.ts`, so the check accepts `ui-ux-pro-max:slides` without reading `~/.claude`.

## The gate

10. Q10: `gate: human`. Han's design edits are what later steer the designer.
11. Q15: Triage labels. `write-spec` files tickets `needs-triage`; Han relabels each `ready-for-agent` to approve its design; `implement-episode` refuses to start while any ticket is `needs-triage`. Han's vision: AI takes over this review; the first step is context engineering (Q21, Q22).
12. Q16: After the gate, the orchestrator rewrites every overruled `master:` and `motion:` into the Dossier, in one commit with `Source: #<ticket>`; the parallel designers never edit the Dossier.
13. Q22: The `write-design-spec` run-log Metrics carry one line per ticket, `approved as drafted` or `edited`, read from the issue's edit history. When most tickets pass unedited across runs, `gate: human` is removed.

## Around the job

14. Q6, Q13, Q20, glossary: **Slide library**: every Master slide a Slide copies from the Slide master Episode (`src/components/episodes/slide-master/slides/`, `cp -r`), and every frame component, shared part and shared motion it imports (`src/components/slide-master/`, `src/components/slide-shared/`). _Avoid_: catalog. **Master slide**: one entry of the Slide library. The Dossier's `master:` key stays. "Catalog" leaves the pipeline; the run log's `No catalog match:` becomes `No library match:`.
15. Q14/Q5: `write-dossier` proposes only a Slide library motion; the staging vitest resolves `motion:` there. When none fits, the Visual describes the wanted motion in viewer terms. `write-design-spec` may overrule it, as the specialist.
16. Q7: Every reviewer judges one baseline line: each domain concept is named by its `GLOSSARY.md` term, never an _Avoid_ word. Implementor prompts point at `GLOSSARY.md`.
17. `write-spec` writes no design questions: its rubric lines 4–5 and the tickets' "exact master … stop and comment" criterion become "build to the ticket's design answer". `No library match:` leaves the PR checklist; it is input for the designer.
18. Q18: The visual check follows FE-009's browser check: 375, 1100 and 1440 px, drawer beside, over and closed; each Slide wrapper at least viewport height, no horizontal overflow, Foreground clear of the chrome. "No taller than the viewport" in `references/implement-episode.md` goes.
19. Q25: The run-log Notes prefixes are a closed list in the `run-log-body` intent: `Blocked:`, `Needs human:`, `No library match:`, `Research gap:`. Harvesters and `open-pr` select by prefix.

## Later (LEARNINGS next steps)

20. Q21, Q24: One `harvest-run` skill at Promotion, before the staging folder is deleted, replaces issue 89's `harvest-human-profile`. It turns Han's gate edits (Brief, Manuscript, ticket edit history) into the profile guides, `docs/design/design-guide.md` included, and the run log's prefixed findings and `runs.csv` into `LEARNINGS.md` lessons.
21. Q19: `promote-episode` rewrites each Slide's `master:` and `motion:` in the Dossier from the built Slide, with a reviewer, so a promoted Dossier reflects the implementation.

## Authoring context (run-2 step 2)

22. Split by kind. Facts and rules go in `docs/design/`: which Master slides exist, which motions a Slide may import. Taste goes in `docs/design/design-guide.md`: how quiet a Slide is, what is good or bad, the run-1 Slides as "not this".
