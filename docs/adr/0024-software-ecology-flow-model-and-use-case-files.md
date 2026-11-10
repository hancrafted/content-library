---
type: design-adr
title: Software ecology flow model and use-case files
status: accepted
---

# Software ecology flow model and use-case files

The software ecology Explorable (`src/explorables/software-ecology/`) shows an organization as plumbing: roles are stretches of pipe that specify, execute and review, handoffs are the pipes between them, AI is a pump, and requirement quality is water clarity. Every pressure readout, leak and payoff comes from one pure model fed by one data file per use case, so a new use case is data and the numbers on a card always match the picture. The product design (concept, use cases, interaction, visuals) is in [the feature guide](../features/explorables/software-ecology.md); this record binds the contract every use case is written against.

## Human acceptance

Han chose every decision below in the architecture grill of the `software-ecology` Episode Run (`/new-episode`, branch `episode/software-ecology`), on 2026-11-10, answering questions 1 to 24 one by one and leaving each "Decided without asking" line uncontested. He asked for this record with "write adr" and confirmed its scope with "1" to the question of where the design lives. In Spec round 1 (`docs/episodes/software-ecology/feedback/01/feedback.md`) he replaced the omega on the graph with a pump attached to the pipe, named documents and liquid as the two flow Options, and removed the magnifier lens; decisions 18, 19 and 21 carry that.

This accepts the design, not an implementation: none exists yet.

## Decision

### Model

1. **One pure steady-state model.** `flow-model.pure.ts` takes a use case and the dials (global pump and clarity, per-node AI and context rot) and returns numbers per node and per edge: inflow, throughput, waiting, leak, ratio of load to capacity, clarity. Same inputs, same numbers. It recomputes only when an input changes; the animation reads the cached result and never feeds it.
2. **A node is a role.** People are optional clusters of node ids; a person's pressure is the sum of their roles'. The two customers are node kinds `source` (intake) and `sink` (tap), with no card and no omega, pinned to the two ends.
3. **Flow runs downstream with backpressure, then leaks.** Within its buffer a node over capacity queues work and throttles the node upstream of it; past the buffer it leaks the excess at the valve itself. So `waiting ≤ buffer` everywhere, every steady state is finite, and the animation can loop. Buffer and leak threshold are set per node in the use-case file, over use-case defaults.
4. **A leak is lost work and lost meaning.** It lowers throughput to the tap and dims clarity downstream of the leaking node.
5. **Clarity is a number from 0 to 1.** It multiplies along each edge by every node's context rot and leak, in the same pass as pressure. AI never changes clarity: the pump scales rates only (Brief Constraint: AI is an accelerator, never a solution).
6. **Sediment narrows the pipe in the model.** Context rot lowers a node's capacity as well as its clarity, so the narrowed pipe and the readout agree.
7. **AI acts through a per-node profile.** `ai: { execute, volume, reviewLoad }` multipliers over the use case's `aiDefaults`, scaled by the pump and the node's own AI dial. `volume` carries the product side's flood of material nobody can review.
8. **Readouts count over a period.** The use-case file names its `period` (e.g. `week`). A card shows counts ("14 waiting for review", "6 dropped a week"); the graph shows the ratio as pipe fill.
9. **The tap shows outcome and rate.** Outcome bands in the use-case file map clarity at the tap to a payoff asset (the tire swing, a wrong swing); throughput gives how many per period.

### Files

10. **One structure file per use case, one words pair.** `<use-case>.yml` holds ids, `steps`, `panels`, `period`, `aiDefaults`, nodes (`kind`, `zone`, capacities, `buffer`, `leak`, `ai`), `people`, edges and outcome bands. `<use-case>.words.yml` and `<use-case>.words.de.yml` hold every word keyed by id (FE-012-explorables §1: same keys, words differ).
11. **Edges are `{ from, to, artefact }`.** The artefact's name sits in the words pair under its id; the spec edge carries `joinsZones: true` for the label joining the product and software lifecycles.
12. **Card cells.** Each node's words give a 2×3 grid (`human`/`technical` × `specify`/`execute`/`review`), one line per cell, plus an optional `withAi` line on the cells whose meaning changes.
13. **Steps are use-case data.** `steps` lists which of Swing → Roles → Pipeline → AI a use case offers; the toolbar shows only those. Only a use case with `panels` (each mapped to a node) offers Swing.
14. **Presets live in the Explorable's config pair**, `software-ecology.config.yml` and `.config.de.yml`: `{ useCase, step, pump, clarity, nodes: { <id>: { ai, rot } }, selected?, controls }`.
15. **The pump is the one source of truth for AI.** The AI step only sets the pump (to the Preset's value when it is zero); the pump dial stays live in Pipeline.
16. **Checks.** A zod schema test per structure file, the FE-012-explorables pair test per words pair, and the build throws on any broken shipped file, as the human-in-the-loop Workflows do. `flow-model.pure.test.ts` holds characterisation cases per use case.
17. **No upload in v1.** Visitors cannot load their own use case yet; the format stays upload-ready (structure and words merge into one file), and an issue tracks it.

### Rendering

18. **DOM for structure, canvas for flow.** Nodes, edges, cards and the toolbar are DOM/SVG, labelled and keyboard reachable. The flow is one canvas behind a `FlowRenderer` seam (`draw(ctx, model, t)`), reading only the model's numbers, including `leak[n]` for drops that fall and fade. It holds 60fps under a fixed particle cap, pauses off-screen, and draws one static end frame under reduced motion. Documents passing through the pipe and a liquid stream are two implementations, compared as Spec Options; one ships.
19. **Inspect targets DOM.** Every inspect action targets a node or an edge and opens one "what is stuck here" panel, since a canvas particle takes no focus. No magnifier lens in v1.
20. **Layout is computed.** A pure layered layout ranks nodes by edges, left to right on a wide container, top to bottom below a breakpoint, with zones as lanes; the file gives only `zone` hints, never coordinates.
21. **The graph is a straight pipe; the card holds the omega.** On the graph a node is its glyph and title on the pipe, and with AI on a pump attaches to the pipe at that node and visibly speeds the flow through it; the review valve stays on the pipe after it. The omega (specify, execute, review) is drawn only on the node card, enlarged, from the same numbers. GSAP, already a dependency, morphs the steps (panels → glyphs → graph) by FLIP. The parent owns all state and each part gets its slice and callbacks (FE-012-explorables §4).

## Alternatives and cost

- **A time-stepped particle simulation** gives emergent queues but readouts that depend on how long the tab is open, so a Preset has no defined view at rest.
- **Downstream flow only** never reaches a neighbour upstream; **diffusion** spreads pressure with no real mechanism behind it.
- **A full locale pair per use case**, as human-in-the-loop does, writes every number twice; it wins only once uploads ship, and decision 17 keeps that door open.
- **Authored coordinates** need a second set for phones and break the floor's any-width rule.

The cost: the model's backpressure pass and leak make it more than a one-pass sum, and its numbers are illustrative, tuned per use case to tell the story, not measured.

## Relationship to binding rules

Implements [FE-012-explorables](../../.archgate/adrs/FE-012-explorables.md) (locale pair, `words` override, controlled parts, control registry) and the Explorable floor in [docs/features/explorables/README.md](../features/explorables/README.md). It waives no binding rule.
