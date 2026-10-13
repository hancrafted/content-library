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

### 1. Han writes the Dossier and the Manuscript to about 90 %

The highest-leverage step: both files are the spec for everything downstream.

- **Input:**
  - the approved `brief.md`;
  - the six research files;
  - the run-1 `dossier.md` and `manuscript.md` as a draft to cut from;
  - the research and write-dossier/write-manuscript `Needs human:` items in PR #98, as a checklist of claims to keep, soften or drop.
- **Output:** `dossier.md` and `manuscript.md` with `status: approved`, committed with `Gate:` trailers so the diff against run 1 shows Han's edits. That diff is what teaches the agents his style (SKILL.md, _After the run_).
- **Template change it needs (agent work):** the pipeline must accept a Han-authored Dossier and Manuscript, as step 2 already accepts a Han-authored Brief.
  - Proposal: `write-dossier` and `write-manuscript` validate and fill gaps rather than rewrite.
  - Their reviewers judge against the rubric.
  - An approved file is never overwritten.
- **Who:** Han writes, in the voice-grill format if useful. An agent builds the template change.

### 2. Han provides general Slide authoring context

The design spec in step 3 has nothing to stand on without it.

- **Content:**
  - the visual language;
  - when to use which layout;
  - how quiet a Slide should be;
  - what makes an Episode Slide good or bad. The run-1 Slides are a ready set of examples of "not this".
  - It also settles the motion story: which motion, if any, a Slide may carry, since none is importable today.
- **Where, split by kind:**
  - Facts and rules go in `docs/design/`, which markdown-harness governs as product reference: which Master slides the Slide library holds, which motions a Slide may import.
  - Taste goes in `docs/design/design-guide.md`: how quiet a Slide is, what is good or bad, the run-1 Slides as "not this". `harvest-run` adds Han's design-gate edits to it later.
  - Add either to the Claude Desktop project list if the voice sessions need it.
- **Absorbs:**
  - LEARNINGS 2 (no design owner), now step 3;
  - LEARNINGS 3 (importable motion);
  - LEARNINGS 4: "catalog" is replaced by **Slide library** and **Master slide** in `GLOSSARY.md`.
- **Who:** Han, likely through a grill.

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
- LEARNINGS 7: Give Manuscript h1 P1 to the first section slide's first segment.
- LEARNINGS 8: Make the review fixed point the last commit before `implement-episode`.
- LEARNINGS 9: Make `open-pr` keep an existing PR's base.
- LEARNINGS 10: Have the status script show a `gate: human` job as `gate` until its output is approved.
- LEARNINGS 11: Resolve the "verbatim" contradiction in `write-spec.md`.
- LEARNINGS 12: Stop `next dev` rewriting `AGENTS.md`, for example with `agentRules: false` (see `docs/handoff/slide-master-harness-findings.md` F5).

Through `tdd`, `code-review` and `commit`, on a branch from `main` (`npm run wt:new -- <branch>`) with its own PR to `main`. The same holds for the template work of steps 1 and 3.

### 5. Run 2 and compare against the baseline

- **Start:**
  - Branch the Episode from `main`, which carries the template with steps 1, 3 and 4 merged (decision D1 below). Bring over what stays valid from the tag.
  - Re-tailor `pipeline.yml` with the new jobs.
  - Note the new run id.
- **Skip what stays valid:** the Brief and research stay unless Han's Dossier asks for new research.
- **Compare:**
  - Diff the built Episode against `baseline/onboard-ai-like-a-colleague/run-1`.
  - Compare the `runs.csv` rows per job: attempts, failed rubric lines, tokens.
  - Compare the length of the `Needs Han` checklist.

## Dependencies

```text
1 Han: Dossier + Manuscript ──────────────┐
2 Han: Slide authoring context ─► 3 write-design-spec job ─┤
4 agent: mechanical lessons ──────────────┴─► 5 run 2
```

Steps 1, 2 and 4 can run at the same time. Step 3 waits on step 2, and run 2 waits on all four.

## Decisions for Han

- **D1. Run 2's branch.**
  - Option A: continue on `episode/onboard-ai-like-a-colleague`, merging `main` into it once, with a new draft PR to `main`. The run log appends to run 1's.
  - Option B: start a fresh `episode/onboard-ai-like-a-colleague-run-2` from `main`, and check out `brief.md` and `research/` from the tag (`git checkout baseline/onboard-ai-like-a-colleague/run-1 -- docs/episodes/onboard-ai-like-a-colleague/brief.md docs/episodes/onboard-ai-like-a-colleague/research`).
  - Recommendation: B. #98 is closed, and run 1's branch is based on `feat/89-new-episode`, not `main`, and carries run 1's built Episode. A fresh branch from `main` builds the Episode from scratch, so the diff against the tag shows what run 2 changed.
- **D2. Han-authored staging.** Should `write-dossier` and `write-manuscript` only validate an approved file, or also fill gaps marked `Not settled.` as `brief-grill` does?
- **D3. Gate placement.** The design-spec gate comes after `write-spec`. Is there also a Dossier gate (Han approves the Dossier before the Manuscript), now that he authors both?
- **D4. The 53 PR items.** Read them as inputs to step 1 and drop the rest with the baseline, or triage them separately?

## Not now

These stay planned in `LEARNINGS.md` → _Next steps_:

- the mechanical runner;
- the subagent-stop telemetry hook;
- agent profiles;
- Cowork voice.

Run 2 should first prove that better input gives a better Episode.
