---
type: design-adr
status: proposed
---

# The Slide is a self-contained folder

> Amended by _Content data model_ (0016): Slide folders may live in the shared pool and be referenced by several Episodes; `slideHref` resolves per Episode.

An Episode composes Slides, and a Slide is one folder, `slides/<slide>/`, named after its slug. It holds its server entry (`slide.tsx`), its `*.client.tsx` widgets, their `*.pure.ts` logic and tests, an optional CSS module, and its own Translation files, `i18n/en.json` and `i18n/de.json`. The entry hands the Episode chrome its slug, notes, Voice script segments, Scene **and its text**; the kit builds the Slide's translator from that text, so a Slide is typed from its own files and knows no Episode. A Section is a list of Slides whose first names it; anchors and heading level derive from position. Copying a Slide into another Episode is `cp -r` of its folder plus one import and one list entry in the Episode file. The rules live in `FE-002`, `FE-006` and `FE-007`; this record keeps the reasons and what was traded away.

## Why

The first two Episode migrations (run 1 of the migration experiment) wrote one Slide's identity by hand in four places: a `context.ts` key, a Translation `base` path, an anchor and the record slug. Translators were cast to `(key: string) => string`, and one-Episode widgets sat in the shared page machinery. Each was a place for the same Slide to disagree with itself, and `tsc` saw none of them. Making the Slide file the unit, with everything else derived from its slug or position, closed that.

PR #50 (the `slide-master` Episode, eighteen sub-agents) then showed a Slide file still could not be lifted out of its Episode. One Slide sat in four places: its Scene in `slides/`, its widgets in the Episode's `client/`, its CSS in `parts/`, its text in the two 2,191-line site-wide Translation files. `slidesFor('<ep>')` typed it to its Episode's subtree, so copying it meant moving its keys and retyping it. Every sub-agent's text funnelled through the same two JSON files, so the orchestrator pre-wrote every key before spawning anyone. `parts/` meant both "shared by several Slides" and "every line of Episode CSS", so single-Slide components landed in the shared folder. And three Slides each wrote their own popover placement.

## Decisions

Q1–Q12 were settled in the grilling session after PR #50.

1. **Q1 — A Slide is one folder.** Everything needed to reproduce the Slide sits in `slides/<slide>/`; nothing on disk outside it belongs to one Slide.
2. **Q2 — Folder name equals slug.** The folder, the anchor half and the Slide's text share one name; a test enforces it.
3. **Q3 — Slide folders stay flat; Sections live in the Episode file.** The Episode file remains an explicit, typed list of Sections. A Section is not a block: it is where a list starts, named by its first Slide.
4. **Q4 — The Slide carries its own text.** `slide({ slug, messages: { en, de }, notes, segments, content })`. German must have English's shape, so a missing German key fails `tsc` inside the Slide, not in a shared file.
5. **Q5 — The kit builds `t` from the Slide's messages** with next-intl's `createTranslator`, keeping the default `em`, `b`, `code` tags and an `onError` that throws, as the site-wide config does. `t`, `ref`, `target`, `template`, note slugs (`notes.<note>`) and segment slugs (`voiceScript.segments.<segment>`) are typed from the Slide's own English file. No Episode slug appears in a Slide's types. Reading time is still counted from the Voice script per locale.
6. **Q6 — `slideHref` takes a plain string.** A Slide cannot know its Episode, so the type cannot list its siblings; the container fails the build for a slug that is not a Slide of the same Episode, and for a slug used twice.
7. **Q7 — No generator, no runtime glob.** A Slide imports its own JSON. `require.context` is unverified under Turbopack and untyped; a generator adds a build step for two lines of wiring.
8. **Q8 — An Episode's own text moves into its folder.** Title, caption and description sit in `<episode>/i18n/<locale>.json`, carried by the record. The site-wide files keep only site-wide text (navigation, landing, chrome). The landing overview and page metadata read Episode titles through the registry.
9. **Q9 — Import boundary.** A Slide folder imports only its own files and the global shared locations: the Slide master, `src/components/slide-shared/` (server parts with plain props, no kit), the UI kit, hooks and lib. Never another Slide or anything Episode-local. A dependency rule enforces it and its message names the allowed locations. The Episode's `parts/` and `client/` disappear: a part one Slide uses moves into that Slide's folder, a part several Slides share is promoted to `slide-shared`.
10. **Q10 — Client boundary keeps its classifier.** `'use client'` stays allowed only in `*.client.tsx`; only its place changes, from the Episode's `client/` to anywhere in a Slide folder. A client widget still reaches only its own folder, hooks and lib. ESLint caps follow file kind: the server entry keeps the Slide-file exemption from the per-function line cap; `*.client.tsx` and `*.pure.ts` keep every cap.
11. **Q11 — Shared helpers.** Popover placement is one hook in `src/hooks/` with its maths in `src/lib/`, rendering into the Episode portal root. Reveal-once logic stays inside each Scene (`FE-007` §4).
12. **Q12 — Styling and rollout.** A Slide's CSS module sits in its folder and is scoped by the module, so the `[data-episode]` wrapper is no longer required for Slide CSS; colour rules stay. The switch lands expand–contract on an epic branch: the new factory beside `slidesFor`, Episodes moved one per sub-issue, then the old shape deleted, so `main` sees one merge and never carries rules for two shapes.

Position stays the one source for structure: first in its Section is `h2`, the rest `h3`, set by the kit's `Title`. Anchors stay position-based (`<section>--<slide>`), and a `published-anchors.json` snapshot per Episode makes losing one a failing test. The record and kit types live in `slide-master/`, the vocabulary Episodes import; only the walk is pure, in `src/lib`.

## Upcoming Episodes

An Upcoming Episode has no record: only `episode-metadata.ts` and two landing strings, `landing.episodeOverview.upcoming.<slug>.{title,caption}`. Those strings are landing text, read by the overview alone, so they stay in the site-wide files. When the Episode is published they move into its folder's `i18n/` with the rest of its text; an existing test already refuses upcoming copy for a published Episode.

## Rejected

| Alternative                                                    | Why not                                                                                                                                                                                                                                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context.ts` per Episode: notes and segments beside the Slides | A parallel file keyed by hand-written strings drifts from the Slide it describes, and a cross-check test per Episode papers over it. Declared on the Slide, a note's slug, `ref` and `target` are typed.                                  |
| Section as a block: `{ title, slides: [...] }`                 | Gives the Section a second home for its title and a Translation key level. A section slide that names the Section needs neither; the Section is just where a list starts.                                                                 |
| Sections and order inferred from folder paths (`01-intro/…`)   | Order would live in folder-name prefixes; reordering renames folders; the prefix leaks into anchors or breaks folder = slug; the section slide becomes a naming rule instead of a type rule; and it needs a generator or an untyped glob. |
| The Slide declares its own heading level                       | A hand-written `as="h3"` can disagree with the Slide's place in the Section. Position is the one source.                                                                                                                                  |
| Anchors by slug alone, flat                                    | Cleaner, but changes every published URL (`<section>--<slide>`). Position-based anchors stay, guarded by the snapshot.                                                                                                                    |
| Kit and record types in `src/lib/`                             | `src/lib` holds pure logic with no React or Translation file types. The record and kit need both, so they live in `slide-master/`.                                                                                                        |
| Casting the translator per call site                           | One runtime cast, in the Localized Slide module (`slide-master/localized-slide.ts`) where it builds the Slide's translator for the kit, replaces one per Slide. Episodes never build a Translation key at runtime.                        |
| Keep text in the site-wide files, namespaced per Slide         | Leaves the Slide typed to its Episode's subtree and every sub-agent writing the same two files; copying a Slide still means moving keys.                                                                                                  |
| `slideHref` typed to the Episode's slugs                       | The Slide would have to know its Episode, the one thing a self-contained Slide must not. The build-time check catches the same mistake, once, for every copy.                                                                             |
| Keep an Episode-local `parts/` beside `slide-shared`           | It reintroduces the two meanings of "shared" and lets a Slide depend on Episode-local code, so copying it needs that code too.                                                                                                            |
| A loader glob or codegen collecting Slide folders              | Untyped or an extra build step, for two lines of explicit wiring the type checker already reads.                                                                                                                                          |

## Costs accepted

1. **Moving a Slide to another Section changes its anchor.** Guarded by `published-anchors.json`, not prevented: a move is a deliberate removal.
2. **Slide slugs are unique across the whole Episode**, not per Section: the slug is the folder name in one flat `slides/`, and `slideHref` names a Slide by slug alone. The Episode walk rejects a duplicate slug at build.
3. **Many small files.** An Episode is a folder of Slide folders, each with its entry, widgets, CSS and two Translation files.
4. **Types before content.** A Slide's `i18n/en.json` and `i18n/de.json` must exist before its entry compiles, since its kit types derive from them.
5. **Two lines of wiring per Slide**, written by hand in the Episode file.
6. **German is checked by shape, not by value.** An empty or English-copied German string still compiles; review and the built-page text snapshot catch it.
7. **A cross-Slide link is checked at build, not in the editor.**
8. **Authoring needs a copy source.** `page-template` is the minimal one; `slide-layouts` shows each layout rendered; `docs/features/episode-migration.md` is the recipe for converting a prototype.

## Related

- `FE-002` holds the Episode rules, `FE-006` the client classifier, `FE-007` the import boundary, `FE-010` the note and target contract.
- [0002](0002-reading-time-from-voice-script.md): reading time from words.
- Run 2 measures the Slide-as-unit design against run 1.
- Epic #51 and its sub-issues; PR #50's handoff.
