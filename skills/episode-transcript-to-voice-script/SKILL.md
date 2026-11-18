---
name: episode-transcript-to-voice-script
description: Rewrite an Episode's Voice script from the recording's transcript, Slide by Slide, as a readable version in Han's voice. Use when post-production needs the Voice script to match what Han said, when the user says rewrite, redo or update the Voice script from the recording, or hands over an Episode folder, page URL or video ID that has recording/slide-starts.<lang>.json.
---

# Episode transcript to Voice script

Han recorded the talk from the Voice script, and said something close to it. This skill moves each segment's `voiceScript` text to what he said, edited into prose a reader enjoys and a blog article could later reuse. It writes `voiceScript` and nothing else (for an Episode instance, as Episode overrides, see step 2), and ends on a Voice script diff per Slide for Han's review. It needs `recording/slide-starts.<lang>.json` (from `/episode-match-slide-starts`). It runs alone, given an Episode folder, page URL or video ID, or as a step of `/episode-post-production`.

## Steps

1. Run `npm run youtube:voice-script -- <episode> --lang <lang>`; take `<lang>` from the Slide starts file name. It prints, per Slide in composition order: the i18n file, the authored segments, the transcript of the Slide's window and the reading time now. _Done when_ you have read every Slide's block, not only the ones that look changed.
2. Fix the **write surface** from the header the tool printed. The Episode that owns the Video is the one you write; for an Event recording that is the Event's Episode, never the public Base Episode.
   - **Episode instance** (the header says "an Episode instance of <base>"; every Event copy is one): never edit the Base Episode's i18n. Per Slide, write only the segments you rewrite into `overrides/<slide-slug>.<lang>.json` in the Episode instance's folder, shaped `{ "voiceScript": { "segments": { "<key>": { "script": "…" } } } }`; objects merge, so a skipped segment stays the base's. A Slide the Episode instance already overrides has its file: add to it. Make sure `episode.ts` imports the file at `slides.<slide-slug>.messages.<lang>` (`docs/features/episode-instances.md`, "`episode.ts`"); add the import and key for a new file. A pool Slide is overridden the same way and needs no report.
   - **Plain Episode** (no such header): edit the `slides/<slug>/i18n/<lang>.json` files named in `file:`, only their `voiceScript` key. A Slide the tool marks `POOL` is shared by other Episodes: leave it untouched and report it, so Han copies it into the Episode first.
3. For each Slide, rewrite each segment's `script` from the transcript window:
   - **Keep** the segment keys, `title`, `keywords` and `bridge`, and the order of segments. Han's recorded order wins when it differs; say so in the report.
   - **Edit** speech into readable prose: drop fillers and false starts, join half sentences, repair what auto-captions misheard (match against the authored text and the Slide's on-screen words), keep his first person, his examples and his addressing of the reader as written in the authored text (German: Du, capitalised). Keep every claim he made and invent none.
   - **A segment skipped live** (its content is absent from the window) keeps its authored text, word for word. A Slide whose start is unmatched is skipped whole, each of its segments the same.
   - **Speech that matches no segment** goes into the nearest segment of its Section, at the place it fits, and is listed. A Slide without segments (the Title slide) has nowhere to take speech: list its speech as unplaced and write no segment.
     _Done when_ every authored segment is rewritten, kept (listed as skipped), or reported as unplaced.
4. Run `git diff --stat`. _Done when_ the only files changed are, for an Episode instance, its `overrides/*.<lang>.json` files and the imports in its `episode.ts`; otherwise the `i18n/<lang>.json` files of the owning Episode, with only lines under `voiceScript` changed; restore anything else. Run `npx oxfmt` on the changed files.
5. **Episode instance only:** run `npm run registry` (it adds each new override file to the outline the tool reads), then `npm run overrides:pin -- <episode-id>` (the id the tool printed in its header). It writes `overrides.lock.json`, the Pin lock: one fingerprint per overridden path, so the fast suite fails when the base's text under your override changes. _Done when_ `overrides.lock.json` lists each Slide you overrode; commit it with the overrides. Then run `npm run youtube:voice-script` again for the reading time after.
6. End with the report for Han:
   - **Voice script diff per Slide**: Slide title, then each changed segment as `git diff --word-diff` output, trimmed to the changed words. For an Episode instance the override file holds only new text, so diff its segment against the base's authored line the tool printed in step 1.
   - **Skipped segments**: Slide, segment key, why.
   - **Folded speech**: the passage, the segment it went into.
   - **Unplaced speech**, and for a plain Episode the **pool Slides** left untouched.
   - **Reading time** of the Episode before and after, in minutes.
     Reading time stays counted from the Voice script (Decision record _Reading time is counted from the Voice script_), so nothing else needs editing for the minutes to move.
