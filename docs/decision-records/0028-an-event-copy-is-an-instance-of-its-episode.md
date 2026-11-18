---
type: decision-record
title: An Event copy is an instance of its Episode
status: accepted
---

# An Event copy is an instance of its Episode

An Event copy stops being a `cp -r` of its Episode. It becomes an **Episode instance**: its **Base Episode** plus sparse **Episode overrides**, resolved into a plain Episode record before the container runs. How to author one: [Episode instances](../features/episode-instances.md). This is the Prototype pattern with sparse overrides (differential inheritance), as in Figma's main component and instance. A value the instance overrides stays pinned. A value it does not override shows the base's current default.

## Human acceptance

**Approver:** Han. **Decision:** answers Q1–Q18 of the `event-copy-derivation` grill, 2026-11-18, closed with "ok" on the summary. This record takes effect when its Decision docs PR merges.

## Why

15 Event copies of 5 Episodes had drifted in both directions:

- German Voice scripts rewritten from a recording stayed in the copy.
- The 11-16 redesigns never reached the canonical Episode.
- Every composition edit had to land five times; promoting 3 Slides to the pool touched 137 files.

What the copies actually change is small: metadata, the Title slide's check-in notes, one Section reorder, recorded German Voice scripts and one `heading`. Evidence: `.scratch/event-copy-derivation/event-copy-variance.report.md`, summarised in the Decision docs PR.

## Decision

1. **Chain.** Episode overrides are layered as Slide defaults, then the Episode, then the Event copy. The Playlist and the Event only list and arrange (vision rule 4, Delivery layer). Resolution takes an ordered list of override layers, so a Playlist layer can be added later without changing the container.
2. **Live by default.** An instance follows its Base Episode. A past Event's page changes when its base changes, and the past-Event notice already says so. Checks guard what must not move: published anchors, and the Slide starts of a recorded instance.
3. **What an Episode override can address** (an **Episode override path**):
   - any key of a Slide's messages, per locale, as a nested partial typed from the Slide's own `en.json`/`de.json`. Objects merge by key; arrays are replaced whole;
   - the Slide's `presentation`;
   - an Explorable Preset id the Slide declares on its record. The Preset itself stays defined in the Explorable's YAML (`FE-012-explorables`);
   - the visibility of an element the Slide names with `target(...)`: `hide: ['<name>']`;
   - Section structure, as keyed operations `move`, `hide` and `insert` by Slide slug, so a Slide added to the base still reaches every instance;
   - the Title slide's notes and text.

   Episode override keys are typed from the base, so deleting or renaming a path in the base makes the override a compile error. Nothing is dropped silently, which is where Figma fails.

4. **Forking a Slide.** Scene code is not an Episode override path. To change it, fork the Slide folder into the instance. That is a deliberate fork, and it drifts.
5. **Where overrides live.** `episode.ts` calls `instanceOf(base, overrides)` (`src/episodes/lib/episode-instance.ts`) and holds the structure and small overrides. Episode override text lives in `overrides/<slide-slug>.<locale>.json`, a partial of that Slide's `i18n/<locale>.json`, which `episode.ts` imports explicitly; no folder scan finds it. The Event copy folder keeps `episode-metadata.ts`, `published-anchors.json`, `recording/` and `episode-checks.test.ts`.
6. **Pinned overrides.** `overrides.lock.json` in the copy folder holds a fingerprint of the base default at each overridden path. When a pinned default changes, the fast suite fails until `npm run overrides:pin -- <episode-id>` re-pins the override, or the override is deleted. `npm run registry` never re-pins. The check doesn't keep copies in step (a vision non-goal); it reports that they stopped being in step.
7. **Recorded Voice script.** Post-production writes a Voice script rewritten from a recording as an override in the recorded instance. Adopting it as the base default is an explicit step that moves the text into the base and deletes the override.
8. **Slide pool.** The pool holds only Slides that two or more different Base Episodes compose, and a check enforces this. A Slide reused only by one Episode's instances lives in that Episode.
9. **Tools read the outline.** `npm run registry` writes an Episode outline from each resolved record: its Sections, Slide slugs, anchors and each Slide's text source. The recording tools, `episode-text` and the pipeline read the outline and never parse imports or probe folders.
10. **Scope.** Event intros stay `cp -r` copies of the Workshop template.

## Amends

- **Decision record _Content data model_ (0016):** §6 and the rejected alternative "Reusing Slides by reference from first reuse" still hold between different Episodes. Within one Episode and its Event copies, reuse is now by reference through an Episode instance.
- **Product vision rule 4:** unchanged. Adapting an Episode for an audience still composes an unlisted Episode, which is now an Episode instance.

## Alternatives

- **Frozen snapshot per Event:** a snapshot is a copy, which is the problem being solved.
- **Plain imports of the base's Slides:** the copy still restates every Section file, so the ×5 cost stays.
- **The canonical Episode as a Template:** blurs _Template_, which means a copy source.
- **The Playlist lists the canonical Episode directly:** loses the per-Event recording, metadata and check-ins.
- **Dot-path override keys:** slower path types and two ways to write one override.
- **YAML patches into Explorable configuration:** couples the instance to an Explorable's data.
- **Silent overrides, as in Figma:** the drift this record ends.
