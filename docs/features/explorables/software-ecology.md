---
type: feature-guide
title: Software ecology Explorable
stale_after: 2027-05-10T00:00:00Z
---

# Software ecology Explorable

Read before designing, building or adding a use case to the software ecology Explorable (`src/explorables/software-ecology/`, page `/explorables/software-ecology/`). Not built yet: the `software-ecology` Episode Run designs it in its Spec and builds it in its Build stage. Binding: the design-ADR [Software ecology flow model and use-case files](../../adr/0024-software-ecology-flow-model-and-use-case-files.md) for the model, files and rendering; [FE-012-explorables](../../../.archgate/adrs/FE-012-explorables.md); the Explorable floor in [README.md](README.md). This guide holds the product design, from Han's voice session of 2026-11-10.

## Premises

- The ten-panel tire swing cartoon (https://www.productftw.com/productftw-2-the-tire-swing-cartoon/) is treated as public domain and used as is, from local assets. Check the licence before publishing; it stays on the PR checklist.

## Concept

1. **Two layers run through every use case.** Water clarity (requirements and context quality; context rot is sediment) and the socio-technical node (a human side and a technical side). Use cases change only the graph's shape.
2. **Every node is specify, execute, review.** On the graph it is a stretch of straight pipe with a review valve; with AI on, a pump attaches to the pipe and speeds the flow, while the valve stays narrow. The node card shows the omega: AI pulls the execute part down into a big belly, review stays narrow on the human side. One shape shows "AI moves work from execution to specification and review" at every node, product side included.
3. **AI is a pump, not a filter.** It speeds up whatever flows, clean water or sludge.
4. **Pressure spreads along edges** to neighbouring nodes, not only at the node AI touches.
5. **On the product side, AI floods out material** (templates, docs) that humans cannot consume or review.

## Use cases

Built for many from day one: each is a structure file and a words pair.

1. **Tire swing (v1).** The customer twice: intake on the left, tap on the right. Eight roles, all kept: product manager (project leader), business analyst / architect (analyst), engineer (programmer), sales (business consultant), documentation, operations, billing, support. Each cartoon panel's joke gets an AI twist (the empty docs panel becomes pages nobody reads). The only use case with `panels` and the Swing step.
2. **Startup (v1).** The same eight roles held by three people: CEO (sales, product, billing), CTO (analysis, engineering, operations), COO (documentation, support). Role nodes cluster into people; a person's pressure is the sum of their roles'.
3. **Gatekeeper team (after v1).** Engineering splits into one lead and four engineers; the lead also holds the analyst role and reviews everything, so every engineer drains through one valve.
4. **Marketing team (after v1).** Customer → strategist (brief) → copywriter and designer side by side → brand review → legal review → publishing → customer. AI fills the copy and design bellies with variants; brand and legal become the valves.

## Interaction

1. **Step control in the toolbar:** Swing → Roles → Pipeline → AI. Swing shows the ten cartoon panels; Roles morphs them into role glyphs (SVG) with titles; Pipeline moves them into the left-to-right graph and draws the edges in; AI switches the pump on. A use case shows only its `steps`.
2. **Use case picker** in the toolbar.
3. **Two global dials:** pump speed (how much AI) and water clarity (how good the requirements are).
4. **Node card on click**, with the node's own AI and context-rot dials. Mud added at a node reaches every node after it. Presets set per-node values so a Slide tells its story at rest (e.g. AI at engineering only).
5. **Payoff at the tap:** the right-hand customer shows what comes out and how many: the tire swing with clear water, one of the cartoon's wrong swings with sludge.

## Visuals

1. **Node at rest:** role glyph and title on a straight pipe, with its review valve. With AI on, a pump attaches to the pipe at the node and the flow through it speeds up (Spec round 1: the omega dip on the graph read as noise).
2. **Card:** the 2×3 grid (rows human / technical, columns specify / execute / review), one line per cell. With AI on, the execute column hands over to AI and the review column swells and turns to warning. Below it the node's two dials and a live readout ("14 waiting for review", "6 dropped a week"), and the node's own omega, enlarged, animated from the same numbers as the graph.
3. **Edges are handoffs.** Hover shows the artefact flowing through (brief, spec, pull request, release notes). Two labelled zones: product lifecycle (left) and software lifecycle (right), joined at the spec.
4. **Leaking.** A pipe past its buffer leaks drops that fall out and fade, so the animation keeps running at a steady state instead of piling up forever.
5. **Flow, two Options for the Spec** (Spec round 1 replaced pixel water, whose dots did not read as pleasing):
   - **Documents:** small documents (brief, spec, pull request) pass from one node to the next inside the pipe. Clear ones are crisp; sludge ones are smudged. At a valve they stack up; past the buffer they fall out and fade.
   - **Liquid stream:** a continuous ink-like stream, fitting the site's ink motion; sediment coats the walls; pile-up shows as pooling and a bulging pipe.
   - No magnifier lens in v1.
   - Clicking a pipe segment or valve opens a panel listing what is stuck ("12 PRs waiting for review").

## Open

- Per-card animation beyond the enlarged omega, and how it stays configurable in YAML.
- How each of the eight roles is affected: research questions 3 and 4 of the Brief feed the card cells.
- Upload of a visitor's own team as a use case (Actionable 1); the format stays upload-ready.
- Later: a Conway's law use case (module teams, several nodes per role); this Explorable replacing the landing hero.
