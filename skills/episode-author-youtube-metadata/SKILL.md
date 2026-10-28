---
name: episode-author-youtube-metadata
description: Write the YouTube description and pinned comment for an Episode's recording into recording/youtube.<lang>.md, around the generated chapter block. Use when post-production needs the video's description or pinned comment, when the user says write, redo or update the YouTube description or comment, or hands over an Episode folder, page URL or video ID whose recording has Slide starts.
---

# Episode author YouTube metadata

The description and pinned comment are what a viewer and YouTube's search read first. This skill writes both in the recorded language, from what the Episode teaches, and ends on the copy for Han's review. It never edits the chapter block between `chapters:start` and `chapters:end`; `npm run youtube:chapters` owns it.

## Steps

1. Run `npm run youtube:recording -- <episode> --lang <lang>`; take `<lang>` from the file names in `recording/`. _Done when_ the composition table prints, the Slide starts are present and the Event (if any) is known from the folder path.
2. Read `references/description.<lang>.md`: the template, its budgets and the YouTube Help sentences behind them. Open only the file of the recorded language.
3. Gather the facts:
   - **Content**: `npm run youtube:voice-script -- <episode> --lang <lang>` for what the talk says; the Episode's `i18n/<lang>.json` for its title, caption and description.
   - **Episode link**: `https://hancrafted.net` + `/de` for German (English has no prefix) + `/episodes/<slug>/` for a public Episode, or `/events/<event>/episodes/<slug>/` for an Event copy. The trailing slash stays.
   - **About links**: the `linkedin` entry of `SOCIAL_LINKS` in `src/shared/lib/social-links.ts`, and the site root. Copy each URL from the file.
   - **Research questions**: the titles of the research files the Episode's claims rest on, found under `docs/llm-wiki/research/` through its index. The site publishes no page per Research question, so the list carries titles only and no URL.
     _Done when_ every fact has its source named in your notes.
4. Write the description into `recording/youtube.<lang>.md` under `## Description`, in the template's block order, with the existing chapter block (markers included) left byte for byte as it is. If the block is absent, run `npm run youtube:chapters -- <episode>` first. Write the hook and summary as the speaker would say them, naming one or two keywords the title already carries.
5. Write the pinned comment under `## Pinned comment`, as the template says. Leave `## Comment ID` as it is.
6. Run `npm run youtube:recording -- <episode> --lang <lang>`, then `npx prettier --write` on the file. _Done when_ it reports no violations, the chapter block is unchanged in `git diff`, and the budgets of the template hold: count with `wc -m`, not by eye.
7. End with the copy for Han: the description and the pinned comment as they are in the file, then the character counts of hook, summary and whole description, and any fact you could not source.
