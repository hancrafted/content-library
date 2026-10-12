---
type: design-adr
status: proposed
---

# Episode content is staged in docs and promoted into the code folder

A new Episode's text starts as markdown in a staging folder, `docs/episodes/<slug>/`: a Brief, research files, a Dossier and a Manuscript. The implementation is built and iterated from those files, and they stay the source of truth through the feedback loop and practice. When the Episode is final it is promoted: its text moves into the Episode's code folder, so content and the Slides it describes sit side by side, and the staging folder is deleted. Markdown stays the source of truth after promotion too: agents read it cheaply, markdown-harness governs its shape, and every edit is a reviewable diff.

## Why not keep the Episode docs as the source of truth forever

A Slide is a self-contained folder (design-ADR _The Slide is a self-contained folder_) and can be copied into another Episode. If a whole-Episode Manuscript owned each Slide's text, a Slide used by two Episodes would have two Manuscripts claiming it. Putting each Slide's text into its own `slide.md` keeps one owner per Slide, and the text travels with the folder.

## Why not hand over to the i18n files at implementation

The Slide's `i18n/*.json` holds strings, not a story. Freezing the markdown at implementation would leave the docs dead once the feedback loop starts, and agents editing wording would have no prose to read.

## Decisions

1. **Staging holds the work in progress.** `docs/episodes/<slug>/` holds `brief.md`, `research/*.md`, `dossier.md`, `manuscript.md`, `run-log.md` and `feedback/NN.md`. Content changes from the feedback loop land in the Manuscript or Dossier first, then in the implementation.
2. **Promotion happens when the Episode is final**, after practice and before German translation.
   - `brief.md` and `dossier.md` move to `src/components/episodes/<ep>/`.
   - Each Manuscript h3 and its Dossier block become `slides/<slug>/slide.md`.
   - Research files the Dossier still cites move to `docs/llm-wiki/research/` and are listed in `docs/llm-wiki/index.md`. The rest are deleted.
   - The staging folder is deleted after the style harvest has read it. git history keeps it.
3. **After promotion, each file has one owner.** `slide.md` owns a Slide's text, and a test checks `i18n/en.json` against it. `<ep>.ts` owns Slide order, and a test checks the Dossier's heading order against it. A reading copy of the whole Manuscript is generated on demand and never committed.
4. **German comes after promotion** as a translation task: `slide.de.md` per Slide, with `de.json` checked against it.
5. **Headings carry explicit slugs**, `### <title> {#slug}`, because the slug becomes a folder name, a Translation key and a published anchor, and must survive a retitle.

## Considered options

- **Generate `i18n/*.json` or `<ep>.ts` from the markdown.** This was rejected for now. It ties the app to a document format that is not yet stable, and design-ADR _The Slide is a self-contained folder_ already rejected a generator. Parity tests give the same guarantee without one.
- **Keep research next to the Brief in the Episode folder.** This was rejected. Research answers one question and can be reused across Episodes, so it moves to a shared, indexed folder. Growth is limited for now by deleting research nothing cites.

## Consequences

- The Archgate ADR `FE-002-episode-page` needs amending to admit `slide.md`, `dossier.md` and `brief.md` in the Episode and Slide folders.
- Two parity tests join `npm run verify`: `slide.md` against `i18n/en.json`, and the Dossier against `<ep>.ts`.
