---
type: feature-guide
title: AI capability Explorable
stale_after: 2027-04-28T00:00:00Z
---

# AI capability Explorable

Read before placing, changing or testing the AI capability timeline (`src/explorables/ai-capability/`). Binding rules: [FE-012 Explorables](../../../.archgate/adrs/FE-012-explorables.md), [FE-006](../../../.archgate/adrs/FE-006-server-client-boundary.md) §5, [FE-007](../../../.archgate/adrs/FE-007-module-layering.md) §5 and [FE-011](../../../.archgate/adrs/FE-011-design-tokens.md). This guide holds the detail that does not bind.

## What it shows

Four Levels of AI capability on one language model, left to right: Prompting, Agents, Workflows and the Factory. Each column holds, top to bottom: its dot and years on the rail, a card that turns over to a definition with its source, the rows the toolbar adds, the last of them Explain: a scene that plays how the Level reaches the model, and the interface it reaches the model through, with a wire down to the model band. The model band is always on.

The toolbar on top, in the context window's look (its CSS copied into `ai-capability.module.css`, since one Explorable never imports another), switches four rows, each an independent toggle held in memory only (FE-001 transient state), stacking in registry order (`rows.pure.ts`) whichever is switched on first. The page opens with Explain on and the other three off.

- **Role:** what the Level is comparable to: a task, a specialist, a team, an organisation.
- **Ceiling:** the claimed productivity range, tagged a hypothesis, on a log track from 1× to past the 20× promise, with the measured range under it where a study exists. Numbers sit in `ceilings:` in the config pair; the evidence is research LLM-0019.
- **Mismatch:** one dashed band from "most people are here" (Prompting) to "leaders expect this" (Factory), with each Level's evidence and source under its stretch. Evidence: research LLM-0020.
- **Explain:** the scene and the wire to the model, as above.

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

Shown by the CyberForum intro: Slide `grounding` (`timeline`) and Slide `check-in-3--disciplines-recap` (`recap`).

## How it moves

`scene-frames.pure.ts` holds every scene as frames: a frame is a full snapshot (messages, a dot on the wire, the agent's loop count, the workflow's node states, the factory's requests in flight) and how long it holds. The player (`scene-player.client.tsx`) only steps an index. At rest, in the static export and under reduced motion, every scene shows its last frame and nothing moves. Hovering or focusing a column lights it, dims the others and loops its scene; "Play all" plays the four in turn. Every message to the model is a dot down its wire and back, in step with the scene: the prompt; an agent's three loops (the request, then each tool's result); one dot per working workflow agent (three at the fan-out); one per factory request on its own lane, on a fast 150 ms clock: each enters, goes to the model and back, and only then leaves as a result. Requests arrive at uneven times from a fixed seeded sequence, at most five in flight at once. `onWire(frame)` turns a frame into the dots on its wire. The model band types tokens while a wire brings it work or the mouse is on a column.

## Tests

- `scene-frames.pure.test.ts`: the choreography of each scene.
- `rows.pure.test.ts`: row order whichever chip is pressed first, and where a multiplier sits on the ceiling track.
- `ai-capability.test.ts`: the config pair's parity, the server render (the three chips start off, no row shown), the words override, the Presets.
- `ai-capability.browser.test.ts` (`npm run test:browser`, on the built export): a card and the model band turn to their definition, hover lights a column, a turned-away face keeps its link out of the tab order, the recap lights workflows, the scenes rest until hovered, a square travels its wire, the four wires end level in both locales, a chip blends its row in and out, rows stack in toolbar order, toolbar to model band fits 1440×900 with one row on, and the phone carousel steps Levels with its arrows.
- `tests/post-build/explorables.build.test.ts`: the retired `/explorables/ai-disciplines/` URL is gone in both locales.
