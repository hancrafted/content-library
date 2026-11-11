---
type: design-adr
title: Software ecology flow model and use-case files
status: accepted
---

# Software ecology flow model and use-case files

The software ecology Explorable (`src/explorables/software-ecology/`) shows an organization as a factory. Orders come in, conveyor belts carry documents between work centers, work waits in inbound queues, inspection is the review, and results leave from a shipping dock. Each role is a work center with two dials, efficiency (how much it puts out) and effectiveness (how likely a handoff is good). AI raises a work center's output and leaves its quality alone. Every queue, rework loop and shipment comes from one model fed by one data file per use case. A new use case is therefore data, and the numbers on a card always match the picture. The product design (concept, use cases, interaction, visuals) is in [the feature guide](../features/explorables/software-ecology.md); this record binds the contract every use case is written against.

## Human acceptance

Han chose these decisions in three grills of the `software-ecology` Episode Run (`/new-episode`, branch `episode/software-ecology`):

- **2026-11-10, architecture grill:** questions 1 to 24, answered one by one, with each "Decided without asking" line left uncontested. He asked for this record with "write adr".
- **Spec round 1** (`docs/episodes/software-ecology/feedback/01/feedback.md`): he replaced the omega on the graph with a pump.
- **2026-11-11, prototype rounds** (`.scratch/software-ecology/prototype/feedback-01.md` to `feedback-03.md`) and the **factory grill**, questions 25 to 38. These moved the analogy from plumbing to a factory, the model from water clarity to efficiency and effectiveness, and the layout to one card component with four views. He confirmed the factory grill's shared understanding with "yes, go ahead".
- **2026-11-11, prototype round 4** (`feedback-04.md`) and its grill, questions 39 to 45: good/bad documents only, rework and churn, customer complaints, inspections that pass bad work under pressure, the shipping dock's grid and the dashboard as a monitor. He confirmed with "yes".

This accepts the design, not an implementation: only a throwaway prototype exists, at `.scratch/software-ecology/prototype/flow.html`.

## Decision

### Model

1. **One seeded, time-stepped model.** `flow-model.pure.ts` advances the factory in fixed steps from a fixed seed and warms up before the first frame. Every combination of use case, preset and dials therefore shows one defined picture at rest, and chaos can still emerge from the dials. The renderer reads the model's state; it never feeds it.
2. **A node is a work center, one per role.** People are optional clusters of node ids, and a person's load is the sum of their roles'. Order intake (`source`) and the shipping dock (`sink`) are node kinds pinned to the two ends. The intake has a Demand dial and a backlog; customers give up when it is full.
3. **Two dials per work center, plus fan-out.**
   - **Efficiency** sets the work center's speed, so raising it pushes more work downstream and can make the next work center the bottleneck.
   - **Effectiveness** sets the chance that a handoff is good or bad.
   - **Output per input (fan-out)** sets how many documents one input becomes (one spec, five documentation pages).
   - A handoff's quality is the worse of what came in and the work center's own result.
4. **Queues are bounded.** Each work center's inbound queue has a buffer set in the use-case file. Past it, work backs up the belt to the work center upstream and, at the end of the line, to the intake. Every steady state stays finite.
5. **Bad work does damage downstream.** Each mechanic has a strength in the use-case file and a visible sign:
   - **rework:** a bad input is sent back upstream on a separate return belt, with a probability.
   - **churn:** a bad input that is kept multiplies the receiving work center's fan-out (follow-up questions, patches).
   - **extra work:** a bad input takes the receiving work center longer.
   - **customer complaints:** a bad shipment sends a complaint into support, an input source that adds work to the system.
   - **passing unread:** every inspection passes more bad work unflagged as its queue fills (`stampUnderPressure`, no toggle).
     Isolating work centers, following an order and taking a work center out are removed; an overlay seam keeps the first two easy to bring back.
6. **AI raises output and leaves quality alone.** Per work center, AI multiplies speed and fan-out by the role's profile in the role catalog. Effectiveness stays as it was (Brief Constraint: AI is an accelerator, never a solution). An "AI quality effect" setting in the model, default `same`, lets a scenario show AI improving or worsening quality, so the model never implies that AI cannot raise quality.
7. **Readouts are bands, not counts.** Every number on screen is relative to the use case's balance ("1.8× the balance", "full"), and the stage reads "Illustrative model, not measured". The constants are tuned to tell the story; nobody measured them.

### Files

8. **One use-case file and its locale pair.** `<use-case>.yml` holds the master data: work centers (`role`, position hints, enabled dials and their defaults, buffer), belts `{ from, to, artefact }` and separate return belts, sources such as customer complaints, damage strengths, AI profile overrides and `presets`. `<use-case>.words.yml` and `<use-case>.words.de.yml` hold every word keyed by id ([FE-012-explorables](../../.archgate/adrs/FE-012-explorables.md) §1: same keys, words differ).
9. **A shared role catalog.** `roles.yml` and its words pair give each role its classic artefacts, its execution tasks and its AI examples, e.g. sales turns leads into deals and requirements for the product manager and analyst. A use case names a role by id and overrides only what differs.
10. **Presets are one ordered row of states.** `presets: [{ id, view, reality, dials?, ai?, compare? }]` render in order as the toolbar's state row. `view` is `swing`, `roles` or `factory`. `compare` lists up to three work centers and opens the compare stream.
11. **Download and Upload exchange one file.** Download writes the current state as one YAML with every language at its root, `i18n: { en: {…}, de: {…} }`. Upload validates such a file with the zod schema, splits it in the browser and loads it. The shipped source stays the use-case file plus its locale pair, picked at build time, so FE-012-explorables §1 holds; the exchange file is runtime data a visitor brings. Upload ships in v1 with an issue tracking its validation errors.
12. **Checks.** A zod schema test per use-case file and for the exchange format, the FE-012-explorables pair test per words pair, and the build throws on any broken shipped file. `flow-model.pure.test.ts` holds characterisation cases per use case: balance ships only good work; a slower engineer becomes the bottleneck; AI at engineering raises output and leaves the share of good work unchanged.

### Rendering

13. **One card component with four views.** `WorkCenterCard` takes `cardView: swing | role | station | dashboard`.
    - **Swing and Roles:** a responsive row of cards with no belts.
    - **Factory:** places each card on the line as a station; a GSAP FLIP morph carries each card from the row to its station.
    - **Dashboard:** status, dials, the role's artefacts and tasks, and what AI does there.
      The name is not `renderMode`, which FE-012-explorables §4.3 reserves for Simple and Technical.
14. **DOM for structure, canvas for flow.** Work centers, belts, cards and the toolbar are DOM/SVG, labelled and keyboard reachable. The documents on the belts are one canvas behind a `FlowRenderer` seam (`draw(ctx, state, t)`). The flow holds 60fps under a fixed cap, pauses off-screen and shows one steady frame under reduced motion. A document parks inside a station while a progress ring fills, in the `ai` tint and faster where AI is on; belt motion can be switched off.
15. **Document icons show quality and origin.** A plain document is good; a red minus marks bad, a red warning marks a complaint or rework, and an AI-made document has an orange border, a light orange fill and a star; the marks combine. Fan-out leaves as separate documents. AI is drawn as a turbo on the belt.
16. **The shipping dock shows output beside outcome.** A 3×4 grid of the last twelve shipments, each good or bad with complaints marked, gives the customer satisfaction rate under it; output relative to balance sits beside it, so more output next to a redder grid reads at once.
17. **Selection and compare.**
    - **One work center:** clicking it opens its dashboard as a popover anchored to it, which closes on a second click, × or Esc. The dashboard is a monitor: a traffic light, signals (keeping up, bottleneck, starved, overloaded, rework-heavy, passing unread) and trend charts of output, outcome and queue; only the AI toggle sits on it, and the dials are in a collapsed Settings section.
    - **Compare mode** (a toolbar toggle, or shift-click): select up to three work centers. The Compare button flattens them into a three-column stream, with the station view above the dashboard view in each column, a "+n stations" gap for skipped ones, an overview strip, and Exit to return.
    - Belts between neighbouring columns carry the live flow.
    - The parent owns the selection, the compare set and the help toggle; each part gets its slice and callbacks (FE-012-explorables §4).
18. **Progressive disclosure.** At rest only belts, work centers and documents show. Queue trays, counts and damage signs appear under pressure, with a gap between showing and hiding so they never flicker, or on hover and focus. Help text shows on every card while the shared help toggle is on; otherwise controls carry tooltips.
19. **Layout is data plus computation.** The use-case file gives position hints; a pure layout keeps a minimum belt before and after every station and places the work centers on a wide stage and stacks them below a breakpoint, and the compare stream is a computed linear layout.

## Alternatives and cost

- **The plumbing analogy** (this record's first version) had nothing that read as rework or extra work, and in the prototype its dotted water read as clutter. Han knows those mechanics from manufacturing.
- **A steady-state model** (the first version) gave defined numbers, but a faster upstream work center simply idled, so the dials changed nothing visible.
- **Words inside the shipped use-case file** under `i18n:` would break FE-012-explorables §1 and ship German into every English page; only the exchange file carries them.
- **Damage mechanics as prototype switches** would hide the very effects Han wants managers to see.

The cost:

- The time-stepped model needs its seed, warm-up and characterisation tests to stay presentable.
- Upload adds a validation surface.
- The Brief's Analogy and the Dossier's spoken words are rewritten in the factory vocabulary.

## Relationship to binding rules

Implements [FE-012-explorables](../../.archgate/adrs/FE-012-explorables.md) (locale pair, `words` override, controlled parts, control registry) and the Explorable floor in [docs/features/explorables/README.md](../features/explorables/README.md). It waives no binding rule.
