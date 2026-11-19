---
workflow: drive-fortify-sweep
date: '2026-11-19'
fortify: pending
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
