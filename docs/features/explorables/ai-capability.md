---
type: feature-guide
title: AI capability Explorable
stale_after: 2027-04-28T00:00:00Z
---

# AI capability Explorable

Read before placing, changing or testing the AI capability timeline (`src/explorables/ai-capability/`). Its visual Spec, the reviewed target design with per-item feedback, is [`ai-capability.spec.html`](ai-capability.spec.html): open it in a browser, and update it in place with `/to-html-spec` before changing the design. Binding rules: [FE-012 Explorables](../../../.archgate/adrs/FE-012-explorables.md), [FE-006](../../../.archgate/adrs/FE-006-server-client-boundary.md) §5, [FE-007](../../../.archgate/adrs/FE-007-module-layering.md) §5 and [FE-011](../../../.archgate/adrs/FE-011-design-tokens.md). This guide holds the detail that does not bind.

## What it shows

Four Levels of AI capability on one language model, left to right: Chat, Agents, Workflows and the Factory. Each column holds, top to bottom: its dot and years on the rail, a card that turns over to a definition with its source, the rows the toolbar adds, the last of them Explain: a scene that plays how the Level reaches the model, and the interface it reaches the model through, with a wire down to the model band. The model band is always on.

The toolbar on top, in the context window's look (its CSS copied into `ai-capability.module.css`, since one Explorable never imports another), switches six rows, each an independent toggle held in memory only (FE-001 transient state). The chips list Explain first (`CHIP_ORDER`); the rows stack in registry order (`ROWS` in `rows.pure.ts`) whichever is switched on first, Explain last, above the model band. The page opens with Explain on and the other five off. The toolbar is sticky, just under the floating site header (`top: var(--header-block) + 0.25rem`), so the rows stay switchable while their cards scroll.

- **Managing effort:** what the Level asks you to manage, a task up to an organisation, as in a promotion.
- **Productivity increase:** the claimed range, tagged a hypothesis, on a log track from 1× to past the 20× promise, with the measured range under it where a study exists. Numbers sit in `productivity:` in the config pair; the evidence is research LLM-0019.
- **Adoption:** one number per Level and the population it was measured in, no bars, since each comes from a different survey; Factory has no data yet and carries what leaders expect, tagged a hypothesis. Evidence: research LLM-0025.
- **AI disciplines:** Prompt, Context, Harness, Loop and Graph engineering, a stack that builds from the bottom up (Prompt at the bottom, Graph on top), each a card spanning the Level edges where it applies to the end of the Factory (`layers:` in the config pair, `spans.pure.ts`), Loop and Graph tagged emerging. Evidence: research LLM-0023.
- **Oversight:** HITL, HOTL and HOOTL as a stack too (HITL at the bottom from the start of Agents, HOTL from the middle of Agents, HOOTL on top from the middle of Workflows), all running to the end of the Factory, tagged a hypothesis; the terms' origin in the debate on weapon autonomy is the timeline Slide's `oversight-origin` Speaker note, targeted on the Oversight chip. Evidence: research LLM-0024.
- **Explain:** the scene and the wire to the model, as above.

The two layer rows share one look (`layer-row.client.tsx`, `layer-row-view.tsx`): each card draws a mini workflow, its name and a one-liner and is a disclosure: a click opens it to the definitions of the item, each with who gives it and a link to the page (`definitions:` per item in the config pair; vendor pages found in research, quotes verbatim in English and translated in German). Cards open independently of each other. The parent holds which cards are open (`layer-light.client.tsx`), and each memoised card gets only its `open` boolean (FE-012 §4.1). Wide, a layer row spans the four columns on eight half-Level tracks; narrow, each Level's card shows its slice, with › where a span continues. The page scrolls when AI disciplines is on.

Layout follows the container's width, not the viewport: from 48rem the four columns share a subgrid so each row's cards end level; below it the columns become a scroll-snap carousel with dots and arrows, and the card in view plays its scene. The carousel serves the 9:16 recording for YouTube Shorts from the same page.

Years, definitions and sources come from research LLM-0018 (`docs/llm-wiki/research/LLM/LLM-0018__ai-layers-model-to-factory/research.md`). A change to a year or a definition starts there.

Its Explorable page, `/explorables/ai-capability/`, shows the `timeline` Preset with a readme (`src/episodes/explorable-pages/ai-capability/`).

## Placing it on a Slide

```tsx
<AiCapability
  preset="timeline"
  locale={locale}
  targets={{ agents: target('agents') }}
  markers={{ agents: <Marker note="agents" placement="beside" /> }}
/>
```

- `preset`: `timeline` rests until a pointer enters a column; `recap` rests the same way and lights workflows. Presets live in `ai-capability.config.yml`; `autoplay: true` would play the four scenes once in turn when the Slide scrolls into view.
- `words`: overrides any default word, at any depth — `{ levels: { factory: { year: '2026' } }, rows: { label: 'Rows' } }`.
- `targets` and `markers`: per Level, the column a Speaker note lights and the Context marker placed on its card.
- `rowTargets`: per layer row, the `data-target` a Speaker note lights, placed on that row's chip, which renders whether the row is shown or not.

Shown by the CyberForum intro: Slide `grounding` (`timeline`) and Slide `check-in-3--disciplines-recap` (`recap`).

## How it moves

`scene-frames.pure.ts` holds every scene as frames: a frame is a full snapshot (messages, a dot on the wire, the agent's loop count, the workflow's node states, the factory's requests in flight through its building) and how long it holds. The player (`scene-player.client.tsx`) only steps an index. At rest, in the static export and under reduced motion, every scene shows its last frame and nothing moves. Hovering or focusing a column lights it, dims the others and loops its scene; "Play all" plays the four in turn. Every message to the model is a dot down its wire and back, in step with the scene: the prompt; an agent's three loops (the request, then each tool's result); one dot per working workflow agent (three at the fan-out); one per factory request on its own lane, on a fast 150 ms clock: each enters, goes to the model and back, and only then leaves as a result. Requests arrive at uneven times from a fixed seeded sequence, at most five in flight at once. `onWire(frame)` turns a frame into the dots on its wire. The model band types tokens while a wire brings it work or the mouse is on a column.

## Tests

- `scene-frames.pure.test.ts`: the choreography of each scene.
- `rows.pure.test.ts`: row order whichever chip is pressed first, the chip order, a shown row's grid line, and where a multiplier sits on the productivity track.
- `spans.pure.test.ts`: a span's positions on the four Levels, its slice per Level, and the fade stops of its drawn part.
- `ai-capability.test.ts`: the config pair's parity (words, Presets, productivity, layers), every span end naming a Level and an edge, the server render (Explain first and on, the five other chips off, no row shown), the Factory drawn as a building with a question mark, the layer stacks' order and spans, every layer item holding a definition with a source page, the words override, the Presets.
- Manual browser checks on the built export: a card and the model band turn to their definition, hover lights a column, a turned-away face keeps its link out of the tab order, the recap lights workflows, the scenes rest until hovered, a square travels its wire, the four wires end level in both locales, a chip blends its row in and out, rows stack in toolbar order, toolbar to model band fits 1440×900 with one row on, the layer rows hover, pin and slice without clipping at 1440 and 390 in both themes, and the phone carousel steps Levels with its arrows.
- `tests/post-build/explorables.build.test.ts`: the retired `/explorables/ai-disciplines/` URL is gone in both locales.
