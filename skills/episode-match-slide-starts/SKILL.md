---
name: episode-match-slide-starts
description: Find the second each Slide starts in a recorded Episode by matching the Slide title Han reads aloud, and write recording/slide-starts.<lang>.json. Use when post-production needs Slide starts or chapters from a recording, when the user says match, find or redo Slide starts, or hands over an Episode folder, page URL or video ID with a transcript.
---

# Episode match Slide starts

Han reads each Slide's title aloud as he starts the Slide. This skill finds that moment in the raw transcript and stores it as the Slide's start. It writes one file, `recording/slide-starts.<lang>.json`, and ends on a table for Han's review. It needs `recording/transcript.<lang>.vtt` (from `npm run youtube:transcript`). It runs alone, given an Episode folder, page URL or video ID, or as a step of `/episode-post-production`.

## Steps

1. Run `npm run youtube:recording -- <episode> --lang <lang>`. It prints every Slide in composition order: Section, slug, title in the spoken language. Take `<lang>` from the transcript's file name. _Done when_ every Slide of the table has a title row.
2. Read the transcript, `recording/transcript.<lang>.vtt`. Captions are automatic and roll, so each phrase appears in several cues: take the timestamp of the first cue that carries it. Matching moves forward only, because Slides play in composition order: Slide N is searched after Slide N-1's start, which also keeps a title that Han repeats later from pulling a start backwards.
3. For each Slide in order, find where Han says its title. Auto-captions mishear and split words, so match on sound and on the title's key words, not on exact spelling. The Title slide starts at 0. Record every other Slide as its cue's start, rounded down to whole seconds. A title that Han repeats later as a recap is not the start; keep the earlier content start and call it guessed. _Done when_ each Slide is **matched** (title heard), **guessed** (title not heard, start inferred from where its content begins, say why) or **unmatched** (no sign of it).
4. Write `recording/slide-starts.<lang>.json` next to the transcript, in this shape. Every Slide of the composition appears once, in `starts` or in `unmatched`; a guessed Slide goes in `starts`.

   ```json
   { "videoId": "<the Episode's youtube id>", "starts": { "<slug>": 0 }, "unmatched": ["<slug>"] }
   ```

   The video ID is the Event recording's `youtube.id` in `episode-metadata.ts`, or the locale's id of a public Episode.

5. Run `npm run youtube:recording -- <episode> --lang <lang>` again. _Done when_ it exits 0 with no violation; fix the file, not the rule.
6. End with a table for Han: Section, slug, title, start as `m:ss`, and status. Mark every **unmatched** Slide and every **guessed** start in bold with the reason, so Han fixes them at the review stop before anything is built on the starts.

## Boundaries

Section starts are derived from each Section's first Slide, never written. The transcript stays as fetched.
