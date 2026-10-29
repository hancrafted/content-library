# tools/youtube

The post-production tools: the Episode resolver, and the `youtube:*` entry points that work on an Episode's Recording folder. Each tool's `npm run` name is in `package.json`; its tests sit beside it.

- Imports: FE-007-module-layering §2 "Import direction"; rules `skills-and-tools-reach-src-through-area-lib-or-store-entry`, `src-never-imports-skills-or-tools`.
- Why the repo writes YouTube metadata: `docs/adr/0020-post-production-writes-youtube-metadata-from-the-repo.md`.
- Tests: ARCH-003-testing.

## Commands

Each takes `<episode folder | page url | video id>` and infers the language from the Recording folder's file names (`--lang en|de` when several exist); the rules are decision 7 of the design-ADR above. `--dry-run` and `--force` belong to `youtube:apply` alone.

| Command                | Reads                                  | Writes                                                                    |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| `youtube:transcript`   | YouTube captions and length (`yt-dlp`) | `transcript.<lang>.vtt`, `video.<lang>.json`                              |
| `youtube:recording`    | the composition, the Recording folder  | nothing; prints the Slide table, then violations                          |
| `youtube:voice-script` | transcript, Slide starts, Slide i18n   | nothing; prints the reading copy                                          |
| `youtube:chapters`     | Slide starts                           | the chapter block of `youtube.<lang>.md`                                  |
| `youtube:apply`        | `youtube.<lang>.md`, the remote video  | the video description, a comment; the comment ID, the applied fingerprint |
| `youtube:pull`         | `youtube.<lang>.md`, the remote video  | nothing; prints the word diff and who changed it                          |

`slide-starts.<lang>.json` is `{videoId, starts, unmatched, guessed, extraChapters}`: `guessed` lists the started Slides whose start was inferred, for Han's review; `extraChapters` (`[{start, title}]`, optional) adds YouTube chapters inside a Section, which `youtube:chapters` merges with the Section chapters in time order.

`youtube.<lang>.md` ends with an optional `## Applied fingerprint`: the fingerprint of the description apply last sent. Apply refuses a description edited on YouTube since then, unless `--force`; `youtube:pull` uses it to tell a Studio edit from a repo change not yet applied. Edits on YouTube come back through the Learn branch of `/episode-author-youtube-metadata`. The fingerprint is a `node:crypto` hash: deterministic, so it may sit in a `*.pure.ts` file.

## youtube:apply setup

`npm run youtube:apply -- <episode folder | page url> [--lang de] [--dry-run] [--force]` writes the description and posts the pinned comment after the PR merged; `--dry-run` only prints the plan.

1. In Google Cloud, enable the YouTube Data API v3 and create an OAuth client (Desktop app) on the channel's project.
2. Set the OAuth consent screen's publishing status to "In production". In "Testing" the refresh token expires after 7 days.
3. Authorise once with the scopes `youtube.force-ssl` and read the refresh token from the response.
4. Put `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET` and `YOUTUBE_REFRESH_TOKEN` in `.env` at the repo root. The command exits before any API call when `.env` is tracked or not git-ignored.
5. After the run, pin the posted comment in YouTube Studio; the API cannot.
