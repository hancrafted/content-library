---
name: episode-post-production
description: Run post-production for a recorded Episode from its YouTube URL, through a worktree branch and one PR to the applied video copy. Use when the user hands over the YouTube URL of a recording, says post-production, or wants a recording's transcript, Voice script, chapters or description done end to end. A single judgment step belongs to its sibling skill.
---

# Episode post-production

You are the **orchestrator**: you order the steps, stop for Han three times and run what each step names. The judgment sits in the three sibling skills, the machinery in `tools/youtube/` (`tools/youtube/AGENTS.md`). Each step is one Job of the future pipeline. The input is `<url>`, the recording's YouTube URL; `<episode>` below is the Episode folder or page URL the tools resolve from it.

## Steps

1. **Branch.** Run `npm run youtube:recording -- <url>`; it only reads, and its first lines name the Episode's `slug`. Then `git fetch origin`, `npm run wt:new -- post-production/<slug>`, and work in that worktree. _Done when_ `git branch --show-current` prints `post-production/<slug>`.
2. **Transcript.** Run `npm run youtube:transcript -- <url>`; it asks which language was spoken. No captions yet: stop and tell Han to retry later. _Done when_ `recording/transcript.<lang>.vtt` exists; take `<episode>` from the folder the tool reports.
3. **Slide starts.** Run `/episode-match-slide-starts <episode>`. **Review stop 1:** show the Slide start table; wait for Han's fixes, then apply them to `recording/slide-starts.<lang>.json`.
4. **Voice script.** Run `/episode-transcript-to-voice-script <episode>`. **Review stop 2:** show the Voice script diff per Slide; wait for Han's edits.
5. **Chapters.** Run `npm run youtube:chapters -- <episode>`. YouTube shows chapters only from 3 on; when it warns of fewer, ask Han where to add one inside a Section and title it, add it to `extraChapters` in `recording/slide-starts.<lang>.json` (`tools/youtube/AGENTS.md`), and rerun. _Done when_ the chapter block sits in `recording/youtube.<lang>.md` with no warning.
6. **YouTube copy.** Run `/episode-author-youtube-metadata <episode>`. **Review stop 3:** show the description and pinned comment; wait for Han's edits.
7. **Land.** Run `npm run verify`, then `/commit`, then `/pr`. _Done when_ verify is green and the PR is open. Report its URL; the run ends here until Han merges.
8. **Apply, after the merge.** From the merged `main`, run `npm run youtube:pull -- <episode>`; when it reports an edit on YouTube, run the Learn branch of `/episode-author-youtube-metadata` first and merge its PR. Then run `npm run youtube:apply -- <episode> --dry-run` and show the plan; on Han's go run `npm run youtube:apply -- <episode>`. Both need the `.env` of `tools/youtube/AGENTS.md` under "youtube:apply setup". Apply updates `recording/youtube.<lang>.md` (comment ID, applied fingerprint): land that with `/commit` and `/pr`. End with the reminder: **pin the comment in YouTube Studio**, the API cannot.

Proceed past a review stop on Han's reply only. What a step writes is governed by its own skill.
