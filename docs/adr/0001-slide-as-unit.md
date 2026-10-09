---
type: design-adr
status: accepted
---

# The Slide is the unit of an Episode

An Episode composes Slide files: each declares its own slug, notes, Voice script segments and Canvas, and a Section is a list of Slides whose first names it. Everything else (Translation keys, anchors, heading level, kit names) derives from the slug or the position. The rules live in `FE-002`; this records what was traded away.

## Why

The first two Episode migrations (run 1 of the migration experiment) copied a shape that wrote one Slide's identity by hand in four places: a `context.ts` key, a Translation `base` path, an anchor and the record slug. Translators were cast to `(key: string) => string`, and one-Episode widgets sat in the shared page machinery. Each was a place for the same Slide to disagree with itself, and `tsc` saw none of them.

## Rejected

| Alternative                                                    | Why not                                                                                                                                                                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context.ts` per Episode: notes and segments beside the Slides | A parallel file keyed by hand-written strings drifts from the Slide it describes, and a cross-check test per Episode papers over it. Declared on the Slide, a note's slug, `ref` and `target` are typed.        |
| Section as a block: `{ title, slides: [...] }`                 | Gives the Section a second home for its title and a Translation key level (`sections.<section>.slides.<slide>`). A section slide that names the Section needs neither; the Section is just where a list starts. |
| The Slide declares its own heading level                       | A hand-written `as="h3"` can disagree with the Slide's place in the Section. Position is the one source: first in its Section is `h2`, the rest `h3`, set by the kit's `Title`.                                 |
| Anchors by slug alone, flat                                    | Cleaner, but changes every published URL (`<section>--<slide>` today). Position-based anchors stay; a snapshot per Episode makes losing one a failing test instead of a silent dead link.                       |
| Kit and record types in `src/lib/`                             | `src/lib` holds pure logic with no React or Translation file types. The record and kit need both, so they live in `slide-master/`, the vocabulary Episodes import; only the walk is pure, in `src/lib`.         |
| Casting the translator per call site                           | One runtime cast, in the container, replaces one per Slide. Episodes never build a Translation key at runtime.                                                                                                  |

## Costs accepted

1. **Moving a Slide to another Section changes its anchor.** Guarded by `published-anchors.json`, not prevented: a move is a deliberate removal.
2. **Slide slugs are unique across the whole Episode**, not per Section, because Translation keys are flat by slug.
3. **Many small files.** An Episode is a folder of Slide files plus `client/` widgets, not one page file.
4. **Types before content.** Translation keys must exist (en, de) before a Slide file compiles, since the kit's types derive from them.
5. **Authoring needs a copy source.** `page-template` is the minimal one; `slide-layouts` shows each layout rendered; `docs/agents/episode-migration.md` is the recipe for converting a prototype.

## Related

- `FE-002` holds the rules, `FE-010` the note and target contract, `FE-006` the client-file placement.
- `docs/research/episode-migration-experiment.md`: run 2 measures this design against run 1.
