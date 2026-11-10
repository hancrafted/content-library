# Save hands-on progress in the browser

GitHub issue #380 in hancrafted/content-library, opened by hancrafted on 2026-10-26 and closed as completed on 2026-10-27. The body below is the issue's text, unchanged.

## Parent

#372

## What to build

A viewer's run is saved under the one progress key, one entry per Workflow (`human-in-the-loop/<id>`), with a hash of the English and German files together. A reload, another Episode or the other language resumes the run. When the stored hash differs, a fresh run starts and a note offers "Download old progress" or "Discard"; the old entry stays until the viewer chooses. A failed write is caught and the viewer is told to download their progress. Storage goes only through the prefs storage module (State Management ADR, amended on #371).

Branch from and merge back into the integration branch `feat/human-in-the-loop-ux` (draft PR #371).

## Acceptance criteria

- [ ] Run-model tests: the pair hash is equal for both languages and changes after an edit
- [ ] The browser test: a pasted result survives a reload and a language switch
- [ ] The browser test: a stale entry shows the note, and Discard clears it
- [ ] `archgate check` passes `single-storage-key`

## Blocked by

- #378
