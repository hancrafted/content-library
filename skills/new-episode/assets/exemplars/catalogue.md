# Exemplar catalogue

The 29 sections of the user's two richest hand-built talk pages, `maintaining-markdown-for-ai` (13) and `ai-token-economy` (16; its Section 8 is commented out in the source), each pictured at rest and filed by the **claim type** it makes visible. A `write-spec` designer looks up the claim type of the Slide in front of it, studies the device that carried that claim before, and rebuilds it in this repo's tokens. The images set the bar for density and craft. Their markup is not a source: the pages are daisyUI on their own CSS and runtime, which the Spec contract refuses.

Every line marked _Draft — the user:_ is a judgement of taste awaiting the user's prune. Everything else describes what the image shows.

## How to read an entry

- **Claim**: the sentence the section makes the viewer believe.
- **Device**: the visual form that carries it.
- **Composition**: focal point, reading order, density.
- **Motion ends on**: the final state its reveal lands in, which is what the image shows.

Two habits run through nearly every entry, so they are stated once here rather than per entry:

- The title states the claim, not the topic, with its key phrase in the accent colour ("One small bug fix compounds to **~73,000 tokens** of context"). A mono kicker above it names the section (`S5.1 · COST OF AGENTIC AI`).
- Real numbers in mono, tabular figures, with citations inline as `[n]`; a one-line takeaway or source caption closes the section under its diagram.

_Draft — the user:_ in this repo `primary` is near-black, so the accent-phrase habit needs a decision: emphasise by weight alone, or name a token for it. The meaning colours (`machine`, `human`, `ai`) are not available for it.

## Compounding: a cost that grows step by step

### One small bug fix compounds to ~73,000 tokens of context

- Image: `ai-token-economy/13-one-small-bug-fix-compounds-to.jpg`
- Claim: each agent step re-sends everything before it, so a small task piles up.
- Device: a ledger of step rows, each with its own `+n` amount, beside a running-total column that restates the sum after each group; a total bar closes it.
- Composition: focal point the running totals on the right, read top to bottom; dense (13 rows) yet calm, because each group repeats one row shape.
- Motion ends on: every row in, every running total counted up to its final value, the total bar at 73,450.
- _Draft — the user:_ the strongest exemplar of the set. A running-total column is the device behind the user's round-2 "Cash left in each column" note on the cashflow board.

### For a real freelancer you need a business case. AI just bills you.

- Image: `ai-token-economy/05-for-a-real-freelancer-you-need.jpg`
- Claim: many tiny charges reach the same total as one signed invoice, without anyone approving them.
- Device: two receipts side by side: a solid signed invoice with three lines and a total, and a dashed "no invoice" card of loose charge chips reaching "Same total €3,200".
- Composition: focal point the two equal totals at the same height; read left then right; medium density.
- Motion ends on: the charge chips dripped in and the AI total climbed to €3,200.

### The corpus compounds (right chart of "Maintenance effort is rarely scheduled")

- Image: `maintaining-markdown-for-ai/03-maintenance-effort-is-rarely-scheduled-until.jpg`
- Claim: the maintenance surface grows faster than the file count.
- Device: two lines from one origin, one linear and one curving away, with the gap between them shaded.
- Composition: the shaded gap is the focal point; labels sit at each line's end, not in a legend.
- Motion ends on: both lines drawn and the gap filled.

## Decay and thresholds: a curve that crosses or dips

### Maintenance effort is rarely scheduled — until documentation fails

- Image: `maintaining-markdown-for-ai/03-maintenance-effort-is-rarely-scheduled-until.jpg`
- Claim: on one document, effort peaks at launch and decays while drift keeps climbing.
- Device: two curves on one axis crossing at a marked point ("where the work moved"), a shaded "before it ships" band and a "Day zero" pill; paired with the corpus chart above as a two-panel figure.
- Composition: focal point the crossing; end-of-line labels; light, mostly whitespace.
- Motion ends on: the document chart built and its crossing landed, then the corpus chart.
- _Draft — the user:_ the cleanest model for a "too late" Slide: the zero-cash month is the same kind of crossing.

### How key instructions get lost in the middle

- Image: `ai-token-economy/11-how-key-instructions-get-lost-in.jpg`
- Claim: models attend to the beginning and the end; the middle blurs.
- Device: one U-shaped curve over a shaded "lost middle" band, with a row of message cards under it whose middle cards are blurred.
- Composition: the curve's low point over the band is the focal point; read curve, then cards, then the two takeaway boxes.
- Motion ends on: the curve drawn and the middle cards blurred.

### Past ~half full, the model starts losing the plot

- Image: `ai-token-economy/12-past-half-full-the-model-starts.jpg`
- Claim: past about 50% fill, quality degrades.
- Device: a gradient gauge from smart zone to danger zone with a dashed threshold marker, a drag control under it, a tinted "what losing the plot looks like" panel, and two action cards (Monitor, Compact).
- Composition: focal point the threshold line; claim, symptom, remedy top to bottom.
- Motion ends on: the fill at 85%, past the threshold.

## Making the invisible visible: a hidden meter

### Most tools hide the meter — this is what seeing it looks like

- Image: `ai-token-economy/08-most-tools-hide-the-meter-this.jpg`
- Claim: the token count exists, and here it is.
- Device: a faithful recreation of a real tool readout (Claude Code `/context`) in a dark terminal: an icon grid of used and free cells beside a category table with amounts and percentages.
- Composition: the terminal fills the stage; focal point the `79.5k/200k (40%)` line; a caption says it is recreated from a real readout.
- Motion ends on: the grid filled to 40% and every row listed.
- _Draft — the user:_ "recreate the real tool screen" is the device for Slide 4-type Slides (pipeline tools in practice): draw the CRM or spreadsheet the founder would actually open, with real rows.

### Tokens are the basic unit of data for LLMs

- Image: `ai-token-economy/07-tokens-are-the-basic-unit-of.jpg`
- Claim: models read tokens, not words.
- Device: one sentence split into tinted token chips on a panel, a "try it" input with a live count, and a card of the four ways each token is billed.
- Composition: the chip sentence is the focal point; the try-it box carries depth, not the claim.
- Motion ends on: every chip placed.

### Context window is the model's attention span

- Image: `ai-token-economy/10-context-window-is-the-model-s.jpg`
- Claim: an agent fills the context far faster than a chat.
- Device: two stacked horizontal bars on a shared time axis (9 AM to 5 PM), segments labelled in place, a legend above, a percentage verdict per bar.
- Composition: the 90% bar is the focal point; the 42% bar is its foil.
- Motion ends on: both bars filled to their final segments.

## Comparison across options

### The same bug fix, priced across models

- Image: `ai-token-economy/14-the-same-bug-fix-priced-across.jpg`
- Claim: identical work costs about 14× more on one model than another.
- Device: two stat tiles (billed input, billed output), then one horizontal bar per model scaled to cost, the most expensive row tinted, then a takeaway band with the spread and a per-day projection.
- Composition: focal point the tinted most-expensive row and its price; stats, bars, takeaway top to bottom.
- Motion ends on: rows revealed and bars filled to their widths.
- _Draft — the user:_ the model for any "by the numbers" Slide: stat tiles first, bars at true proportion, one row tinted.

### You're now accountable for a budget you never signed up to manage

- Image: `ai-token-economy/06-you-re-now-accountable-for-a.jpg`
- Claim: the winner is the best outcome per euro, not the best outcome.
- Device: two option cards with paired bars (quality, outcome per euro), a "Financial winner" badge on one, a threshold slider, a context box, a closing pull line.
- Composition: focal point the badged card; dense but in clearly separated bands.
- Motion ends on: bars filled and the cheaper model crowned.

## Who does what: boundaries and partitions

### Verification boundaries and workflow

- Image: `maintaining-markdown-for-ai/04-verification-boundaries-and-workflow.jpg`
- Claim: machine, AI and human each verify a different thing.
- Device: a two-circle Venn (machine, human) whose overlap is a hatched AI lens with a note "my hypothesis — still unsettled", then three cards, one per region, each linking onward.
- Composition: focal point the overlap; diagram, then cards.
- Motion ends on: the Venn assembled actor by actor, the AI lens last.

### markdown-harness

- Image: `maintaining-markdown-for-ai/09-markdown-harness.jpg`
- Claim: the tool lives on the machine side and steers the AI overlap.
- Device: the same Venn, the machine circle emphasised, the human circle faded, a "Steer" arrow into the overlap and a "Running" marker.
- Composition: the same geometry as before, with emphasis moved.
- Motion ends on: the machine circle lit and the arrow drawn.

### The verifying half is yours

- Image: `maintaining-markdown-for-ai/13-the-verifying-half-is-yours.jpg`
- Claim: what is left after the machine and the AI is the human's job.
- Device: the same Venn a third time, the human circle now emphasised and the machine faded, the "still unsettled" line repeated.
- Composition: same geometry, emphasis on the human.
- Motion ends on: the emphasis drifted to the human region and held.
- _Draft — the user:_ these three are the precedent for a recurring motif drawn once and re-emphasised per Slide, like this run's `CashflowBoard`: one geometry, only the emphasis and overlays change.

## The same artefact, pass after pass

### What the machine verifies

- Image: `maintaining-markdown-for-ai/05-what-the-machine-verifies.jpg`
- Claim: a machine check proves a file is intact, never that it is true.
- Device: a real file in an editor window with line numbers and a front matter / body gutter, beside a verdict card listing three checks with ticks.
- Composition: file left, verdict right; focal point the "Resolves cleanly" status.
- Motion ends on: the machine pass resolved.

### What AI accelerates

- Image: `maintaining-markdown-for-ai/06-what-ai-accelerates.jpg`
- Claim: AI finds discrepancies fast, but its answer needs checking.
- Device: the same file, unchanged; on the right the earlier verdict collapsed to a one-line recap, under it a new AI card with observation, proposal and an amber "Needs verification".
- Composition: the new card is the focal point; the recap shows the history.
- Motion ends on: the AI pass landed amber.

### What remains human

- Image: `maintaining-markdown-for-ai/07-what-remains-human.jpg`
- Claim: ground truth only a human can establish.
- Device: the same file; two recaps stacked; a human card left visibly "Open · Unresolved" with its questions listed.
- Composition: focal point the open card, which is the largest.
- Motion ends on: both earlier passes settled as recaps, the human pass open.
- _Draft — the user:_ this three-beat sequence is the best model for a pipeline Slide run (leads, opportunities, deals): keep the artefact fixed and stack each stage's state beside it.

## Anatomy: an annotated artefact

### Markdown files in the era of AI

- Image: `maintaining-markdown-for-ai/02-markdown-files-in-the-era-of.jpg`
- Claim: one plain file is consumed three ways, at three costs.
- Device: a file window split into its front matter and body, connector lines drawn from it to three cards (Knowledge, Instructions, Memory), each with a dynamic or static tag and its cost.
- Composition: file left, consumers right; focal point the first connector into the highlighted card.
- Motion ends on: the composition risen and the arrows drawn to the three roles.

### Google OKF

- Image: `maintaining-markdown-for-ai/08-google-okf.jpg`
- Claim: a published schema already puts provenance and trust in front matter.
- Device: a full annotated schema in an editor window, a comment column aligned to each field with REQUIRED in red, and a source card linking the specification.
- Composition: the editor fills the stage; dense, readable because the comments align in one column.
- Motion ends on: the default reveal.

## Persona and thought experiment

### Thought experiment: imagine you're assigned a freelancer with these weird characteristics

- Image: `ai-token-economy/02-thought-experiment-imagine-you-re-assigned.jpg`
- Claim: an LLM is a freelancer with three strengths and three flaws.
- Device: three green strength cards and three red flaw cards flanking a central split-head illustration.
- Composition: symmetric; the illustration is the focal point.
- Motion ends on: strengths and flaws revealed in sequence.
- _Draft — the user:_ the illustration is not reproducible in tokens; the two-column strengths-versus-flaws frame is.

### It's an LLM — but if it were a human, how would you manage it?

- Image: `ai-token-economy/03-it-s-an-llm-but-if.jpg`
- Claim: you either work with AI yourself or lead people who do.
- Device: a pull quote with a highlighted multiplier (5–20×), then two door cards, each with a small branching node diagram (one person to many AIs; one leader to people to AIs).
- Composition: the second, accented door is the focal point.
- Motion ends on: one figure branched into a team and the multiplier counted up.

## Timeline and eras

### New technology gives rise to new disciplines for humans to cope

- Image: `ai-token-economy/04-new-technology-gives-rise-to-new.jpg`
- Claim: each AI era brings a new discipline, all resting on the token economy.
- Device: four era cards left to right (years, workflow, discipline), the last one dashed and "emerging", over a full-width foundation band.
- Composition: read left to right; the foundation band is the takeaway.
- Motion ends on: four eras revealed left to right, the foundation drawn last.

## Mechanism and flow

### Runs on a 100% deterministic core

- Image: `maintaining-markdown-for-ai/10-runs-on-a-100-deterministic-core.jpg`
- Claim: three triggers, one identical core, three outcomes.
- Device: a three-row flow (trigger, then the shared core box, then the outcome), the core drawn once as a dashed container spanning all rows.
- Composition: focal point the shared core in the middle; read each row left to right.
- Motion ends on: the default reveal.

### My real model stack: one workflow, many models

- Image: `ai-token-economy/15-my-real-model-stack-one-workflow.jpg`
- Claim: one project moves through phases, and each phase uses a different model tier.
- Device: three numbered phase lanes joined by arrows, each holding task cards with model chips coloured by tier, a tier legend above, a pattern band below.
- Composition: dense but lane-structured; read left to right, then down each lane.
- Motion ends on: lanes and chips placed.

## Actionables and status

### Three levers to improve your token economy

- Image: `ai-token-economy/16-three-levers-to-improve-your-token.jpg`
- Claim: there are concrete things to try today.
- Device: three columns on a board surface (Automated, Agent Steering, Team Practices), each an icon header over stacked cards with a coloured left rule.
- Composition: even weight, no single focal point; the densest section of either page.
- Motion ends on: columns and cards placed.
- _Draft — the user:_ the model for an actionables close like "Start before you need the money": one column per Actionable, each card one first step.

### Feature roadmap

- Image: `maintaining-markdown-for-ai/12-feature-roadmap.jpg`
- Claim: what is shipped and what is planned.
- Device: a solid "Shipped" card with ticks and a quickstart terminal beside a dashed "Planned" card with open circles.
- Composition: shipped is the focal point by fill.
- Motion ends on: the default reveal.

## Openers and hand-offs

### Maintaining markdown for AI

- Image: `maintaining-markdown-for-ai/01-maintaining-markdown-for-ai.jpg`
- Claim: the talk's thesis in one line, "writing got cheap, verifying got expensive".
- Device: a hero on a faint grid with soft glows, the thesis with its two key words coloured, the byline, a watch-the-talk card.
- Composition: type leads; focal point the title.
- Motion ends on: the hero landed line by line.

### The AI Token Economy

- Image: `ai-token-economy/01-the-ai-token-economy.jpg`
- Claim: AI gives you powers and hidden responsibilities.
- Device: a hero over an illustration, with a running "tokens billed · unwatched" counter in the corner.
- Composition: the title leads; the counter is a quiet second focal point that plants the talk's meter motif.
- Motion ends on: the counter still running.

### The meter is hidden on purpose

- Image: `ai-token-economy/09-the-meter-is-hidden-on-purpose.jpg`
- Claim: vendors profit from the meter being invisible.
- Device: a "hypothesis, not an accusation" tag, a two-panel comic, two numbered cards (initiation, hook), a closing band tying back to the earlier meter.
- Composition: the comic dominates.
- Motion ends on: the default reveal.
- _Draft — the user:_ the comic is an image asset, outside what a Spec mock can draw; the hedge tag and the two-card initiation-then-hook frame are reusable.

### Live demo

- Image: `maintaining-markdown-for-ai/11-live-demo.jpg`
- Claim: hand-off to a live demo: the file under test and the question asked.
- Device: a mono file path and a quoted prompt with a left rule.
- Composition: sparse on purpose; the demo itself happens off the page.
- Motion ends on: the default reveal.
- _Draft — the user:_ the one sparse section; a demo hand-off, not a model for a Slide that must stand on its own.

## How these were made

Each image is one `section.beat` of `coaching-content/src/<page>/index.html`, served by that repo's Vite dev server and captured at 1440 px wide, light scheme, with `prefers-reduced-motion: reduce`. Under reduced motion every beat renders its final state at once (each page's `presentation.js` requires it). The scroll tower was unrolled so each beat lays out at full height. Interactive controls (sliders, the try-it box) show their default state.

## Proposed changes

Drafts for the user, not applied. Each names its file, under `skills/new-episode/` unless the path says otherwise, and its one-line change.

1. `assets/spec-patterns.html` (new): token-only rebuilds of the seven devices most Slides need, each a `figure` that passes the staging test, tagged with its claim type:
   - the running-total ledger (ate 13);
   - the two-curve crossing (mm 03);
   - the recreated tool screen (ate 08);
   - the bars at true proportion with one row tinted (ate 14);
   - the recurring motif re-emphasised (mm 04, 09, 13);
   - the fixed artefact with stacked passes (mm 05–07);
   - the actionables board (ate 16).
2. `references/write-dossier.md`, the Visual bullet: each Slide's Visual names one claim type from `assets/exemplars/catalogue.md` and lists the concrete content the Slide shows (every note, amount, name and label), so designers start from material, not a sentence.
3. `references/spec-designer.md`, "What you read": add the catalogue and `assets/spec-patterns.html`; per Slide, find its claim type, study the exemplar image, and build at least one Option from that device in tokens.
4. `references/spec-designer.md`, "The mock is the Slide": a mock matches the density of the exemplar for its claim type; claim-stating titles, real numbers in mono and a closing takeaway line are the default.
5. `references/spec-designer.md`, a new rule: before returning, measure every text box in the real Spec frame, never only the preview, which renders about 40 px wider (`npm run episode:spec-preview` renders the real frame).
6. `references/spec-designer.md`, figcaption rule: every figcaption gives its reason as why this Option over the Slide's others; the recommended one says why it wins.
7. `references/write-spec.md`, Prompt step 1: when Slides share a part, the Visual language names one Option as its reference drawing, and every mock of that part copies it (this run's `CashflowBoard`, the Venn of mm 04, 09 and 13).
8. `references/write-spec.md`, rubric line 10: append "and at least the density of the catalogue exemplar for its claim type; text that runs past its box at 1440 px in the Spec frame fails."
9. `assets/spec-frame.html`: show the claim type and its exemplar thumbnail in each `spec-slide-head`, so the user sees the bar each Option was held to.
10. `scripts/` (new, by `/tdd` after the user agrees the seams): promote this harvest's capture (reduced motion, unrolled tower, one image per `section.beat`) into a script, so a new hand-built page joins the catalogue with one command.

### Spec page UX, from the user's round-2 review

The user's words, 2026-10-16: the note sits below the Slide where they can no longer see it; the intro is three text-heavy columns they do not read; save should be a full button that confirms and keeps their input. These change `assets/spec-frame.html`, `assets/spec-review.html` and the Spec contract in `src/lib/episode-spec*.pure.ts` with its staging test, so they are built by `/tdd`.

11. Pick by tab: the pick checkbox goes; the active tab is the Slide's pick, so every Slide always has exactly one, defaulting to the recommended Option. The contract and `feedback.md` read the pick from the active tab.
12. Note as a speech bubble: a Note button to the right of the tabs opens a bubble over the stage, typed or dictated, so the Slide stays in view. It stays open with its text while the user switches tabs, has no save of its own, and closes with an × at its top right. The page's Submit saves every bubble's text.
13. Submit as a full-width primary button; on save, a confirmation alert; inputs and picks are kept after saving, never cleared.
14. Intro as visuals, not columns: Style, Visual language and Episode page render as visual cards, for example a swatch strip of the tints and tokens, the recurring motif drawn small (the board, the pills), and the Episode page as a mini outline of title slide, Sections and markers, with prose behind a closed `details`.
