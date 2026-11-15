# open-pr

Output: the app served locally, its Episode link printed, one draft PR whose description is the list of everything that needs the user, and the PR's Cloudflare preview with the Episode listed, reachable and measured by Lighthouse. No reviewer.

## Prompt

1. **Serve.** Run `npm run dev` in the background and read the port from its output. Print the Episode's link as `http://localhost:<port>/episodes/<slug>` (a Guide's as `/guides/<slug>`), and open it to confirm it answers 200. Until #85 moves Episodes to `/episodes`, the route is `/episode/<slug>`: print the one that answers. When only `/episode/<slug>` answers, that deviation goes on the PR checklist below.
2. **Open the draft PR** from `episode/<slug>` to `main`. First run `gh pr view episode/<slug>`: when a PR exists, an earlier attempt opened it (or the user retargeted it), so edit its body with `gh pr edit`, keep its base as it is and open none. Otherwise open it with `gh pr create --draft`, its body written by the `pr` skill, plus a `## Needs the user` checklist built from the event log. Read the current Run's notes with `npm run episode:query -- "SELECT job, type, text FROM notes ORDER BY seq"`. Every one of these becomes one `- [ ]` item, quoted with its job:
   - each `blocked` note, a reviewer failure that ran out of retries;
   - each `needs-human` note;
   - each `research-gap` note, a research question the Episode went without;
   - each `spine-change` note, a change to the spine the user settled in the Brief;
   - the route deviation, when the Episode answered only on `/episode/<slug>`: `- [ ] Served at /episode/<slug>, not /episodes/<slug>, until #85 lands`.

   With none of them, the checklist says so in one line. The PR stays a draft through the feedback loop and practice, and merges at Promotion.

3. **Copy into an Event.** Only when the user named an Event (and optionally a Playlist position) for this Episode: from the Episode's worktree run `node skills/new-episode/scripts/copy-to-event.ts <slug> <event-slug> [--position <n>]`. It copies the Episode whole into `src/episodes/by-event/<event-slug>/<slug>/` as an unlisted, published copy dated on the Event, lists it in the Event's Playlist (last when no `--position`), runs `npm run registry` and writes the copy's `published-anchors.json`. Run `npm run verify`, commit the result and push before step 4; the copy is a second build input of the preview. Its page is `/events/<event-slug>/episodes/<slug>/` and `/de/...`.
4. **Preview and Lighthouse.** Push the branch; the pull request's preview (`docs/features/hosting.md`, "How it deploys") is built with `LIST_UPCOMING_EPISODES=true`, so `/episodes` lists the Upcoming Episode as soon as it exists in `src/episodes/`. Wait for the run (`gh run watch`), then take the URL from its `preview` environment link and check on it, in both locales (`/de/` prefix), that:
   - `<preview>/episodes` lists the Episode, linked;
   - `<preview>/episodes/<slug>/` answers 200;
   - with step 3, `<preview>/events/<event-slug>/episodes/<slug>/` answers 200 and the Event page lists the copy at its place.

   Then run Lighthouse by hand on the Episode page, mobile and desktop presets, the median of 3 runs on a clean profile (`npx --yes lighthouse@12.8.2 <url> --preset=desktop`; mobile is the default); the target is Performance, Accessibility, Best Practices over 90 and SEO over 90 (`.scratch/episode-perf/decisions.md`, 60 and 61). A preview and an Upcoming Episode are `noindex` by design, so ignore the indexing audit when judging SEO. There is no automatic gate: put the scores, and each target missed, in the PR body under `## Lighthouse`, and add a `- [ ]` item for each miss to `## Needs the user`.

## Done when

The dev server answers on the printed link, `gh pr view --json isDraft,url` shows one draft PR for `episode/<slug>`, and the preview lists and serves the Episode (and its Event copy, when made) with the Lighthouse scores in the PR body. Report the local link, the PR URL and the preview URLs to the user.
