# tools

Code that runs on the repo rather than in the product, one subfolder per purpose: `tools/verify/` the gate, `tools/codegen/` the Episode and Event registry generator, `tools/deploy/` the redirect stubs, `tools/demo/` the dashboard demo export, `tools/mutation/` the scoped mutation test runner. Each tool's `npm run` name is in `package.json`; its tests sit beside it.

- Imports: FE-007-module-layering §2 "Import direction"; rules `skills-and-tools-reach-src-through-area-lib-or-store-entry`, `src-never-imports-skills-or-tools`.
- The registries `tools/codegen/` writes: FE-013-content-store.
- Tests: ARCH-003-testing.
