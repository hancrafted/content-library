---
name: pipeline-feedback
description: Land the user's feedback on the new-episode skill, its pipeline or the Spec frame "for future runs" as a commit on the run branch and a cherry-pick PR to main, then prune LEARNINGS.md. Use when the user says "for future runs", "fix the skill", or gives feedback on the machinery rather than on the Episode.
---

# Pipeline feedback

The user's feedback on the machinery (the `new-episode` skill, its references, the Spec frame, docs, the glossary) lands twice: as a commit on the current run branch, so this Run uses the fix at once, and as a cherry-pick PR on `main`, so the next Run starts with it. Episode content is not machinery: it stays on its Episode branch.

## Steps

### 1. Commit on the run branch

Write the change in `skills/new-episode/`, `docs/` or `GLOSSARY.md`: a markdown edit with `/writing-for-agents`; a code change (a script, a check) with `/tdd`, then `/code-review` against the run branch's last commit before it. Commit with `/commit`, in a commit of its own that holds no other change.

A lesson whose fix is mechanical (a check, a script, a template change) is that code change, or a ticket on the issue tracker, never a `LEARNINGS.md` entry: the next Run hits the same bug while it sits in a list. Only a change to the frozen template is a lesson, below.

A change to the frozen template, `skills/new-episode/assets/pipeline.yml`, does not ship: a Run's template must not shift under it. Write it as a numbered lesson in [`LEARNINGS.md`](../new-episode/LEARNINGS.md) (what happened, its evidence, the proposed fix) and commit that.

_Done when_ `node skills/pipeline-feedback/scripts/scope.ts` prints `✔`. It exits 1 and names each Episode file, and each file outside the three places, of the commit: reset the commit, drop those files and commit again.

### 2. Cherry-pick to main

From the main checkout run `npm run wt:new -- feat/feedback-<topic>`, work in that worktree, and `git cherry-pick <sha>` the commit. On conflict run `git diff --name-only --diff-filter=U`, then `git cherry-pick --abort`, name the conflicting files to the user and stop: the user resolves conflicts.

Push the branch and open the PR against `main` with the `pr` skill.

_Done when_ the PR is open on `main` and its diff holds the one commit's files; give the user its URL.

### 3. Prune LEARNINGS.md

Every session ends here, feedback or not. Read each lesson in [`LEARNINGS.md`](../new-episode/LEARNINGS.md) against the current skill, references, template and code, and delete the lesson when it is:

- **implemented**: the change it proposes exists (name where);
- **discarded**: the user decided against it, or a later decision replaced it;
- **stale**: the file, step or behaviour it describes is gone.

Keep a lesson that is open. Renumber the rest consecutively (the formatter requires it); the commit body names each deleted lesson by number and title.

Commit the deletions with `/commit`. The commit body lists each deleted lesson as `<number> <title>: <implemented|discarded|stale>, <reason>`. Cherry-pick this commit to `main` as in step 2 (the same PR, when step 2 ran in this session).

_Done when_ every lesson left in `LEARNINGS.md` is open, and every deleted one appears in the commit body with its reason.
