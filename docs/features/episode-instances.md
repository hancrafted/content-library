---
type: feature-guide
title: Episode instances
stale_after: 2027-05-18T00:00:00Z
---

# Episode instances

An Event copy is an **Episode instance** of its **Base Episode** (GLOSSARY). It states only what differs; everything else is the base's current default. The decision and its alternatives are in Decision record _An Event copy is an instance of its Episode_.

## Folder

```text
src/episodes/by-event/<event-slug>/<slug>/
  episode-metadata.ts                   # visibility 'unlisted', publishedOn, youtube: the Episode instance's own
  episode.ts                            # instanceOf(base, overrides): structure and small overrides
  overrides/<slide-slug>.<locale>.json  # partial of that Slide's i18n/<locale>.json, imported by episode.ts
  overrides.lock.json                   # generated: fingerprint of each overridden default
  published-anchors.json
  recording/                            # Slide starts, YouTube text: the Episode instance's own
  episode-checks.test.ts
```

There are no `sections/` or `slides/` folders, unless a Slide is detached (`slides/<slide-slug>/`, a fork).

## `episode.ts`

```ts
import { instanceOf } from '@/episodes/lib/episode-instance';
import { onboardAiEveryTime } from '@/episodes/onboard-ai-every-time/episode';
import de from './i18n/de.json';
import en from './i18n/en.json';
import payThePriceDe from './overrides/pay-the-price.de.json';

export const introHitlOnboardAiEveryTime = instanceOf(onboardAiEveryTime, {
  title: { notes: [{ slug: 'check-in', target: 'title' }], messages: { en, de } }, // note text in the instance's own i18n/
  sections: [{ move: 'first-human-in-the-loop-agentic-workflow', after: 'manage-the-price' }], // move | hide | insert, by slug
  slides: {
    'pay-the-price': { messages: { de: payThePriceDe } }, // long text: an overrides/ file, imported
    'a-thought-experiment': { messages: { en: { heading: "You're the manager" } }, hide: ['team'] }, // short text inline
    'attention-is-a-budget': { explorables: { context: 'slide-5-short' } }, // a Preset in the Explorable's YAML
  },
});
```

- **Text.** A nested partial of the Slide's messages, typed from its own `en.json` and `de.json`. The table of contents, the Slide header and the Context drawer read the resolved text, so an overridden `title` or `heading` shows there unchanged.
- **Hide.** `hide` takes names the Slide already exposes with `target(...)`. An unknown name is a type error.
- **Keys.** `slides` is keyed by Slide slug, typed from the Base Slide messages map `npm run registry` generates (`src/episodes/lib/episode-instance-slides.generated.ts`). An unknown slug or key is a compile error; the instance imports no base Slide file.
- **Structure.** `sections` is an array of operations, `{ move, after }`, `{ hide }` and `{ insert, after }`, each naming Slides by slug. A Slide the base adds later still appears in the Episode instance. In a Section without a section slide, its opening Slide cannot move or have a Slide placed before it; hiding it hides the Section.
- **Inline or file.** Short text sits inline in `episode.ts`; long text, and every recorded Voice script, is an `overrides/<slide-slug>.<locale>.json` file.
- **Presentation.** `slides.<slug>.presentation` replaces that Slide's presentation, standard looks included ([Slide transitions](slide-transitions.md#standard-looks)).

## Pinning

`npm run overrides:pin -- <episode-id>` writes the **Pin lock**, `overrides.lock.json`: one **Pin** per overridden path (Slide text by leaf, a Slide's presentation, a Preset id, the Title's notes and text), taken from the base default. An override without a Pin fails, and so does a Pin with no override. The fast suite fails when a pinned default changes. Then either:

- run the pin command again to keep the Episode override (you accept the new base under it), or
- delete the Episode override to show the new default.

`npm run registry` never pins.

## Recorded Voice script

Post-production (`episode-transcript-to-voice-script`) writes a Voice script rewritten from the Episode instance's recording to `overrides/<slide-slug>.<locale>.json`, then runs `npm run registry` and `npm run overrides:pin -- <episode-id>`. To make it every Episode instance's default, adopt it: move the text into the base Slide's `i18n/` and delete the Episode override.

## Checks

- **Published anchors:** the Episode instance's `published-anchors.json` must still be produced, so hiding or losing a Slide that has a published anchor fails.
- **Slide starts:** a Slide start in `recording/` must name a Slide the Episode instance still shows.
- **Pinned overrides:** the fingerprint check under Pinning.
- **Slide pool:** every pool Slide is composed by two or more different Base Episodes.
- **Episode outline:** `npm run registry` writes it from the resolved record, and the tools read it.
