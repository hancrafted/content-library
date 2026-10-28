---
type: feature-guide
title: AI disciplines Explorable explanation
stale_after: 2027-04-28T00:00:00Z
---

# AI disciplines Explorable explanation

Read before placing, changing or testing the AI disciplines timeline (`src/explorables/ai-disciplines/`). Binding rules: [FE-012 Explorables](../../../.archgate/adrs/FE-012-explorables.md), [FE-006](../../../.archgate/adrs/FE-006-server-client-boundary.md) §5, [FE-007](../../../.archgate/adrs/FE-007-module-layering.md) §5 and [FE-011](../../../.archgate/adrs/FE-011-design-tokens.md). This guide holds the detail that does not bind.

## What it shows

Four disciplines on one language model, left to right: Prompting, Agents, Workflows and the Factory. Each column holds, top to bottom: its dot and years on the rail, a card that turns over to a definition with its source, a scene that plays how it reaches the model, and the interface it reaches the model through, with a wire down to the model. Above the columns, one "comparable to" card names a scale per column (a task, a specialist, a team, an organisation); below them, the model band says it predicts the next token, typing one token at a time.

Years, definitions and sources come from research LLM-0018 (`docs/llm-wiki/research/LLM/LLM-0018__ai-layers-model-to-factory/research.md`). A change to a year or a definition starts there.

Its Explorable page, `/explorables/ai-disciplines/`, shows the `timeline` Preset with a readme (`src/episodes/explorable-pages/ai-disciplines/`).

## Placing it on a Slide

```tsx
<AiDisciplines
  preset="timeline"
  locale={locale}
  targets={{ agents: target('agents') }}
  markers={{ agents: <Marker note="agents" placement="beside" /> }}
/>
```

- `preset`: `timeline` rests until a pointer enters a column; `recap` rests the same way and lights workflows. Presets live in `ai-disciplines.config.yml`; `autoplay: true` would play the four scenes once in turn when the Slide scrolls into view.
- `words`: overrides any default word, at any depth — `{ disciplines: { factory: { year: '2026' } } }`.
- `targets` and `markers`: per discipline, the column a Speaker note lights and the Context marker placed on its card.

Shown by the CyberForum intro: Slide `grounding` (`timeline`) and Slide `check-in-3--disciplines-recap` (`recap`).

## How it moves

`scene-frames.pure.ts` holds every scene as frames: a frame is a full snapshot (messages, a dot on the wire, the agent's loop count, the workflow's node states, the factory's requests in flight) and how long it holds. The player (`scene-player.client.tsx`) only steps an index. At rest, in the static export and under reduced motion, every scene shows its last frame and nothing moves. Hovering or focusing a column lights it, dims the others and loops its scene; "Play all" plays the four in turn. Every message to the model is a dot down its wire and back, in step with the scene: the prompt; an agent's three loops (the request, then each tool's result); one dot per working workflow agent (three at the fan-out); one per factory request on its own lane, on a fast 150 ms clock: each enters, goes to the model and back, and only then leaves as a result. Requests arrive at uneven times from a fixed seeded sequence, at most five in flight at once. `onWire(frame)` turns a frame into the dots on its wire. The model band types tokens while a wire brings it work or the mouse is on a column.

## Tests

- `scene-frames.pure.test.ts`: the choreography of each scene.
- `ai-disciplines.test.ts`: the config pair's parity, the server render, the words override, the Presets.
- `ai-disciplines.browser.test.ts` (`npm run test:browser`, on the built export): a card and the model band turn to their definition, hover lights a column, a turned-away face keeps its link out of the tab order, the recap lights workflows, the scenes rest until hovered, a square travels its wire, and the four wires end level in both locales.
