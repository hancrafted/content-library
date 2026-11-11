---
type: feature-guide
title: Software ecology Explorable
stale_after: 2027-05-10T00:00:00Z
---

# Software ecology Explorable

Read this before designing, building or adding a use case to the software ecology Explorable (`src/explorables/software-ecology/`, page `/explorables/software-ecology/`). It is not built yet: the `software-ecology` Episode Run designs it in its Spec and builds it in its Build stage. A throwaway prototype, `.scratch/software-ecology/prototype/flow.html`, is where the Options are tried before they reach the Spec.

Binding:

- the design-ADR [Software ecology flow model and use-case files](../../adr/0024-software-ecology-flow-model-and-use-case-files.md), for the model, files and rendering
- [FE-012-explorables](../../../.archgate/adrs/FE-012-explorables.md)
- the Explorable floor in [README.md](README.md)

This guide holds the product design, from Han's voice session of 2026-11-10 and the prototype rounds and factory grill of 2026-11-11.

## Premises

- The ten-panel tire swing cartoon (https://www.productftw.com/productftw-2-the-tire-swing-cartoon/) is treated as public domain and used as is, from local assets. Check the licence before publishing; it stays on the PR checklist.
- The model is illustrative. Its numbers are tuned to tell the story, not measured, and the page says so.

## Concept

1. **The organization is a factory.** Orders come in, conveyor belts carry documents between work centers, work waits in inbound queues, inspection is the review, and results leave from the shipping dock.
2. **Balance first, then reality.** The opening state is an ideal factory in balance: only good documents move, evenly, and nothing piles up. Then the bridge, "reality is messier": efficiency and effectiveness drop, and queues, bad work and rework appear.
3. **Efficiency is output; effectiveness is outcome.** A faster work center pushes more work into the next one, which can become the bottleneck. A less effective one hands on more bad documents, and bad work does damage downstream through rework, extra work, escapes and rubber-stamping.
4. **AI raises output, not quality.** At a work center, AI makes it faster and multiplies what it fans out (one spec, five pages of documentation; with AI, fifty). With mediocre effectiveness it produces more bad work, faster, and the next work center pays.
5. **Pressure travels along the belts.** Speeding up one work center rarely speeds up the shipping dock: the work piles up at the next inspection.

## Messages

These are ranked. Evidence status comes from the business review, `.scratch/software-ecology/prototype/business-review.md`.

1. Speeding up one team doesn't speed up the company: the work piles up at the next review (AIE-0018).
2. AI is an amplifier: bad input gets faster too (AIE-0018, AIE-0020).
3. Unclear requirements are paid for later, by someone else, as rework (SWE-0002).
4. Fix the orders before you add a robot. This is a hypothesis: the model makes it true by construction.

## Use cases

Each use case is one use-case file plus its words pair. Every use case outside software is captioned as a hypothesis, since all the research covers software or language models.

1. **Tire swing.** Eight roles: sales, product manager, business analyst / architect, engineer, documentation, operations, billing, support. Merges at documentation, billing and support. Return lanes carry clarification, open questions, scope checks, rollbacks, bug reports from support to the product manager, and invoice disputes. Code review and spec review are the inspections. It is the only use case with cartoon panels and the Swing view.
2. **Gatekeeper lead.** One lead both writes the specs and reviews three engineers' work, so every pull request drains back through one person. The peer engineers have equal values: no bad actors.
3. **Two teams, one platform.** Product feeds team A, which has an analyst, and team B, which has none. Both teams drain through one shared platform & QA work center.
4. **Tender to acceptance (construction).** AI lets the firm bid on far more tenders. Misread bill-of-quantities positions come back months later as change orders (Nachtrag) and defect notices.
5. **Later:**
   - Startup: three people holding eight roles.
   - Insurance claims: four-eyes approval as the inspection.
   - Regulated QA release: a signature that cannot be sped up.
   - Marketing team.
   - IT ticket flow: a stale knowledge base feeding a chatbot.
   - Conway's law.

## Interaction

1. **State row in the toolbar:** the use case's presets in order, e.g. Swing, Roles, Balance, Reality, AI at engineering, AI everywhere. Swing and Roles show the work-center cards as a row with no belts; the other states place each card on the line as a station. Turning a dial after picking a state marks the state "modified".
2. **Use case picker, damage toggles, compare widget, speed (pause, 1×, 4×) and Download YAML** stay visible in the toolbar, each with a tooltip. Upload works by dropping a YAML file. Everything else sits in a "Model" popover: demand, damage strengths, AI quality effect, isolate roles, and follow a request.
3. **Work-center dashboard:** a click on a work center opens its dashboard as a popover anchored to it. It holds:
   - status and the efficiency, effectiveness, fan-out and AI dials
   - the role's classic artefacts and execution tasks
   - what AI does there, to inspire the audience about their own department (e.g. sales turns leads into deals and requirements for the product manager and analyst)
     A help button at the top right turns help text on for every card; otherwise the controls carry tooltips.
4. **Compare downstream:** turn compare mode on (or shift-click) and pick up to three work centers, then press Compare. The factory flattens into a three-column stream: each column shows its station above its dashboard, a gap marks skipped stations, and an overview strip and Exit sit on top. A preset can open this stream directly.
5. **What ships:** the dock shows the rate in bands relative to balance, and what comes out: the tire swing when most of the work is good, otherwise the weakest role's wrong swing.

## Visuals

1. **At rest, only the essentials:** belts, work centers (glyph and title) and moving documents. Queue trays, counts and damage signs appear under pressure or on hover, with a gap between the show and hide thresholds so nothing flickers.
2. **Documents** show quality by their lines (a full page, missing text, a crumpled page) and by a pale tint: green for good, none for average, red for bad. AI-made documents carry a mark of their own; the Spec picks one of the prototype's Options.
3. **AI drawing:** the Spec picks the pump on the belt (spins faster with more AI), a robot arm on the work center or a belt turbo.
4. **Damage signs:**
   - rework: a document rides the return lane back
   - extra work: a longer progress ring at the next station
   - escape: a parcel coming back from the dock into support
   - rubber-stamp: an "OK" stamp on a bad document at a full inspection
5. **Pile-up and return lane:** the Spec picks from the prototype's Options; the recommended ones are a queue tray that fills and backs work up the belt, and a two-lane belt.

## Open

- Which AI drawing, AI mark, pile-up and return lane ship (Spec Options).
- Each role's catalog entry: research questions 3 and 4 of the Brief feed its tasks and AI examples.
- The Dossier's Voice scripts and Speaker note targets move to the factory vocabulary.
- Later: this Explorable replacing the landing hero.
