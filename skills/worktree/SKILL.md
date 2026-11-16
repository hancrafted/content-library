---
name: worktree
description: Create, finish and health-check git worktrees for this repo. Use when starting work in a worktree, running the low-level wt:done teardown, or when `npm run preflight` fails. For post-merge or repository-wide cleanup, use cleanup.
---

# Worktree

Worktrees live in `.worktrees/<branch with / as ->`, branched from freshly fetched `origin/main`. This overrides any worktree path a handoff names (`../cl-…` included).

## Start

`npm run wt:new -- <branch>` fetches, adds the worktree, runs `npm ci` and `npx husky` inside it. The checkout is done when the command prints `✔ worktree ready`; `cd` there and work.

`--base <branch>` starts the worktree from that local branch instead of `origin/main`, with no fetch: `npm run wt:new -- <parent>--<issue>-<task> --base <parent>` gives a subagent its own worktree on its orchestrator's branch (the naming convention is in `AGENTS.md`). `wt:new` refuses a `--` branch whose parent, everything before the first `--`, is missing, is `main` or differs from `--base`, and prints the command that fixes it. `parseArgs` in `scripts/worktree-args.pure.ts` exposes the parent and issue number, for tools that match branches to issues.

A real `node_modules` is the point: a symlinked one breaks Turbopack, `mh check` and the hooks.

## Finish

For post-merge cleanup or an inventory of removable branches and worktrees, use
[cleanup](../cleanup/SKILL.md). It owns approval, integration evidence, remaining
work, and process-safety decisions; `wt:done` below is the low-level helper with
different guards, not a substitute for that workflow.

Run `npm run wt:done -- <branch>` from the main checkout once the PR merged. It refuses while any process (a dev server) has its cwd inside the worktree and names it; stop that process and rerun, or add `--kill`: it sends SIGTERM to the listed processes, SIGKILL after 3 seconds, never to itself or its ancestors (your shell), then continues. Never hand-run `pkill` for this; it can kill your own shell. It then removes the worktree and its Claude Desktop folder (`docs/claude-project-context/<branch-slug>/`), deletes the branch when git sees it merged, and fast-forwards local `main`. When local `main` holds unpushed commits it stops and lists them: push them through a PR or move them to a branch, then rerun.

With `--base <branch>`, run from anywhere but the worktree itself, it leaves `main` alone and first merges the branch into the base (`git merge --no-ff`, inside the worktree that has the base checked out). This is how a subagent finishes its ticket: no push, no PR. The merge holds a lock per base in the git common directory, so subagents finishing together merge one at a time; a waiting run prints `waiting for another merge`, and a lock whose process died is taken over. Once merged it prints every fast-suite test that ran past 5 s on the branch since it branched off the base (the slow-tests log, `slow-tests.jsonl` in the git common directory, which every fast-suite run appends to): read them as tests creeping towards CI's limit. When the base is checked out nowhere, or the merge conflicts or hits a dirty base, it aborts the merge, releases the lock, removes nothing and says so; fix that and rerun. Once merged it removes the worktree and deletes the branch.

When Finder drops a `.DS_Store` into the folder while git deletes it, `git worktree remove` fails half-way and git forgets the worktree. `wt:done` then deletes the leftover folder itself, once every file left is Finder metadata, ignored or identical to the branch's commit, and continues; otherwise it names the files that hold unsaved work. A rerun after such a failure continues the same way.

## Sync

`npm run wt:sync`, run inside a worktree, fetches `origin` and merges `origin/main` into that worktree's branch; `npm run wt:sync -- --base <branch>` merges the local base branch instead. It refuses a dirty tree, a detached HEAD and `main`. Never `git pull` in the main checkout to catch a branch up: it advances whatever branch that checkout holds.

## Preflight

`npm run preflight` runs first in `verify`, `verify:commit` and CI. It fails on a symlinked or missing `node_modules`, missing husky hooks, or an archgate run that ran zero checks, and prints the fix for each. Apply the printed fix; the judgement lives in `scripts/preflight.pure.ts`.
