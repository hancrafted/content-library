# Episode catalog keys

Read before adding or changing an Episode, a slide, or any string in `src/messages/<locale>.json`.

## Key shape

Every string an Episode's content owns lives under one path: domain role, then stable slug, ending on a semantic **role**.

```
episodes.<episode-slug>.title
episodes.<episode-slug>.sections.<section-slug>.<role>
episodes.<episode-slug>.sections.<section-slug>.slides.<slide-slug>.<role>
episodes.<episode-slug>.sections.<section-slug>.slides.<slide-slug>.columns.<column-slug>.<role>
```

- **Slugs** are lowercase kebab-case with single hyphens, and they never change once published. `episodeAnchors` in `src/lib/episode.pure.ts` throws on a bad or duplicate slug, so the build fails.
- **Never a position.** A column, slide or section is keyed by what it _is_ (`master`, `three-layers`), not where it sits (`0`, `first`). Reordering must not touch the catalog.
- Name levels by domain (`sections`, `slides`, `columns`), never by heading level (`h2`). Heading level is a render detail of the variant.

Chrome shared by all Episodes (e.g. `episodeNav.label`, the sitenav's accessible name) sits outside `episodes.*` and is not bound by the role table.

## Role vocabulary

| Role      | Meaning                                    | Used on                         |
| --------- | ------------------------------------------ | ------------------------------- |
| `title`   | the unit's heading; also its sitenav label | episode, section, slide, column |
| `caption` | one-line framing under the title           | section, slide                  |
| `prose`   | a body paragraph                           | slide, column                   |

Add a role only when a new variant needs a leaf none of these describe, and add it to this table in the same change.

## Rules

- **Only leaf strings are keyed.** Layout, order and variant choice live in the Episode's JSX (`src/components/pages/episode-template-page.tsx` is the reference), never in the catalog.
- **ICU for anything variable.** Counts and names go through ICU arguments, e.g. `"{count, plural, one {# slide} other {# slides}}"`. Never concatenate translated fragments.
- **`en.json` is the reference.** `de.json` is typed against it, so a key missing in German fails `npm run typecheck`. Add every key to both catalogs in the same change.
- **Section-only strings** sit directly on the section (`title`, `caption`). A section without page slides has no `slides` key.
