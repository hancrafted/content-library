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
4. **AI raises output, not quality.** At a work center, AI makes it faster and can multiply the tasks it hands on (one spec, five pages of documentation; with AI, fifty). AI everywhere frees capacity: output stays at the Customer's demand while lead time falls. AI at one role alone floods the next one, and with mediocre effectiveness it produces more bad work, faster, and the next work center pays.
5. **Pressure travels along the belts.** Speeding up one work center rarely speeds up what reaches the Customer: the work piles up at the next inspection. Under the hood the factory is a queueing network: a work center whose arrivals exceed its capacity grows a backlog without end, and relieving it moves the bottleneck downstream.

## Messages

These are ranked. Evidence status comes from the business review, `.scratch/software-ecology/prototype/business-review.md`.

1. Speeding up one team doesn't speed up the company: the work piles up at the next review (AIE-0018).
2. AI is an amplifier: bad input gets faster too (AIE-0018, AIE-0020).
3. Unclear requirements are paid for later, by someone else, as rework (SWE-0002).
4. Fix the orders before you add a robot. This is a hypothesis: the model makes it true by construction.

## Use cases

Each use case is one use-case file plus its words pair. Every use case outside software is captioned as a hypothesis, since all the research covers software or language models.

1. **Tire swing.** One Customer and seven work centers, each titled by its department in every view: Sales, Product management, Analysis (artefacts: Spec, ADR, Design, Data model), Support, Engineering, Quality assurance, Operations (layout: `.scratch/software-ecology/prototype/layout-han-06.png`). The Customer's requests go to sales, the product manager and support; work runs through the analyst to the engineer, then quality assurance and operations, which releases back to the Customer. Support answers directly or hands a bug to the engineer. Quality assurance is the inspection. Documentation and billing are cartoon panels, not work centers. It is the only use case with cartoon panels; its roles state is labelled "Tire swing 2.0". It runs as a Product company by default: the product manager, sales and engineering also create work of their own (roadmap, leads, tech debt). A Model toggle switches to Service provider, where only the Customer creates work; Gatekeeper lead and Two teams default to that.
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

1. **Toolbar, one row at laptop width** (feedback 08, overruling Spec Option 1a's three rows): the state buttons (the roles state, labelled "Tire swing 2.0" on Tire swing and "Roles" elsewhere; Ideal; Realistic), a Scenarios menu, a Tour button, the "Fix the orders first" Context marker as an icon with its tooltip, a Compare icon button, Pause, a speed menu (1×, 2×, 5×, 10×; the page starts at 1×), Clear, the clock ("Week n · Day d"), the use case picker (icon and name) and one Settings button. Every icon button has a label and a tooltip. Below laptop width the row wraps; it is sticky from 768 px. The roles state keeps every card at its factory position (department, job, cartoon panel with its quote under it, artefacts; the cartoon tiles fill the empty cells), so switching to the factory only fades belts and panels in. Turning a dial after picking a state marks the active state with a dot.
2. **Scenarios** (Tire swing; each with a one-line "what to watch" caption and a guided tour of three to five steps that set the dials, run to a week, pause and point at a card):
   1. Speed up one team: engineering at 200 %; quality assurance piles up and output stays flat.
   2. AI unbalanced: AI at engineering only; more documents, fewer requests fulfilled.
   3. AI compare: the same, opened in the compare stream.
   4. AI everywhere: output stays at 1.0×, lead time falls, headroom grows.
   5. AI balanced: demand 2.5×, capacities matched, about 95 % satisfied.
   6. Bug spiral: from day 0 at 10×, engineering at 70 % effectiveness; bad releases, complaints through support and bugs back to engineering slow everything down over time.
   7. Fix the orders first: analyst effectiveness 98 %; rework falls and output rises.
   8. Move the bottleneck: relieve the bottleneck and watch it move downstream.

   Gatekeeper lead and Two teams have Ideal, Realistic, Speed up one team and AI unbalanced, without tours. Every tour step states what the model must show, and a check runs it on the model alone.

3. **One Settings popover** (Clear empties the factory to day 0): up to 720 px wide and kept inside the window, in three columns that stack on narrow screens: **Model** (Ideal … Realistic, where AI works, Company, AI quality, Back to the state), **Mechanics** (the Rework, Churn and Complaints switches and the damage strengths) and **Display** (belt motion, pile-up style), with **File** (Download YAML, Upload) at its foot. Dropping a YAML file on the factory also uploads. Each setting has a tooltip saying what it does to the factory. The theme follows the site header's switch. The toolbar carries no description or "what to watch" text: the Scenarios menu and the tour box do. The Customer card opens a small dashboard with its request rate, Steady or Random arrivals, the request mix and the chance that a good or a bad release triggers a new request.
4. **Work-center dashboard:** a click on a work center opens its dashboard as a popover anchored to it. It holds:
   - a traffic light and its signals, and trend charts of output, outcome and queue
   - an AI toggle; a collapsed Settings section of sliders, each showing its set and effective value: efficiency (10 % to 1000 %), effectiveness, tasks handed on per task, and, while AI is on, AI's speed-up and extra tasks
   - a collapsed "How it flows" section with utilisation, throughput, backlog and lead time in plain words
   - the role's classic artefacts and execution tasks
   - what AI does there, to inspire the audience about their own department (e.g. sales turns leads into deals and requirements for the product manager and analyst)
     A help button at the top right turns help text on for every card; otherwise the controls carry tooltips.
5. **Compare downstream:** turn compare mode on (or shift-click) and pick up to three work centers, then press Compare. The factory flattens into a three-column stream: each column shows its station above its dashboard, a gap marks skipped stations, and an overview strip and Exit sit on top. A preset can open this stream directly.
6. **What ships:** the Customer card shows a 3×4 grid of the last twelve releases, good or bad with complaints marked, the customer satisfaction rate under it and output relative to ideal beside it, the headroom ("could serve 2.4× the demand"), the lead time in days, bugs reported a week, and, as a Product company, own roadmap shipped apart from customer requests.

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
5. **Pile-up:** past six waiting, the rack's top slot turns red with "+n" beside it and the surplus piles up at the end of the incoming belt, growing with the backlog and drawn differently per station; the dashboard reads weeks of work waiting, amber from one and red from two. Every handoff takes the same quarter day, so belts never act as queues; on screen it takes 0.6 s at any speed. Every station keeps a minimum gap of belt before and after it.
6. **Stage:** the factory fills the viewport below a sticky toolbar, in rows, with cards large enough to read.

## Open

- The ten cartoon panels redrawn as coloured SVG, as close to the original as possible, in a pass of their own (Spec Options against the line drawings); the licence check on the PR checklist covers the redraw.
- Each role's catalog entry: research questions 3 and 4 of the Brief feed its tasks and AI examples.
- The Dossier's Voice scripts and Speaker note targets move to the factory vocabulary.
- Later: this Explorable replacing the landing hero.
