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

This guide holds the product design, from Han's voice session of 2026-11-10 and the prototype rounds and grills of 2026-11-11. Feedback 10 (2026-11-12, `docs/episodes/software-ecology/prototype/feedback-10.md` and its grill `grill-10.md`, questions 166 to 177) added gift-box releases, own-work lightbulbs and the Own work dashboard section. Feedback 11 (2026-11-12, `docs/episodes/software-ecology/prototype/feedback-11.md`) removed the toolbar still from the Why · How · What Slide, centred and yellowed the lightbulb, made the release grid 4 rows by 5 columns, opened the damage-sign tooltips on top and added the eval hooks.

## Premises

- The ten-panel tire swing cartoon (https://www.productftw.com/productftw-2-the-tire-swing-cartoon/) is treated as public domain and used as is, from local assets. Check the licence before publishing; it stays on the PR checklist.
- The model is illustrative. Its numbers are tuned to tell the story, not measured, and the page says so.

## Concept

1. **The organization is a factory.** The Customer's requests come in, conveyor belts carry documents between work centers, work waits in each center's backlog, inspection is the review, and releases go back to the Customer.
2. **Ideal first, then reality.** The opening state is the ideal factory: only good documents move, every work center has slack, and nothing piles up. Then the bridge, "reality is messier": in Realistic, efficiency and effectiveness drop, work arrives at random, and the factory is busy but coping, starting loaded with backlogs that drain, bad work and rework.
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

1. **Tire swing.** One Customer and seven work centers, each titled by its department in every view: Sales, Product management, Analysis (artefacts: Spec, ADR, Design, Data model), Support, Engineering, Quality assurance, Operations (layout: `.scratch/software-ecology/prototype/layout-han-06.png`). The Customer's requests go to Sales, Product management and Support; work runs through Analysis to Engineering, then quality assurance and operations, which releases back to the Customer. Support answers directly or hands a bug to Engineering. Quality assurance is the inspection. Documentation and billing are cartoon panels, not work centers. It is the only use case with cartoon panels, shown in the roles view. It runs as a Product company by default: Product management, Sales and Engineering also create work of their own (roadmap, leads, tech debt). A Model toggle switches to Service provider, where only the Customer creates work; Gatekeeper lead and Two teams default to that.
2. **Gatekeeper lead.** One lead both writes the specs and reviews three engineers' work, so every pull request drains back through one person. The peer engineers have equal values: no bad actors.
3. **Two teams, one platform.** Product feeds team A, which has Analysis, and team B, which has none. Both teams drain through one shared Platform work center (de: Plattform).
4. **Later:**
   - Tender to acceptance (construction): AI lets the firm bid on far more tenders; misread bill-of-quantities positions come back months later as change orders (Nachtrag) and defect notices.
   - Startup: three people holding eight roles.
   - Insurance claims: four-eyes approval as the inspection.
   - Regulated QA release: a signature that cannot be sped up.
   - Marketing team.
   - IT ticket flow: a stale knowledge base feeding a chatbot.
   - Conway's law.

## Interaction

1. **Toolbar, one row at laptop width** (feedback 08, overruling Spec Option 1a's three rows): the state stepper "① Who does what · ② In theory · ③ In practice" (de: "Wer macht was · In der Theorie · In der Praxis"), a Scenarios menu, a Tour button, the "Fix the orders first" Context marker as an icon with its tooltip, a Compare icon button, Pause, a speed menu (1×, 2×, 5×, 10×, 20×; 1× is 1/32 week a second and the page starts there), Clear, the clock ("Week n · Day d", fitted to its text, tabular digits), the use case picker (icon and name) and one Settings button. Every icon button has a label and a tooltip. Below laptop width the row wraps; it is sticky from 768 px. Who does what, on Tire swing, shows the cartoon's ten cards in two rows of five, in cartoon order (Customer, Product management, Analysis, Engineering, Sales / Documentation, Operations, Billing, Support, What the customer needed), each with department, job, cartoon panel and quote (Context marker at the end of the quote line) and artefacts, all one height and not clickable; quality assurance appears only in the factory. Other use cases keep their cards at factory positions. Roles and factory cross-fade in about 200 ms (instantly under reduced motion). Turning a dial after picking a state marks the active state with a dot.
2. **Scenarios** (eval grill, `grill-11.md`): every use case ships Who does what, In theory and In practice; any other state is a scenario written from Han's claims and tuned by the eval agent (Headless eval below). The scenarios before the eval grill (Speed up one team, AI unbalanced, AI compare, AI everywhere, AI balanced, Bug spiral, Fix the orders first, Move the bottleneck) are deleted; git keeps them. Each scenario has a one-line "what to watch" caption and a guided tour of beats, each setting dials, running 6 to 9 weeks at 20× and pausing with a caption at a card; every beat states what the model must show, and the same judge checks it headless.

3. **One Settings popover** (Clear empties the factory to day 0): about 760 px wide and kept inside the window, in two columns that stack below 800 px: **Model** beside **Mechanics** (the Rework, Churn and Complaints switches and the damage strengths), then **Display** (belt motion, pile-up style). The header has a bold title and a close button; the footer has **Reset to default** on the left and Download YAML and Upload on the right. Reset returns to what the use-case file defines for the active state, and every setting is definable there. Every control is one form field: label and (?) help on one line, the control full width beneath (segmented control for choices; a slider with its value on the label line; a switch on the label line, with its strength slider beneath, disabled while off). Dropping a YAML file on the factory also uploads. Each setting has a tooltip saying what it does to the factory. The theme follows the site header's switch. The toolbar carries no description or "what to watch" text: the Scenarios menu and the tour box do. The Customer card opens a small dashboard with its request rate, Steady or Random arrivals, the request mix and the chance that a good or a bad release triggers a new request.
4. **Work-center dashboard:** a click on a work center opens its dashboard as a popover anchored to it. It holds:
   - a traffic light and its signals, and trend charts of output, outcome and queue
   - an AI toggle; a collapsed Settings section of sliders, each showing its set and effective value: efficiency (10 % to 1000 %), effectiveness, tasks handed on per task, and, while AI is on, AI's speed-up and extra tasks
   - an "Own work" section for a work center the file gives a source, shown under Product company only: tickets a week (0 allowed) and Steady or Random, starting at the file's values; changing it marks the state modified, Reset to default restores it, Service provider turns all own work off and Product company restores what was set; Download and Upload keep it under `state.sources`; an "Emit task" button in the section adds one own ticket to that work center's backlog now, with the same lightbulb and drop as a scheduled one, also while paused, without marking the state modified or being saved
   - a collapsed "How it flows" section with utilisation, throughput, backlog and lead time in plain words
   - the role's classic artefacts and execution tasks
   - what AI does there, to inspire the audience about their own department (e.g. sales turns leads into deals and requirements for Product management and Analysis)
     A help button at the top right turns help text on for every card; otherwise the controls carry tooltips.
5. **Compare downstream:** turn compare mode on (or shift-click) and pick up to three work centers, then press Compare. The factory flattens into a three-column stream: each column shows its station above its dashboard, a gap marks skipped stations, and an overview strip and Exit sit on top. A preset can open this stream directly.
6. **What ships:** the Customer card shows a grid of the last twenty releases, 4 rows by 5 columns, good or bad with complaints marked, the customer satisfaction rate under it and output relative to ideal beside it, the headroom ("could serve 2.4× the demand"), the lead time in days, bugs reported a week, and, as a Product company, own roadmap shipped apart from customer requests.

## Visuals

1. **At rest, only the essentials:** belts, work centers (glyph and title) and moving documents. Queue trays, counts and damage signs appear under pressure or on hover, with a gap between the show and hide thresholds so nothing flickers.
2. **Documents** (90 % of the belt's width tall while they travel, feedback 10) are good or bad: a plain document is good, a red minus marks bad, a red warning marks a complaint or rework, and AI-made documents have an orange border, a light orange fill and a star. A station card has a full-width glyph and title row and no Context marker (it lives on the station's dashboard). Beneath, a rack of six slots on the left holds the waiting work, the document in work is centred in the rest and fills and is stamped good or bad, and "n waiting" sits at the bottom right. The Customer card is 30 % wider in the factory; documents slide in and shrink out, never popping. A release to the Customer is a gift box (1.5 times a document, a red bug when bad, AI marks kept) and its handoff takes 1.2 s on screen; answers stay documents. Own work wears a lightbulb mark, centred in its document in the `--bulb` yellow with a darker `--bulb-edge` outline (bright in light and dark), and each own ticket pops out of its station's glyph and drops into its rack slot in 0.4 s without a belt (at once under reduced motion). When a belt is full, documents with the same marks merge into one with a "×n" badge.
3. **AI drawing:** a turbo on the belt, and a faster `ai`-tinted progress ring with a soft pulse inside the station.
4. **Damage signs:**
   - rework: a document rides a separate return belt back
   - churn: a bad input leaves the next station as several documents
   - extra work: a longer progress ring at the next station
   - customer complaints: a warning document from the customer into support
   - passing unread: an inspection under pressure lets bad documents through; its dashboard says so
5. **Pile-up:** past six waiting, the rack's top slot turns red with "+n" beside it and the surplus piles up at the end of the incoming belt, growing with the backlog and drawn differently per station; the dashboard reads weeks of work waiting, amber from one and red from two. Every handoff takes the same quarter day, so belts never act as queues; on screen it takes 0.6 s at any speed. Every station keeps a minimum gap of belt before and after it.
6. **Stage:** the factory fills the viewport below a sticky toolbar, in rows, with cards large enough to read.

## Eval hooks

Every interactive control carries a unique, stable `data-control`, so an eval agent can drive a teaching use case and check the result. Tests beside the components (`software-ecology.test.ts` for the toolbar, Settings popover and cards; `work-center-dashboard.client.test.ts`, `customer-dashboard.client.test.ts`, `tour-box.client.test.ts`) walk the rendered markup and fail on a control without one or a value used twice on a page. The names are built where each control is drawn (`settings-field.client.tsx` for the Settings fields, `toolbar-menu.client.tsx` for the menu buttons).

- **Toolbar:** `toolbar.state.<id>` (`ideal`, `realistic`, `roles`), `toolbar.scenarios`, `toolbar.scenario.<id>`, `toolbar.tour`, `toolbar.compare`, `toolbar.pause`, `toolbar.speed`, `toolbar.speed.<n>`, `toolbar.clear`, `toolbar.use-case`, `toolbar.use-case.<id>`, `toolbar.settings`.
- **Settings popover:** `settings.realism`, `settings.ai.<value>` (`off`, `all`, or a preset's AI set as its work center ids sorted and joined with a dash, such as `eng` or `eng-qa`), `settings.company.<value>`, `settings.ai-quality.<value>`, `settings.rework`, `settings.rework.strength`, `settings.churn`, `settings.churn.strength`, `settings.complaints`, `settings.belt-motion`, `settings.pile.<value>`, `settings.reset`, `settings.download`, `settings.upload`, `settings.upload.file` (the hidden file input), `settings.close`. A field's help icon is `<field>.help` (`settings.realism.help`, `settings.ai.help`, …), and a section's is `settings.model.help` or `settings.mechanics.help`.
- **Node:** the card is `node.<id>` (`node.customer` for the Customer), a red sign `node.<id>.sign.<kind>`; its dashboard in the popover has `node.<id>.ai`, `.efficiency`, `.effectiveness`, `.fanout`, `.ai-speed`, `.ai-extra`, `.settings`, `.flows`, `.help`, `.close`, and the own-work section `.own.rate`, `.own.arrivals.<value>`, `.own.help`, `.emit`. In a compare column the same dashboard is `compare.<id>.<field>`, so a popover and a column of one center never share a hook.
- **Customer dashboard:** `customer.rate`, `customer.arrivals.<value>`, `customer.mix.<id>`, `customer.good.<id>`, `customer.bad.<id>`, `customer.close`.
- **Compare:** `toolbar.compare` toggles it; `compare.slot.<id>`, `compare.show`, `compare.exit`, `compare.exit-stream`. **Tour box:** `tour.close`, `tour.back`, `tour.next`.
- **Read-outs** (plain values on the element, written only when they change, design-ADR 0024 §14): the Customer card (`node.customer`) `data-readout-output` (times ideal), `-satisfied` (0 to 1), `-headroom` (times today's demand the line could serve, one decimal), `-bugs-week` (one decimal), `-lead-days`; each station card `data-readout-waiting` (the backlog), `-weeks-waiting` and `-rework` (share of arrivals sent back, 0 to 1, two decimals); card flags `data-piling` and `data-ai` on a station card and `data-on` on a sign; the clock `data-readout-week` (a tour only) and `-day`.

## Mechanics in the file

A use-case file's `mechanics` holds the two strengths the Settings popover slides (`rework`, 0 to 1, and `churn`, 1 to 4) and the model's constants, which no control shows (design-ADR 0024 §5): `inspect` (an inspection's catch over a plain station's, 1 to 5, default 2.4), `redo` (a sent-back job's size, 0.1 to 1, default 0.3), `keepExtra` (the extra work of a kept bad input, 0 to 2, default 0.3), `maxBounces` (how often one document may be sent back, 0 to 2, default 2) and `pressure` (how hard a filling backlog makes an inspection pass bad work unread, 0 to 3, default 1.4). Download writes them all, so a scenario is tuned as data.

Defects carry a kind (design-ADR 0024 §5, §6): a bad document keeps the kind of its first defect, `spec` from a role whose catalog `origin` is spec (up to Analysis) or `code` (from Engineering on); a work center may set its own `origin`. A work center's `catch: { spec, code }` is its chance to send a bad input of that kind back, over `mechanics.rework`; a kind it leaves out passes. A role's `aiCatch` (0 to 1) multiplies its station's catch while AI works there. `customer.bad` is one map for both kinds or `{ spec: {…}, code: {…} }`: a spec defect comes back as a change request, a code defect as a bug; the Customer dashboard shows a row per kind. A work center's `stall: { at, slow }` loses the share `slow` of its speed once `at` weeks of work wait, unless AI works there. A work center's `escalate: { to, underPressure }` is its pass-on under pressure, and it starts only once the station is drowning, at 2 weeks of work waiting, where its pile turns red: below that it answers every ticket it takes up. Past that mark, the share of the tickets it takes up that it passes on to `to` (a work center its spawns already hand work to) unanswered rises by the same term as an inspection's `stampUnderPressure`: `mechanics.pressure` × `underPressure` × how far its weeks of work waiting are past the red mark, as a share of that mark (full at 4 weeks), capped at 1, so up to all of them, bugs and change requests alike. A ticket passed on costs it a sent-back job's size (`redo`). The readings `customer.changesPerWeek`, `customer.bugsPerWeek` (code defects only), `<center>.unread` (bad work passed unflagged over bad work arriving, counting only the defect kinds the station's `catch` can catch) and `<center>.stall` (speed lost now) serve the scenarios' checks. Tire swing: Engineering catches spec defects and quality assurance only code; quality assurance's AI review keeps only a small share of its catch, Operations stalls once its work piles up, and a drowning Support passes tickets on to Engineering, which closes the Bug spiral at Engineering. The tuned values live in `src/explorables/software-ecology/tire.yml` (`roles:`, the centers' `catch`, `stall` and `escalate`), and each eval run's report says which it changed.

## Headless eval

`npm run ecology:sim -- <use-case> <scenario> [--seed n | --seeds n] [--json]` judges a scenario's beats on the model alone, with no rendering (design-ADR 0024 §12). It plays the scenario on ten seeds in a row from the shipped one unless told otherwise, and reads each measure a beat names as the mean over its last 2 weeks. `rises` and `falls` compare that mean with the same seed's beat before, and `settles:` is read 40 weeks after its beat. It prints each beat's claim, its per-seed readings, their mean and its verdict. A beat passes on 8 of 10 seeds, and a beat with a claim also runs 6 to 9 weeks. The command exits 1 when a beat fails. The judge is `judgeScenario` in `factory-scenario.pure.ts`, the shell is `tools/ecology/sim.ts`. The page's tour plays one seed and judges the same 2-week means: it reads on the judge's sample steps and averages them with the judge's function (`beat-means.pure.ts`), so on the shipped seed the tour box shows the numbers `--seeds 1` prints. The `ecology-eval` skill (`skills/ecology-eval/`) runs the loop: it tunes the use-case YAML's numbers until each beat holds, plays the tour in the browser, and reports in `.scratch/software-ecology/eval/run-NN.md`; ranges and model changes stay Han's call.

Tire swing's eval scenarios, each beat naming Han's claim (`scenarios.<id>.claims` in its words, shown as the beat's caption): **Bug Spiral with AI Acceleration** (`ai-spiral`, from In theory: AI at Engineering, then quality assurance, then Operations) and **Clear Requirements, Then AI** (`clear-requirements`, from In practice with Analysis and the Product manager at 75 %: AI at Engineering and quality assurance, then both at 95 %, then AI everywhere). Their ranges are proposals awaiting Han's approval. The fast suite judges only checks and claim-free tours on one seed; a tour with claims is judged across ten seeds by the same judge in `npm run test:build` (`tests/post-build/ecology-scenarios.build.test.ts`).

A third state, `still` (In practice, then AI at Engineering writing two pull requests a task, run to week 20), carries `menu: false`, so it stays off the Scenarios menu: the hero preview and the Why · How · What stills read it by id (`scenario-last-step.ts`), and its check (the Customer below 0.5 satisfied, quality assurance's backlog past 200) keeps their point as the model is tuned.

## Open

- The ten cartoon panels redrawn as coloured SVG, as close to the original as possible, in a pass of their own (Spec Options against the line drawings); the licence check on the PR checklist covers the redraw.
- Each role's catalog entry: research questions 3 and 4 of the Brief feed its tasks and AI examples.
- The Dossier's Voice scripts and Speaker note targets move to the factory vocabulary.
- Later: this Explorable replacing the landing hero.
