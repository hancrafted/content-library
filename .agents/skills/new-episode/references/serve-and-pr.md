# serve-and-pr

Output: the app served locally, its Episode link printed, and one draft PR whose description is the list of everything that needs Han. No reviewer.

## Prompt

1. **Serve.** Run `npm run dev` in the background and read the port from its output. Print the Episode's link as `http://localhost:<port>/episodes/<slug>`, and open it to confirm it answers 200. Until #85 moves Episodes to `/episodes`, the route is `/episode/<slug>`: print the one that answers.
2. **Open the draft PR** from `episode/<slug>` to `main` with `gh pr create --draft`, its body written by the `pr` skill, plus a `## Needs Han` checklist built from the run log. Every one of these becomes one `- [ ]` item, quoted with its job:
   - each Notes line starting `Blocked:`, a reviewer failure that ran out of retries;
   - each Notes line starting `Needs human:`;
   - each Notes line starting `No catalog match:`.

   With none of them, the checklist says so in one line. The PR stays a draft through the feedback loop and practice, and merges at Promotion.

## Done-checks

The dev server answers on the printed link, and `gh pr view --json isDraft,url` shows a draft. Report both to Han.
