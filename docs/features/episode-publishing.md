---
type: feature-guide
title: Episode publishing
stale_after: 2027-01-13T00:00:00Z
---

# Episode publishing

Read before publishing an Episode: the step that turns an Upcoming Episode with a page into a Published Episode. Han triggers it when the video is live, or asks an agent to run it. Promotion does not do it, and the two happen in either order.

Until then the Episode is Upcoming: its page is built and served at `/episodes/<slug>` and `/de/episodes/<slug>`, reachable by URL alone and `noindex`. Its overview card reads its copy from its own `i18n/` and shows on `/episodes` only under `next dev` and on a pull request's preview, linked there (`docs/features/hosting.md`); a production build leaves it out. No shared link to one of its Slides exists, so its anchors are not yet bound.

## Steps

1. In `episodes/<slug>/episode-metadata.ts`: set `status: 'published'` and `publishedOn` to the date the video went live (`YYYY-MM-DD`), which every card of it shows as its release date, and change its `satisfies` to `PublishedEpisodeMetadata`. The `noindex` robots tag is derived from `status`, so it drops with the flip.
2. Run the Episode folder's own `episode-checks.test.ts` (`npx vitest run src/episodes/<slug>/episode-checks.test.ts`, an Event's copy under `by-event/<event>/<slug>/`). Its published-anchor check fails and prints the file path and the anchors as JSON; create that file with that JSON, sorted as printed (the diff escapes its quotes).
3. Move the slug from `DRAFT_SLUGS` to `PUBLISHED_SLUGS` in `tests/post-build/episodes-index.build.test.ts`.
4. To feature it, edit `FEATURED` in `src/content-store/featured.ts`; the store refuses a slot that is not a published public Episode.

Done when: `npm run verify` is green, then `npm run build && npm run test:build` is green, and the overview card links to the Episode.
