---
type: design-adr
status: proposed
---

# Episode content is staged in docs and promoted into the code folder

A new Episode's text starts as markdown in a staging folder, `docs/episodes/<slug>/`: a Brief, research files and a Dossier. The implementation is built and iterated from those files, and they stay the source of truth through the feedback loop and practice. When the Episode is final it is promoted: its text moves into the Episode's code folder, so content and the Slides it describes sit side by side, and the staging folder is deleted. Markdown stays the source of truth after promotion too: agents read it cheaply, markdown-harness governs its shape, and every edit is a reviewable diff.

## Why not keep the Episode docs as the source of truth forever

A Slide is a self-contained folder (design-ADR _The Slide is a self-contained folder_) and can be copied into another Episode. If a whole-Episode Dossier owned each Slide's text, a Slide used by two Episodes would have two Dossiers claiming it. Putting each Slide's text into its own `slide.md` keeps one owner per Slide, and the text travels with the folder.

## Why one Dossier, not a Dossier and a Manuscript

Run 1 kept a Dossier (spine, Visuals, Speaker notes, Segment beats) and a Manuscript (the spoken prose, one paragraph per Segment). The Manuscript was a rendering of the Dossier: it copied the spine verbatim, a test existed only to keep the two agreeing, and still 6 of 9 Slides shipped a different title than their Manuscript h3. Promotion merges them into one `slide.md` per Slide anyway. One staging file gives Han one file to review, one gate and one draft-to-approved diff. Two jobs still write it: `write-dossier` the plan, `write-voice-script` only the Voice script blocks, so a failed tone line reruns only the voice.

## Why not hand over to the i18n files at implementation

The Slide's `i18n/*.json` holds strings, not a story. Freezing the markdown at implementation would leave the docs dead once the feedback loop starts, and agents editing wording would have no prose to read.

## Decisions

1. **Staging holds the work in progress.** `docs/episodes/<slug>/` holds `brief.md`, `research/*.md`, `reference/*/reference.md` with its page images, `dossier.md`, `run-log.md` and `feedback/NN.md`. Content changes from the feedback loop land in the Dossier first, then in the implementation. A `verified` entry `{ by: human:han, at }` at or after `generated.at` means Han accepted the file at its gate (see design-ADR 0005); every staging file carries `status: draft`, and Promotion is marked by the file's location.
2. **Promotion happens when the Episode is final**, after practice and before German translation. Promotion removes `status: draft` from every file it moves.
   - `brief.md` and `dossier.md` move to `src/components/episodes/<ep>/`.
   - Each Dossier h2 and h3 block becomes `slides/<slug>/slide.md`. The h1 block, the Title slide's optional Voice script and Speaker notes, moves to the Episode folder's own text file, because the Title slide has no Slide folder.
   - Research files the Dossier still cites move to `docs/llm-wiki/research/<category>/` and are listed in `docs/llm-wiki/index.md` under their category's h3. The rest are deleted.
   - References are not promoted: the Slides that copied them carry what they took.
   - The staging folder is deleted after the style harvest has read it. git history keeps it.
3. **After promotion, each file has one owner.** `slide.md` owns a Slide's text, and a test checks `i18n/en.json` against it. `<ep>.ts` owns Slide order, and a test checks the Dossier's heading order against it. A reading copy of the Episode's whole Voice script may be generated on demand and is never committed.
4. **German comes after promotion** as a translation task: `slide.de.md` per Slide, with `de.json` checked against it.
5. **Headings carry explicit slugs**, `### <title> {#slug}`, because the slug becomes a folder name, a Translation key and a published anchor, and must survive a retitle.

## Considered options

- **Generate `i18n/*.json` or `<ep>.ts` from the markdown.** This was rejected for now. It ties the app to a document format that is not yet stable, and design-ADR _The Slide is a self-contained folder_ already rejected a generator. Parity tests give the same guarantee without one.
- **Keep research next to the Brief in the Episode folder.** This was rejected. Research answers one question and can be reused across Episodes, so it moves to a shared, indexed folder. Growth is limited for now by deleting research nothing cites.

## Consequences

- The Archgate ADR `FE-002-episode-page` needs amending to admit `slide.md`, `dossier.md` and `brief.md` in the Episode and Slide folders.
- The Archgate ADR `FE-004-slide-architecture` §6 needs amending: the Title slide carries an optional Voice script and Speaker notes, so a feedback round can add them.
- Two parity tests join `npm run verify`: `slide.md` against `i18n/en.json`, and the Dossier against `<ep>.ts`.
