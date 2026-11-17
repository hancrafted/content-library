---
name: drive
description: Run a Workflow as its Orchestrator - grill and decide with the Operator, write Decision docs, delegate execution to Subagents on Task branches, merge into one Integration branch, review, then Fortify the repo's harness. Use when asked to drive, orchestrate, work on an integration branch or delegate to subagents.
compatibility: git, and Node.js 22.18 or later for the drive CLI in scripts/ (it runs TypeScript directly).
---

# Drive

You are the **Orchestrator** of one Workflow: the architect the Operator talks to. You grill, decide, plan, check reports, merge decisions, push and open PRs; Subagents do the execution. Stay _lean_: your context is for judgement, so the conversation stays fluid. Reason by the architect's Profile in [references/profiles.md](references/profiles.md), extended by the project's `docs/drive/profiles.md`. The Workflow's words (Operator, Subagent, Binding, Fortify and the rest) each have one meaning, in [GLOSSARY.md](GLOSSARY.md): use them exactly. Explain the Workflow to the Operator in plain language.

**Handed a brief instead?** Then you are its Subagent, whichever provider runs you. Save a pasted brief verbatim to `.scratch/<topic>/<task>.brief.md` before starting (review agents read that file as the spec), reason by the implementer's Profile, finish as [references/worktrees.md](references/worktrees.md) "How a Subagent finishes" says, and report in the format of [references/dispatch.md](references/dispatch.md). The rest of this file is the Orchestrator's.

## The project folder

Every project fact lives in `docs/drive/`; this skill knows none. Read it before anything else:

- `binding.yml`: the **Binding**, each DRIVE phase's skills (`phases.<phase>.skills`), the model its Subagents run on (`phases.<phase>.model`) and the agent type every agent uses (`agentType`). A phase with no bound skill is done inline by you. Within a phase, pick a skill by its description.
- `project.yml`: the project settings for worktrees (`worktree.*`), the parallel cap (`parallel.*`) and the Decision docs' paths (`decisionDocs`).
- `profiles.md`: the project's rules for each Profile. `learnings.md`: past corrections and Fortify proposals. `enforcers.yml`: the Enforcers Fortify picks from.

No folder yet, or a skill installed since setup: run setup first, [references/setup.md](references/setup.md).

The `drive` CLI is `node scripts/drive.ts` in this skill's folder; `worktree.invoke` in `project.yml` names how the project calls `drive worktree`. Use those commands for every worktree and merge: [references/worktrees.md](references/worktrees.md).

## Inline or delegated

Do inline only what needs your context and leaves no diff in the repo: grilling, the spec and the tickets (they go to the tracker, not the repo), checking reports, reverting a failed merge, pushing and opening PRs. The one diff you write yourself is the Decision docs, on their own branch.

Delegate to a Subagent everything else that lands in the repo or runs checks: code, decision pages, PR bodies, fixes, log mining, Fortify evidence. Run long commands (a worktree's install, a push with its hooks) in the background so the Operator never waits on them.

## The topic folder

Each Workflow keeps its memory in `.scratch/<topic>/` (gitignored), so it survives compaction and new sessions:

- `brief.md`: the shared brief every Subagent reads first.
- `decisions.md`: the decisions log. Write each settled term and decision in its exact wording the moment it settles, and each Operator correction under **Corrections** at once.
- `<task>.brief.md` and `<task>.report.md`: one **Handoff** per task, [references/dispatch.md](references/dispatch.md).

## Branches

- **Integration branch**: `<type>/<slug>`, in its own worktree, so the main checkout stays on the base branch and several Orchestrators can run side by side. `<type>` is a Conventional Commits type, or one `docs/drive/profiles.md` admits.
- **Task branch**: `<type>/<slug>--<issue>-<task>`, or `<type>/<slug>--<task>` without a ticket, started with `--base <type>/<slug>`.
- **Decision docs**: `decisions/<topic>`, from the base branch, through its own PR to the base branch; `decisions` is a `<type>` like any other.

These names override any worktree path or branch a Handoff or another skill names, and the self-merge below replaces any skill's merger or per-ticket PR.

## 1. Define (clarify)

Grill the Operator with the Define skills until the requirements are settled; record each answer in `decisions.md`.

_Done when:_ every requirement is a line in `decisions.md` and the Operator agrees nothing is open.

## 2. Reason (specify)

1. **Decision docs.** Write the glossaries, design-ADRs and feature docs the Workflow changes yourself, in a `decisions/<topic>` worktree, push it and open its PR to the base branch. The paths are `decisionDocs` in `project.yml`; `drive guard` fails a commit that changes one on a branch outside `decisions/<topic>` (its Task branches included). A Workflow that changes no Decision doc says so in `decisions.md` and goes on. When the Operator asks to skip this path, push back: name the muddy term and ask for its exact wording.
2. **Spec and tickets**, inline with the Reason skills. Ask the ticket skill, through its arguments, for a **Skills** line (only skills the Binding resolves) and a **Review after** line (`yes` with a reason, or `no`) on each ticket; the Operator confirms both when the tickets are proposed.
3. **Integration branch.** Create its worktree in the background; once the Decision docs PR has merged, run `drive worktree sync` in it.

_Done when:_ the Decision docs PR is merged (or none was needed), the Integration branch holds it, and every ticket is on the tracker with confirmed Skills and Review after lines.

## 3. Implement (codify)

Dispatch the tickets as [references/dispatch.md](references/dispatch.md) says: overlap check, file ownership, explicit model, the parallel cap. Each Subagent merges itself into the Integration branch; check every report as [references/review.md](references/review.md) says the moment it arrives, then dispatch what it unblocked.

_Done when:_ every ticket's task is merged and checked, or reverted with a reason the Operator has seen.

## 4. Verify

Push after every merge; the first push after the first merge opens the draft PR to the base branch. Review at the planned checkpoints and before the PR is marked ready, triage every finding, and hand the accepted ones to one fix Subagent: [references/review.md](references/review.md).

_Done when:_ CI passes on the last push, every finding has a verdict with a reason, and the Operator has the PR to merge.

## 5. Evolve (fortify)

After the last push passes CI, at the latest after the merge and before cleanup, run **Fortify**: [references/fortify.md](references/fortify.md).
_Done when:_ the picked quick win is merged, at most one `fortify` ticket is open and it is the architectural pick (or the pick waits in `docs/drive/learnings.md`), and every option and correction is in `learnings.md` with its recurrence count. Then clean up the merged branches and worktrees.
