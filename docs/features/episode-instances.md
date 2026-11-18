---
type: feature-guide
title: Episode instances
stale_after: 2027-05-18T00:00:00Z
---

# Episode instances

**Status:** accepted 2026-11-18, being built. Until `src/episodes/lib/episode-instance.ts` lands, Event copies are still `cp -r` copies ([Events](events.md), "Unlisted Episodes").

An Event copy is an **Instance** of its **Base Episode** (GLOSSARY). It states only what differs; everything else is the base's current default. The decision and its alternatives are in Decision record _An Event copy is an instance of its Episode_.

## Folder

```text
src/episodes/by-event/<event-slug>/<slug>/
  episode-metadata.ts                   # visibility 'unlisted', publishedOn, youtube: the Instance's own
  episode.ts                            # instanceOf(base, overrides): structure and small overrides
  overrides/<slide-slug>.<locale>.json  # partial of that Slide's i18n/<locale>.json, imported by episode.ts
  overrides.lock.json                   # generated: fingerprint of each overridden default
  published-anchors.json
  recording/                            # Slide starts, YouTube text: the Instance's own
  episode-checks.test.ts
```

There are no `sections/` or `slides/` folders, unless a Slide is **detached** (`slides/<slide-slug>/`, a fork).

## `episode.ts`

```ts
import { instanceOf } from '@/episodes/lib/episode-instance';
import { onboardAiEveryTime } from '@/episodes/onboard-ai-every-time/episode';
import payThePriceDe from './overrides/pay-the-price.de.json';

export const onboardAiEveryTimeAt1104 = instanceOf(onboardAiEveryTime, {
  title: { notes: [{ slug: 'check-in', target: 'title' }] }, // text in the Instance's i18n/
  sections: {
    'five-moves-to-brief-a-freelancer': [
      { move: 'first-human-in-the-loop-agentic-workflow', after: 'manage-the-price' },
    ],
  },
  slides: {
    'pay-the-price': { messages: { de: payThePriceDe } }, // nested partial; objects merge, arrays replace
    'a-thought-experiment': { messages: { en: { heading: "You're the manager" } }, hide: ['team'] },
    'attention-is-a-budget': { explorables: { context: 'slide-5-short' } }, // a Preset in the Explorable's YAML
  },
});
```

- **Text.** A nested partial of the Slide's messages, typed from its own `en.json` and `de.json`. The table of contents, the Slide header and the Context drawer read the resolved text, so an overridden `title` or `heading` shows there unchanged.
- **Hide.** `hide` takes names the Slide already exposes with `target(...)`. An unknown name is a type error.
- **Structure.** `sections` takes `move`, `hide` and `insert` operations keyed by Slide slug. A Slide the base adds later still appears in the Instance.
- **Presentation.** `slides.<slug>.presentation` replaces that Slide's presentation, standard looks included ([Slide transitions](slide-transitions.md#standard-looks)).

## Pinning

`npm run overrides:pin -- <episode-id>` writes `overrides.lock.json`: one fingerprint per overridden path, taken from the base default. The fast suite fails when a pinned default changes. Then either:

- run the pin command again to keep the Override (you accept the new base under it), or
- delete the Override to show the new default.

`npm run registry` never pins.

## Recorded Voice script

Post-production writes a Voice script rewritten from the Instance's recording to `overrides/<slide-slug>.<locale>.json`. To make it every Instance's default, **adopt** it: move the text into the base Slide's `i18n/` and delete the Override.

## Checks

- **Published anchors:** the Instance's `published-anchors.json` must still be produced, so hiding or losing a Slide that has a published anchor fails.
- **Slide starts:** a Slide start in `recording/` must name a Slide the Instance still shows.
- **Pinned overrides:** the fingerprint check under Pinning.
- **Slide pool:** every pool Slide is composed by two or more different Base Episodes.
- **Episode outline:** `npm run registry` writes it from the resolved record, and the tools read it.
