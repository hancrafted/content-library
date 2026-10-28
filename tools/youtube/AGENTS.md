# tools/youtube

The post-production tools: the Episode resolver, and the `youtube:*` entry points that work on an Episode's Recording folder. Each tool's `npm run` name is in `package.json`; its tests sit beside it.

- Imports: FE-007-module-layering §2 "Import direction"; rules `skills-and-tools-reach-src-through-area-lib-or-store-entry`, `src-never-imports-skills-or-tools`.
- Why the repo writes YouTube metadata: `docs/adr/0020-post-production-writes-youtube-metadata-from-the-repo.md`.
- Tests: ARCH-003-testing.

## youtube:apply setup

`npm run youtube:apply -- <episode folder | page url> [--lang de] [--dry-run]` writes the description and posts the pinned comment after the PR merged; `--dry-run` only prints the plan.

1. In Google Cloud, enable the YouTube Data API v3 and create an OAuth client (Desktop app) on the channel's project.
2. Set the OAuth consent screen's publishing status to "In production". In "Testing" the refresh token expires after 7 days.
3. Authorise once with the scopes `youtube.force-ssl` and read the refresh token from the response.
4. Put `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` and `YOUTUBE_REFRESH_TOKEN` in `.env` at the repo root. The command exits before any API call when `.env` is tracked or not git-ignored.
5. After the run, pin the posted comment in YouTube Studio; the API cannot.
