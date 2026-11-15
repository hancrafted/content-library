# open-pr

Output: the app served locally, its Episode link printed, and one draft PR whose description is the list of everything that needs the user. No reviewer.

## Prompt

1. **Serve.** Reuse the dev server on `pipeline.yml`'s `dev_port` (`lsof -nP -iTCP:<dev_port> -sTCP:LISTEN`), or start `npx next dev -p <dev_port>` detached in the Episode's worktree. Print the Episode's link as `http://localhost:<dev_port>/episodes/<slug>/` (a Guide's as `/guides/<slug>/`) and confirm it answers 200.
2. **Open the draft PR** from `episode/<slug>` to `main`. Push the branch first, `git push -u origin episode/<slug>`, since `gh pr create` opens a PR only from a pushed branch. Then run `gh pr view episode/<slug>`: when a PR exists, an earlier attempt opened it (or the user retargeted it), so edit its body with `gh pr edit`, keep its base as it is and open none. Otherwise open it with `gh pr create --draft`, its body written by the `pr` skill, plus a `## Needs the user` checklist built from the event log. Read the current Run's notes with `npm run episode:query -- "SELECT job, type, text FROM notes WHERE episode = '<slug>' AND trace_id = '<the Run's trace_id>' ORDER BY seq"`; the `notes` table holds every Episode's Runs, so an unfiltered query returns tens of kilobytes. Every one of these becomes one `- [ ]` item, quoted with its job:
   - each `blocked` note, a reviewer failure that ran out of retries;
   - each `needs-human` note;
   - each `research-gap` note, a research question the Episode went without;
   - each `spine-change` note, a change to the spine the user settled in the Brief.

   Run-level facts go above the checklist once, never per job: German copy unreviewed, the interactive browser pass skipped, a status `warn` line. With none of them, the checklist says so in one line. The PR stays a draft through the feedback loop and practice, and merges at Promotion.

## Done when

The dev server answers on the printed link, and `gh pr view --json isDraft,url` shows one draft PR for `episode/<slug>`. Report both to the user.
