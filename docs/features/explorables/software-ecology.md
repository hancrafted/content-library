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

This guide holds the product design, from Han's voice session of 2026-11-10 and the prototype rounds and grills of 2026-11-11.

## Premises

- The ten-panel tire swing cartoon (https://www.productftw.com/productftw-2-the-tire-swing-cartoon/) is treated as public domain and used as is, from local assets. Check the licence before publishing; it stays on the PR checklist.
- The model is illustrative. Its numbers are tuned to tell the story, not measured, and the page says so.

## Concept

1. **The organization is a factory.** The Customer's requests come in, conveyor belts carry documents between work centers, work waits in each center's backlog, inspection is the review, and releases go back to the Customer.
2. **Ideal first, then reality.** The opening state is the ideal factory: only good documents move, every work center has slack, and nothing piles up. Then the bridge, "reality is messier": in Realistic, efficiency and effectiveness drop, work arrives at random, and the factory is busy but coping, with short backlogs, bad work and rework.
3. **Efficiency is output; effectiveness is outcome.** A faster work center pushes more work into the next one, which can become the bottleneck. A less effective one hands on more bad documents, and bad work does damage downstream through rework, churn, extra work, customer complaints and inspections that pass it unread.
4. **AI raises output, not quality.** At a work center, AI makes it faster and multiplies what it fans out (one spec, five pages of documentation; with AI, fifty). With mediocre effectiveness it produces more bad work, faster, and the next work center pays.
5. **Pressure travels along the belts.** Speeding up one work center rarely speeds up what reaches the Customer: the work piles up at the next inspection. Under the hood the factory is a queueing network: a work center whose arrivals exceed its capacity grows a backlog without end, and relieving it moves the bottleneck downstream.

## Messages

These are ranked. Evidence status comes from the business review, `.scratch/software-ecology/prototype/business-review.md`.

1. Speeding up one team doesn't speed up the company: the work piles up at the next review (AIE-0018).
2. AI is an amplifier: bad input gets faster too (AIE-0018, AIE-0020).
3. Unclear requirements are paid for later, by someone else, as rework (SWE-0002).
4. Fix the orders before you add a robot. This is a hypothesis: the model makes it true by construction.

## Use cases

Each use case is one use-case file plus its words pair. Every use case outside software is captioned as a hypothesis, since all the research covers software or language models.

1. **Tire swing.** One Customer and seven roles: sales, product manager, analyst / architect, support, engineer, quality assurance, operations (layout: `.scratch/software-ecology/prototype/layout-han-06.png`). The Customer's requests go to sales, the product manager and support; work runs through the analyst to the engineer, then quality assurance and operations, which releases back to the Customer. Support answers directly or hands a bug to the engineer. Quality assurance is the inspection. Documentation and billing are cartoon panels, not work centers. It is the only use case with cartoon panels and the Swing view.
2. **Gatekeeper lead.** One lead both writes the specs and reviews three engineers' work, so every pull request drains back through one person. The peer engineers have equal values: no bad actors.
3. **Two teams, one platform.** Product feeds team A, which has an analyst, and team B, which has none. Both teams drain through one shared platform & QA work center.
4. **Later:**
   - Tender to acceptance (construction): AI lets the firm bid on far more tenders; misread bill-of-quantities positions come back months later as change orders (Nachtrag) and defect notices.
   - Startup: three people holding eight roles.
   - Insurance claims: four-eyes approval as the inspection.
   - Regulated QA release: a signature that cannot be sped up.
   - Marketing team.
   - IT ticket flow: a stale knowledge base feeding a chatbot.
   - Conway's law.

## Interaction

1. **State row in the toolbar:** the use case's presets in order: Swing and Roles (the ten cartoon panels in two rows of five), Ideal, Realistic, AI unbalanced (AI only where one role adopts it, e.g. engineering: no more output, a new bottleneck), AI compare, AI balanced (AI where needed and capacities matched: 2–3× output, about 95 % satisfied). Swing and Roles show the cards five per row with no belts, each with its tire-swing panel and its artefacts; the other states place each card on the line as a station. Turning a dial after picking a state marks the state "modified".
2. **Use case picker, compare widget, Pause, Clear (an empty factory from day 0), speed (1×, 2×, 5× by default, 10×), the clock ("Day n") and Download YAML** stay visible in the toolbar, each with a tooltip; a ⋮ menu holds belt motion and theme. Upload works by dropping a YAML file. Everything else sits in a "Model" popover (Ideal … Realistic, AI, damage strengths, AI quality effect), each setting with a tooltip saying what it does to the factory. The Customer card opens a small dashboard with its request rate, Steady or Random arrivals, the request mix and the chance that a good or a bad release triggers a new request.
3. **Work-center dashboard:** a click on a work center opens its dashboard as a popover anchored to it. It holds:
   - a traffic light and its signals, and trend charts of output, outcome and queue
   - an AI toggle; the efficiency (10 % to 1000 %), effectiveness and fan-out dials sit in a collapsed Settings section
   - a collapsed "How it flows" section with utilisation, throughput, backlog and lead time in plain words
   - the role's classic artefacts and execution tasks
   - what AI does there, to inspire the audience about their own department (e.g. sales turns leads into deals and requirements for the product manager and analyst)
     A help button at the top right turns help text on for every card; otherwise the controls carry tooltips.
4. **Compare downstream:** turn compare mode on (or shift-click) and pick up to three work centers, then press Compare. The factory flattens into a three-column stream: each column shows its station above its dashboard, a gap marks skipped stations, and an overview strip and Exit sit on top. A preset can open this stream directly.
5. **What ships:** the Customer card shows a 3×4 grid of the last twelve releases, good or bad with complaints marked, the customer satisfaction rate under it and output relative to ideal beside it, and the tire swing or the weakest role's wrong swing.

## Visuals

1. **At rest, only the essentials:** belts, work centers (glyph and title) and moving documents. Queue trays, counts and damage signs appear under pressure or on hover, with a gap between the show and hide thresholds so nothing flickers.
2. **Documents** are good or bad: a plain document is good, a red minus marks bad, a red warning marks a complaint or rework, and AI-made documents have an orange border, a light orange fill and a star. Inside a station a rack of six slots holds the waiting work and the document in work fills and is stamped good or bad; documents slide in and shrink out, never popping. When a belt is full, documents with the same marks merge into one with a "×n" badge.
3. **AI drawing:** a turbo on the belt, and a faster `ai`-tinted progress ring with a soft pulse inside the station.
4. **Damage signs:**
   - rework: a document rides a separate return belt back
   - churn: a bad input leaves the next station as several documents
   - extra work: a longer progress ring at the next station
   - customer complaints: a warning document from the customer into support
   - passing unread: an inspection under pressure lets bad documents through; its dashboard says so
5. **Pile-up:** past six waiting, the rack's top slot turns red with "+n" beside it; the dashboard reads weeks of work waiting, amber from one and red from two. Every handoff takes the same quarter day, so belts never act as queues. Every station keeps a minimum gap of belt before and after it.
6. **Stage:** the factory fills the viewport below a sticky toolbar, in rows, with cards large enough to read.

## Open

- The ten cartoon panels redrawn as coloured SVG, as close to the original as possible, in a pass of their own (Spec Options against the line drawings); the licence check on the PR checklist covers the redraw.
- Each role's catalog entry: research questions 3 and 4 of the Brief feed its tasks and AI examples.
- The Dossier's Voice scripts and Speaker note targets move to the factory vocabulary.
- Later: this Explorable replacing the landing hero.
