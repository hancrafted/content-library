---
type: feature-guide
stale_after: 2027-01-13T00:00:00Z
---

# Episode publishing

Read before publishing an Episode: the step that turns an Upcoming Episode with a page into a Published Episode. Han triggers it when the video is live, or asks an agent to run it. Promotion does not do it: Promotion precedes the German video and the release.

Until then the Episode is Upcoming: its page is built and served at `/episode/<slug>` and `/de/episode/<slug>`, reachable by URL alone, `noindex`, and its overview card is unlinked and reads its copy from its own `i18n/`. No shared link to one of its Slides exists, so its anchors are not yet bound.

## Steps

1. In `episodes/<slug>/episode-metadata.ts`: set `status: 'published'` and `publishedOn` to the date the video went live (`YYYY-MM-DD`), and change its `satisfies` to `PublishedEpisodeMetadata`. The `noindex` robots tag is derived from `status`, so it drops with the flip.
2. Run `npx vitest run src/components/episodes/published-anchors.test.ts`. It fails for the Episode and prints the file path and its JSON; create `episodes/<slug>/published-anchors.json` with exactly that content.
3. Add the slug to `PUBLISHED_SLUGS` in `tests/post-build/landing-page.build.test.ts`, in the order the published Episodes come in `PUBLISHED` in `src/components/episodes/episode-repository.ts`.
4. To feature it, edit `FEATURED` in `src/lib/episode-overview.ts`; `tsc` refuses an Episode that is not published.

Done when: `npm run verify` is green, then `npm run build && npm run test:build` is green, and the overview card links to the Episode.
