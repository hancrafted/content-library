# tools

Code that runs on the repo rather than in the product, one subfolder per purpose: `tools/verify/` the gate, `tools/codegen/` the registry generator (Episode and Event registries, Episode routes, page summaries), `tools/deploy/` the redirect stubs, `tools/demo/` the dashboard demo export, `tools/youtube/` the post-production tools, `tools/ecology/` the software ecology scenario judge (`npm run ecology:sim`), `tools/art/` the Scene art bake (`npm run art`, run as `prebuild`) and path rounder (`npm run art:round`), `tools/retro/` the load retro over this repository's Claude Code session logs (`npm run retro:load`), `tools/load/` running under load (`lock.ts`, the named lock this clone and its worktrees share, used by the `wt:done` and `wt:sync` merges and by `test-lock.ts`, the test lock `verify`'s and `verify:push`'s test runs queue on; `workers.pure.ts` and `workers.ts`, the vitest and art-bake workers and the test timeout by load; `slow-tests.mts`, the log of fast tests over 750 ms). Each tool's `npm run` name is in `package.json`; its tests sit beside it.

- Imports: FE-007-module-layering §2 "Import direction"; rules `skills-and-tools-reach-src-through-area-lib-or-store-entry`, `src-never-imports-skills-or-tools`.
- The registries `tools/codegen/` writes: FE-013-content-store.
- Tests: ARCH-003-testing.
