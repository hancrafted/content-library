---
type: adr
id: FE-012
title: "Explorables"
domain: frontend
rules: false
files: ["src/explorables/**", "src/episodes/components/slide-shared/**"]
paths: ["src/explorables/**", "src/episodes/components/slide-shared/**"]
description: "An Explorable may own its data and default words in its own folder, as a locale pair of files or one file holding both locales under i18n, picked by the path locale on the server at build time; every Slide that shows it overrides any default word by props, and a plain slide-shared part still owns no words."
---

# Explorables

## Context

> Amended by the Decision record _Content data model_ (docs/decision-records/0016-content-data-model.md): an Explorable lives in its own folder, `src/explorables/<name>/` in the Explorables product area, apart from plain shared parts; the rules below are unchanged.

An **Explorable** is one interactive visual several Slides show, each by its own **Preset** — the context window cornerstone shows on about ten Slides of one Episode. It is drawn from data: a chat log of dozens of steps, category labels, token budgets, the Presets themselves, in English and German.

Without this record a plain `slide-shared` part owns no words, so that data has no home:

1. **In every Slide's `i18n/`:** ten Slides repeat the same labels and the same chat; a fix lands in one and drifts in nine. A Slide cannot import another Slide's words, so there is no single copy to point at.
2. **In the Episode folder:** a `slide-shared` part may not import an Episode, so the part cannot read it; each Slide would pass the whole chat down as props.
3. **In page chrome's or a template's Translation files:** those homes are for site chrome and cards, and a long chat log there swamps them.

Chosen: the visual's folder holds the data and default words once per locale, and a Slide still has the last word.

For this project the chat and its labels are one artifact, authored together from a real session log and translated together; splitting them across ten folders breaks the "a new Slide is new data, not a new drawing" promise an Explorable exists for.

## Decision

### 1. One set of both locales per Explorable

1. An Explorable MAY hold, in its own folder, config (Presets, numbers, default words) and data as a pair (`<name>.config.yml` + `<name>.config.de.yml`) or as one file with both locales under a top-level `i18n: { en, de }`, structure once at the top.
2. The server MUST pick the locale by the path at build time, through static imports — never fetched, never chosen by the browser. A client leaf gets one locale only.
3. Both locales MUST hold the same keys (and steps); only words differ. The loader MUST refuse a gap at build time, naming file, locale and key.

### 2. The Slide has the last word

1. The server entry MUST take a `words` prop that overrides every default word, key by key.
2. A Slide's own claim (title, caption, callouts, notes) stays in the Slide's folder; the visual's defaults are labels and story data.

### 3. Scope

1. This admits a text home for an Explorable only: a part with Presets, used by two or more Slides. Any plain `slide-shared` part owns no words and takes them as props.
2. An Explorable's data is content: it owns no route, no anchor and no Episode metadata.

### 4. Parts of an interactive Explorable

1. A multi-panel visual MUST be built from controlled parts: the parent owns all state and the Preset; each part gets its slice as props and sends events up by callbacks.
2. Hover and pin MUST be brushing and linking: the parent holds the lit key, each part turns it into one `on` boolean per item and passes that to a memoised item, so a hover redraws only items whose `on` flipped.
3. `renderMode` (Simple or Technical) MUST be one global value plus a per-part override in the parent's state; the latest action wins. `orientation` is a prop.
4. Controls MUST come from a typed registry in code; a Preset's `controls` map overrides it key by key. One definition says what a control flips.
5. A part a Server Component can show alone MUST be a pure `*-view.tsx` (no hooks, no handlers).

## Do's and Don'ts

### Do's

1. **DO** keep an Explorable's chat, labels and Presets in its folder, as one pair per locale — `summer-party.jsonl` beside `summer-party.de.jsonl` — or as one file with `i18n: { en, de }` and structure once at the top level. (Decision 1)
2. **DO** import both locales statically and pick one on the server by the path locale. (Decision 1)
3. **DO** give the server entry a `words` prop that overrides any default word. (Decision 2)
4. **DO** put a Slide's own title, caption and callouts in its own `i18n/`. (Decision 2)
5. **DO** check at build time that both locales hold the same keys (and steps), and refuse a gap naming file, locale and key. (Decision 1)
6. **DO** hand each part a slice plus callbacks, `onLight`/`onPin`, never the state. (Decision 4)
7. **DO** compute `on` per item in the part and pass the boolean to a memoised item. (Decision 4)
8. **DO** read a part's mode as `renderModes[part] ?? global`. (Decision 4)
9. **DO** add a control to the registry, not as a loose Preset flag. (Decision 4)
10. **DO** name a statically rendered part `*-view.tsx`. (Decision 4)

### Don'ts

1. **DON'T** copy an Explorable's chat or labels into each Slide that shows it. (Decision 1)
2. **DON'T** read the locales at runtime or by `Accept-Language`, or send a client leaf both locales. (Decision 1)
3. **DON'T** repeat structure (ids, numbers) inside each locale of an `i18n` file. (Decision 1)
4. **DON'T** put a Slide's argument in the visual's config — `story:` holds the visual's data, not a Slide's caption. (Decision 2)
5. **DON'T** give words to a `slide-shared` part that has no Presets or one user. (Decision 3)
6. **DON'T** pass a shared `View` object or `dispatch` into a part. (Decision 4)
7. **DON'T** hook or attach handlers in a `*-view.tsx`. (Decision 4)

## Consequences

**Positive:**

1. **One copy:** a label or chat fix lands once and shows on every Slide.
2. **Slides stay data:** a new Slide showing the visual is a Preset and a few words.
3. **Locale safe:** a static pick renders complete in both exports, no hydration flash.

**Negative:**

1. **Fourth text home:** an author looks in the visual's folder as well as the Slide, the Episode and the Translation files.
2. **Bigger part:** the folder carries Episode-flavoured content, so moving it to another Episode means new data.
3. **Override discipline:** a Slide's word and a default can disagree silently.

**Risks:**

1. **The locales drift:** English gains a step or key German lacks. **Mitigation:** the loader compares the keys (and steps) of both locales at build time and refuses a gap.
2. **Defaults grow into Slide copy.** **Mitigation:** review duty below; a Slide's claim moves to its `i18n/`.

## Compliance and Enforcement

1. **Loader and tests:** each Explorable's loader refuses, at build time, a key one locale lacks, naming file, locale and key; its tests cover that refusal, matching steps of a pair, and that `words` overrides a default.
2. **Types:** the words type keys the config and the `words` prop alike.

**Manual review duties:** words sit in an Explorable's pair only when it has Presets and two users (§3); no Slide caption or callout hides in `story:` (§2); the locale is picked statically on the server and a client leaf receives one locale (§1).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`GLOSSARY.md`](../../GLOSSARY.md) — Explorable, Preset.
- [Next.js — Static Exports](https://nextjs.org/docs/app/guides/static-exports) — build-time rendering of both locales.
