---
type: design-adr
status: accepted
---

# Post-production writes YouTube metadata from the repo

After an Episode's recording is on YouTube, its description, chapters and pinned comment are written from the repo, through the YouTube Data API, by a local command run after the PR merged. The repo holds the copy in the Episode's Recording folder; YouTube shows only what is on `main`. This is the first outbound write to an external service, so it gets a record before it is built (#435).

## Decisions

1. **Writes go through the YouTube Data API.** `videos.list` / `videos.update` for the snippet description, `commentThreads.insert` for the comment.
2. **The OAuth refresh token stays in an uncommitted `.env`** (`YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`). The command refuses to run if `.env` is tracked or not git-ignored. The OAuth app is set to "In production": refresh tokens of apps in "Testing" expire after 7 days.
3. **The repo is the source, and the copy is applied only after the merge.** The description, the chapter block and the comment text are reviewed in one PR with the transcript, the Slide starts and the Voice script; nothing reaches YouTube unseen.
4. **Writes are idempotent.** The description is overwritten, and does nothing when unchanged. The comment is posted once and its ID is stored in the Recording folder; a re-run never posts a duplicate.
5. **The comment is pinned by hand.** The API has no method to pin a comment, so apply ends by telling Han to pin it in YouTube Studio.

## Why

Nothing from a recording stayed in the repo, and the description was written by hand each time. Writing from the repo makes the copy reviewable, keeps chapters derived from the Slide starts so they cannot drift, and lets a re-run fix a mistake without a second source of truth.

## Rejected

| Alternative                        | Why not                                                                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Drive Studio with Claude in Chrome | Would pin the comment, but scripts a UI that changes without notice, needs a signed-in browser, and has no idempotent read of the state.  |
| Paste the copy by hand             | The status quo: no review, no check against the Slide starts, and it is skipped under deadline.                                           |
| Apply from CI now                  | Needs the token as a repository secret and the OAuth app in production first. The apply command is written so a CI job can call it later. |

## Costs accepted

1. **One manual click per video**: pinning the comment in Studio.
2. **A long-lived secret on Han's machine.** A leaked `.env` grants write access to the channel; the tracked-file check guards git only.
3. **YouTube lags the repo** until Han runs apply after the merge.

## Related

- `design-ADR-0006` (Skills follow AgentSkills): the judgment steps are skills, the deterministic steps are tools.
- `design-ADR-0017` (Source tree follows the product): the tools sit in the tools folder, not in a skill's `scripts/`.
