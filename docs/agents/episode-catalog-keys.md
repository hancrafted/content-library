# Episode catalog keys

Read before adding or changing an Episode, a slide, or any string in `src/messages/<locale>.json`.

The binding rules (key shape, slugs never positions, leaf strings only, ICU for variable text, every key in both catalogs) live in [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md) §5. This guide holds the role vocabulary and worked examples.

## Key shape, by example

```
episodes.page-template.title                                              → Title slide h1
episodes.page-template.caption                                            → Title slide caption
episodes.page-template.description                                        → meta description (FE-008)
episodes.page-template.sections.foundations.title                         → section slide h2, TOC label
episodes.page-template.sections.foundations.slides.three-layers.caption   → page slide caption
episodes.page-template.sections.foundations.slides.three-layers.columns.layouts.prose
```

Chrome shared by all Episodes (e.g. `tableOfContents.title`) sits outside `episodes.*` and is not bound by the role table.

## Role vocabulary

| Role          | Meaning                                              | Used on                         |
| ------------- | ---------------------------------------------------- | ------------------------------- |
| `title`       | the unit's heading; also its table-of-contents label | episode, section, slide, column |
| `caption`     | one-line framing under the title                     | episode, section, slide         |
| `description` | the page's meta description for search results       | episode                         |
| `prose`       | a body paragraph                                     | slide, column                   |

Add a role only when a new Slide layout needs a leaf none of these describe, and add it to this table in the same change.

## Worked notes

- Counts and names go through ICU arguments: `"{count, plural, one {# slide} other {# slides}}"`, passed as `t('next-steps.caption', { count })`.
- A Section without page Slides has no `slides` key: `title` and `caption` sit directly on the Section.
- `src/components/episodes/page-template/page-template.tsx` is the reference Episode: one function per Slide, reading its keys through one `getTranslations` namespace.
