# open-pr

Output: the app served locally, its Episode link printed, and one draft PR whose description is the list of everything that needs Han. No reviewer.

## Prompt

1. **Serve.** Run `npm run dev` in the background and read the port from its output. Print the Episode's link as `http://localhost:<port>/episodes/<slug>`, and open it to confirm it answers 200. Until #85 moves Episodes to `/episodes`, the route is `/episode/<slug>`: print the one that answers. When only `/episode/<slug>` answers, that deviation goes on the PR checklist below.
2. **Open the draft PR** from `episode/<slug>` to `main`. First run `gh pr view episode/<slug>`: when a PR exists, an earlier attempt opened it (or Han retargeted it), so edit its body with `gh pr edit`, keep its base as it is and open none. Otherwise open it with `gh pr create --draft`, its body written by the `pr` skill, plus a `## Needs Han` checklist built from the event log. Read the current Run's notes with `npm run episode:query -- "SELECT job, type, text FROM notes ORDER BY seq"` (a Run still on `run-log.md` reads its Notes lines instead). Every one of these becomes one `- [ ]` item, quoted with its job:
   - each `blocked` note, a reviewer failure that ran out of retries;
   - each `needs-human` note;
   - each `research-gap` note, a research question the Episode went without;
   - each `spine-change` note, a change to the spine Han settled in the Brief;
   - the route deviation, when the Episode answered only on `/episode/<slug>`: `- [ ] Served at /episode/<slug>, not /episodes/<slug>, until #85 lands`.

   With none of them, the checklist says so in one line. The PR stays a draft through the feedback loop and practice, and merges at Promotion.

## Done when

The dev server answers on the printed link, and `gh pr view --json isDraft,url` shows one draft PR for `episode/<slug>`. Report both to Han.
