# Handoff: from the run-1 baseline to run 2 of the new-episode pipeline

For Han and any agent picking up the `new-episode` pipeline after its first real run. The run built the Episode `onboard-ai-like-a-colleague` end to end. Han reviewed it on 2026-10-13: underwhelming, as expected. It is frozen as the baseline the next run improves against. This file holds everything needed to continue without the session that ran it.

## Where everything is

| What                                  | Where                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline (frozen)                     | tag `baseline/onboard-ai-like-a-colleague/run-1` → commit `33c2da4`                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Episode branch and worktree           | `episode/onboard-ai-like-a-colleague`, `.worktrees/episode-onboard-ai-like-a-colleague`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Template                              | The template is on `main`: `feat/89-new-episode` merged in [#97](https://github.com/hancrafted/content-library/pull/97) (`5248cea`) and takes no more work. Run 1 used template `5b77640`; its lessons are in `edeb31c`                                                                                                                                                                                                                                                                                           |
| Draft PR                              | [#98](https://github.com/hancrafted/content-library/pull/98), `episode/onboard-ai-like-a-colleague` → `feat/89-new-episode`, closed as the run-1 baseline, with 53 `Needs Han` items                                                                                                                                                                                                                                                                                                                              |
| Spec and tickets (closed as baseline) | [#99](https://github.com/hancrafted/content-library/issues/99) spec; [#100](https://github.com/hancrafted/content-library/issues/100) wiring and the-gap; [#101](https://github.com/hancrafted/content-library/issues/101) thought-experiment; [#102](https://github.com/hancrafted/content-library/issues/102) from-doing-to-managing; [#103](https://github.com/hancrafted/content-library/issues/103) your-move. Each ticket body holds a `Design answer (ui-ux-pro-max:slides)` and comments with open points |
| Staging files                         | `docs/episodes/onboard-ai-like-a-colleague/`: `brief.md` (approved), `pipeline.yml` (approved), `research/AIE-0001..0006`, `dossier.md` (checked), `manuscript.md` (approved), `run-log.md` (one entry per job run)                                                                                                                                                                                                                                                                                               |
| Per-agent metrics                     | `docs/episodes/runs.csv`, run id `2026-10-12T19:22:40Z`                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Built Episode                         | `src/components/episodes/onboard-ai-like-a-colleague/`, served at `/episode/onboard-ai-like-a-colleague`                                                                                                                                                                                                                                                                                                                                                                                                          |
| Template lessons                      | `.agents/skills/new-episode/LEARNINGS.md` → `## Lessons`, 12 items                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Orchestrator session                  | Claude Code session `cc067f5d-6c5e-44c4-8219-d4d5a52ca2a7`, transcript `~/.claude/projects/-Users-han-Developer-content-library--worktrees-feat-89-new-episode/cc067f5d-6c5e-44c4-8219-d4d5a52ca2a7.jsonl`; read it with `archgate session-context claude-code show cc067f5d-6c5e-44c4-8219-d4d5a52ca2a7`                                                                                                                                                                                                         |
| Parallel work                         | The `write-design-spec` grill is settled: `docs/handoff/write-design-spec-decisions.md`                                                                                                                                                                                                                                                                                                                                                                                                                           |

## What run 1 showed

- **The pipeline runs.** All 16 jobs reached `done`, with no job blocked. Research and writing jobs passed review mostly on their second attempt, and `implement-episode` passed on attempt 2. The machinery is sound: worktree isolation, retries, the status script and the run log.
- **The output is only as good as the spec, and Han wrote none of it.** Han approved the Brief, the pipeline and the Manuscript gate without reviewing the Dossier or the Manuscript in depth. Everything downstream (tickets, Slides, Voice script) inherited agent wording and agent structure.
- **Slide design has no owner.**
  - `write-dossier` names a "catalog" Slide or labels it `No catalog match`, and nothing designs the missing ones. Five of nine Slides had no match; in the session, one `ui-ux-pro-max:slides` subagent per ticket designed them, with no design context from Han.
  - The Dossier named a motion that no Slide can import (FE-007), so the Episode shipped without motion.
- **The checklist is too long to act on.** PR #98 carries 53 `Needs Han` items. Most are research caveats. They are best used as inputs while Han writes the Dossier, not triaged one by one.

## Priorities

In order. Each step says what it needs, what it produces, and who does it.

### 1. The template change for one Dossier, and Han's in-depth gate

The Dossier and the Manuscript merge into one staging file (D3), and Han reviews it in depth at its gate instead of writing it beforehand (D2).

- **Template change (agent work, before run 2):** the Dossier merge and `write-voice-script` (#106), with the other blocking issues under _Settled decisions_.
- **Han's part in run 2:** read the drafted Dossier in depth (spine, Visuals, Speaker notes with citations, Voice script) and edit it before approving. The `Gate:` pair of commits then shows his edits, which is what teaches the agents his style (SKILL.md, _After the run_).
- **Input for that review:** the Brief, the corrected research (#112), and the run-1 `dossier.md` and `manuscript.md` at the tag as examples of "not this".

### 2. Han provides general Slide authoring context: settled

Settled in a grill on 2026-10-13 (session 451b6f31). The decisions are in `docs/handoff/slide-authoring-context-decisions.md`, the spec for this step. It absorbs D11 (meaning colours), LEARNINGS 3 (importable motion) and LEARNINGS 4 (**Slide library** and **Master slide** in `GLOSSARY.md`). LEARNINGS 2 is now step 3.

- **Agent work, blocking run 2:**
  - the design guide and the Slide library (#127);
  - meaning colours (#128);
  - CSS motion (#129);
  - a `## Style` section in the Brief (#130).
- #127 and #129 also block step 3 (#118).
- **Needs Han, not blocking:** where a shared popover part lives (#131).

### 3. The `write-design-spec` job and its gate

Settled in a grill (session 5909c675); the decisions are in `docs/handoff/write-design-spec-decisions.md`, the spec for this step.

- **Shape:** after `write-spec`, in the orchestrator session. It writes the Episode's visual language into the spec issue, then one `ui-ux-pro-max:slides` designer per ticket designs every Slide into the ticket body, with a text wireframe for each new design.
- **Gate:** tickets are filed `needs-triage`; Han approves a design by relabelling its ticket `ready-for-agent`. The run log records each ticket as approved as drafted or edited, so the gate can become an AI review on evidence.
- **Needs:** step 2's authoring context as its reference, and the run-1 ticket `Design answer` bullets as worked examples of what not to stop at.
- **Then:**
  - `write-spec` stops turning `No catalog match` lines into "stop and comment" questions;
  - the orchestrator rewrites overruled `master:` and `motion:` into the Dossier;
  - `implement-episode` builds from the approved design answers.

### 4. Apply the mechanical lessons

Agent work, parallel to steps 1–3. These are LEARNINGS items that need no decision from Han:

- LEARNINGS 1: Let the orchestrator run `implement-spec`: drop `disable-model-invocation`, or make the reference ask Han.
- LEARNINGS 5: Make the visual check load each Slide by its `#anchor`, so its content mounts, and record the mounted descendant count.
- LEARNINGS 6: Assign post-build step 8 (episode-text capture and `PUBLISHED_SLUGS`) to the wiring ticket.
- ~~LEARNINGS 7~~: superseded by D9, the Title slide's own optional Voice script (#111).
- LEARNINGS 8: Make the review fixed point the last commit before `implement-episode`.
- LEARNINGS 9: Make `open-pr` keep an existing PR's base.
- LEARNINGS 10: Have the status script show a `gate: human` job as `gate` until its output is approved.
- LEARNINGS 11: Resolve the "verbatim" contradiction in `write-spec.md`.
- LEARNINGS 12: Stop `next dev` rewriting `AGENTS.md`, for example with `agentRules: false` (see `docs/handoff/slide-master-harness-findings.md` F5).

Through `tdd`, `code-review` and `commit`, on a branch from `main` (`npm run wt:new -- <branch>`) with its own PR to `main`. The same holds for the template work of steps 1 and 3.

### 5. Run 2 and compare against the baseline

- **Start (D1):**
  - Branch `episode/onboard-ai-like-a-colleague-run-2` from `main`, which carries the template with steps 1, 3 and 4 merged.
  - New slug `onboard-ai-like-a-colleague-run-2`; check out only `brief.md` from the tag (`git show baseline/onboard-ai-like-a-colleague/run-1:docs/episodes/onboard-ai-like-a-colleague/brief.md`). The slug is renamed back before production.
  - Add the `## Style` section to that `brief.md` at run-2 start, with the text of decision 14 in `slide-authoring-context-decisions.md` (editorial, with its audience reason), placed after `## Audience`; the Brief check (#130) requires it.
  - Correct the six run-1 research files and move them into `docs/llm-wiki/research/` with index lines (#112), so `retrieval` is tested. Expect `reuse` for all six; then no `write-research` runs.
  - Run `/new-episode` on the approved Brief and note the new run id.
- **Compare:**
  - Diff the built Episode against `baseline/onboard-ai-like-a-colleague/run-1`.
  - Compare the `runs.csv` rows per job: attempts, failed rubric lines, tokens. The research row is not comparable when retrieval reuses everything.
  - Compare the length of the `Needs Han` checklist; run 1's 53 items stay with the baseline (D4).

## Dependencies

```text
1 agent: one Dossier (#106) ─────────────────────────────────────────────┐
2 agent: Slide authoring context (#127–#130) ─► 3 write-design-spec job ─┤
4 agent: mechanical lessons ─────────────────────────────────────────────┴─► 5 run 2
```

Steps 1, 2 and 4 can run at the same time. Step 3 waits on step 2, and run 2 waits on all four.

## Settled decisions

Settled with Han on 2026-10-13 in the run-2 decisions grill. D9–D12 came from the run-1 harness assessment. Promotion-only questions (the `slide.md` rule, parity tests, German ownership, _du_ or _Sie_) and the Slide authoring context get their own grills.

- **D1. Run 2's branch: a fresh branch and a new slug.** `episode/onboard-ai-like-a-colleague-run-2` from `main`, slug `onboard-ai-like-a-colleague-run-2`, only `brief.md` from the tag; renamed back before production. The run-1 research moves into the llm-wiki, corrected, so `retrieval` is tested (#112). _Why:_ #98 is closed and run 1's branch sits on `feat/89-new-episode` with the built Episode; a new slug keeps the two runs apart until the end.
- **D2. Han-authored staging: moot.** Run 2 runs `/new-episode` fresh from the approved Brief; the jobs always write, and Han reviews the Dossier in depth at its gate. _Why:_ Han does not yet trust agent text as his voice, so his time goes into the review, which the gate diff records.
- **D3. Gate placement: one Dossier, one gate.** The Manuscript merges into the Dossier (`dossier.md`; Manuscript is an _Avoid_ word). `write-dossier` writes the spine, Visuals, Speaker notes with citations and one beat per Voice script segment; `write-voice-script` turns each beat into spoken text and changes nothing else, enforced by a staging test, not a schema key. `gate: human` after `write-voice-script`. No reading-copy script for now. Design-ADR 0004 and `GLOSSARY.md` are amended (#106). _Why:_ the Manuscript was a rendering of the Dossier kept in step by a test, Promotion merges the two anyway, and one file means one review and one diff. Two jobs keep two crafts apart, so a failed tone line reruns only the voice.
- **D4. The 53 PR items: three kept, the rest stay with the baseline.** The 17 factual research errors are fixed before the research is reused (#112); two template gaps get issues: the Title and section slides' Visual (#113), and draft metadata (#114). Six are already covered (LEARNINGS 11, D7, D9, D11, D12, #85); 28 concern run 1's own text. _Why:_ retrieval judges freshness and fit, not accuracy, so uncorrected files would carry run 1's caveats into run 2's checklist.
- **D5. Mark agent edits: three marks.** An `Agent: <job>` trailer on agent commits, an `Edited-by: <job>` footer on agent ticket edits, and a run-log line per agent ticket edit (#107). _Why:_ Han preferred the trailer he knows over a new mechanism (an author-field variant was offered); without marks the gate diffs and edit history teach nothing.
- **D6. Manuscript heading or on-screen title: the h3, with an optional override.** The Dossier h3 is the table-of-contents title and anchor; an optional `title:` line in the Visual names a different on-screen title (#110). _Why:_ some run-1 retitles were better on screen; this keeps them, but written down instead of made silently in write-spec or the design answer.
- **D7. Accept `motion: none`: yes.** It means the Slide carries no motion; step 2 settles when to use it (#108). _Why:_ the Slide library holds no Slide motion today, so without `none` every run-2 Visual would fail the check or name a motion that cannot be built, as in run 1.
- **D8. `approved` in staging: Han accepted the file at its gate.** Promotion is marked by the file's location, not its status (#109). _Why:_ one meaning everywhere; the Brief and pipeline already use it that way.
- **D9. Title slide Voice script: an optional slot, built now.** No prose under the Dossier h1 except an optional `#### Speaker notes` and `#### Voice script`, which the writing jobs leave out and a feedback round adds. The Title slide gets the slot (amends `FE-004-slide-architecture` §6); at Promotion the h1 block moves to the Episode folder's own text file (#111). _Why:_ Han will add a Title-slide voice in the feedback loop; building the slot first keeps the Dossier, the code and Promotion in agreement. Run 1's remap of the h1 paragraph onto `the-gap` (LEARNINGS 7) is replaced.
- **D10. Reusing a Slide library layout: already settled.** A Master slide is copied with `cp -r`; a part moves to `slide-shared/` once a second Slide needs it (`write-design-spec-decisions.md` items 5 and 14).
- **D11. What the meaning colours may colour: moved to step 2**, the Slide authoring context, and settled there: only their meaning (`slide-authoring-context-decisions.md` decision 1, #128).
- **D12. Visual-check widths: already settled.** 375, 1100 and 1440 px with the drawer beside, over and closed (`write-design-spec-decisions.md` item 18).

**Deferred until after run 2:** the harness fixes from the run-1 assessment, filed as #115, so they do not mix into the comparison with the baseline.

Optional while Han reviews the Dossier: Speaker notes cite research by ID (`AIE-000n`), so Promotion can look up which research the Dossier still cites.

## Not now

These stay planned in `LEARNINGS.md` → _Next steps_:

- the mechanical runner;
- the subagent-stop telemetry hook;
- agent profiles;
- Cowork voice.

Run 2 should first prove that better input gives a better Episode.
