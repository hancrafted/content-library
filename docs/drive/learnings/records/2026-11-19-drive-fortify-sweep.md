---
workflow: drive-fortify-sweep
date: '2026-11-19'
fortify: skipped
skip-reason: skip
---

# drive-fortify-sweep

The epic that moved the learnings into records and failure modes and fixed the drive failure modes the skipped Fortifies left open (spec #789).

## wrong-model-tier-decision-page

- **Evidence:** the sweep recorded a recurrence; the Operator wants a tier column in the Fortify table

## subagent-merges-without-build-tests

- **Evidence:** the sweep recorded build tests running on stale fixtures before #742 added `beforeMerge: build-if-needed` to `drive worktree done`

## integration-pr-merged-before-code-review

- **Evidence:** the Integration PR was opened ready, not draft, again (#774): a recurrence of the #761 entry

## push-not-checked-against-remote

- **Evidence:** `drive push` exited 0 with "failed (null)" while the remote did not take the commit (f86d62a7)
- **Evidence:** the Orchestrator ran `drive push | tail -3`: the pre-push hook was killed by SIGPIPE and the pipe's exit status hid it as 0, although SKILL.md says never to pipe; retried unpiped (`.scratch/drive-fortify-sweep/decisions.md`, "Orchestrator's own", session 3cd48038)
- **Regressed:** the fix in #740 did not hold: the null exit status was still reported as success and no check compared the remote; fixed again by #792 (417962f34, `drive push` null-status and ls-remote checks) on 2026-11-19

## operator-skips-fortify

- **Evidence:** the session sweep found the Fortify skip a fourth time (at least four Workflows skipped it)

## parallel-workflows-conflict-in-learnings-file

- **Evidence:** the sweep recorded a second recurrence of learnings conflicts: PRs editing `docs/drive/learnings.md` while this epic moves it (#782 is open against the old file)

## push-after-pr-merged-leaves-commit-off-base

- **Evidence:** a push after the PR auto-merged left the last commit off main (93f19e8f, #760 → cherry-pick #779)

## pre-push-slow-lane-fails-under-parallel-pushes

- **Evidence:** the slow lane failed under many parallel pushes and the hook did not name the failing test (07a8a8d1, f86d62a7, 93f19e8f)

## grill-questions-use-undefined-jargon

- **Evidence:** grill questions used terms no glossary defines ("what twekas?", "what is an opening lock?") (93f19e8f)
- **Correction:** "what twekas?"

## subagent-commits-another-sessions-edits

- **Evidence:** a Subagent committed another session's uncommitted edits (#774, 07a8a8d1)

## monitor-edits-learnings-file-directly

- **Evidence:** a monitor session edited learnings.md directly, against fortify.md; no monitor channel is documented (bdfa06e2)

## orchestrator-does-not-watch-pr-checks

- **Evidence:** the Orchestrator did not watch CI or mergeability after opening a PR; the Operator relayed "ci failes" and "merge conflicts" (07a8a8d1, 93f19e8f)
- **Correction:** "ci failes"

## branch-delete-refuses-after-squash-merge

- **Evidence:** `git branch -d` refused after a squash merge (f86d62a7)

## task-merges-with-own-slow-tests-red

- **Evidence:** #792 merged with 4 `drive push` slow tests red: push called `gh pr list` in a temp repo with no GitHub remote; its brief forbade the pre-push run and the afterMerge slow-tests hook only reports; fixed in 102ba5d03 (non-GitHub remote skips the merged-PR check)

## task-commit-gate-skips-docs-lane

- **Evidence:** the review-2 fix Subagent's task commit 8de6cc235 passed `verify:commit` while `drive learnings check` failed on `fortify must be engaged or skipped`, so the Integration branch was red in the docs lane until the S7 Task merged (70d240035); push 7 went green at 1bf800768 (`.scratch/drive-fortify-sweep/review-2-fix.report.md` Blocker)

## review-subagent-cannot-start-code-review-sub-agents

- **Evidence:** both review checkpoints ran as one background Subagent each (`archgate:developer`, spawnDepth 1; session agent-ac7db8b88b7c9f10a for review 1, agent-a843a7eed70d9c4fa for review 2) and wrote `.scratch/drive-fortify-sweep/review-1.md` and `review-2.md` themselves; a Subagent has no Agent tool, so the skill's parallel sub-agents could not start (this record's own Subagent has none either)

## subagent-hook-and-log-record-nothing-from-main-checkout

- **Evidence:** review 2 found B2 in the SubagentStart/Stop hook of #795: it took its branch from `payload.cwd`, the main checkout, so nothing was logged and `drive transcript --topic` could not work (`.scratch/drive-fortify-sweep/review-2.md` B1 and B2); fixed in 8de6cc235, merged 7f06410c6
- **Evidence:** after the fix `npm run drive -- transcript --topic drive-fortify-sweep` still printed nothing and exited 0, because `drive.log.jsonl` holds one Subagent line and the Subagents that ran before the fix were never linked; the extractor does not say the topic has no linked session (session 3cd48038, run at the Record step)

## ticket-split-leaves-handoff-item-without-owner

- **Evidence:** review 1 B1: `drive setup` still seeded `learnings.md`; #790's report handed its removal to #794, whose brief forbade `setup*.ts`, so no ticket owned it; the Orchestrator sent it to #795 (`.scratch/drive-fortify-sweep/review-1.md` B1; fixed in de6c0ea06)

## commit-hook-times-out-under-parallel-load

- **Evidence:** push 4 failed locally on an unrelated `episode-checks` test that timed out at 5005 ms at load 22 with 3 Subagents running; the retry passed and no fix round was spent (`.scratch/drive-fortify-sweep/decisions.md` Implement, session 3cd48038)
