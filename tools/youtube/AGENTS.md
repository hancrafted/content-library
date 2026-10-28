# tools/youtube

The post-production tools: the Episode resolver, and the `youtube:*` entry points that work on an Episode's Recording folder. Each tool's `npm run` name is in `package.json`; its tests sit beside it.

- Imports: FE-007-module-layering §2 "Import direction"; rules `skills-and-tools-reach-src-through-area-lib-or-store-entry`, `src-never-imports-skills-or-tools`.
- Why the repo writes YouTube metadata: `docs/adr/0020-post-production-writes-youtube-metadata-from-the-repo.md`.
- Tests: ARCH-003-testing.
