---
name: worktree
description: Create, finish and health-check git worktrees for this repo. Use when starting work in a worktree, cleaning one up after its PR merged, or when `npm run preflight` fails.
---

# Worktree

Worktrees live in `.worktrees/<branch with / as ->`, branched from freshly fetched `origin/main`. This overrides any worktree path a handoff names (`../cl-…` included).

## Start

`npm run wt:new -- <branch>` fetches, adds the worktree, runs `npm ci` and `npx husky` inside it. The checkout is done when the command prints `✔ worktree ready`; `cd` there and work.

A real `node_modules` is the point: a symlinked one breaks Turbopack, `mh check` and the hooks.

## Finish

Run `npm run wt:done -- <branch>` from the main checkout once the PR merged. It refuses while any process (a dev server) has its cwd inside the worktree and names it; stop that process and rerun. It then removes the worktree, deletes the branch when git sees it merged, and fast-forwards local `main`. When local `main` holds unpushed commits it stops and lists them: push them through a PR or move them to a branch, then rerun.

## Preflight

`npm run preflight` runs first in `verify`, `verify:commit` and CI. It fails on a symlinked or missing `node_modules`, missing husky hooks, or an archgate run that ran zero checks, and prints the fix for each. Apply the printed fix; the judgement lives in `scripts/preflight.pure.ts`.
