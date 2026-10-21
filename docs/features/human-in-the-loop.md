---
type: feature-guide
title: Human-in-the-loop Shared visual
stale_after: 2027-04-22T00:00:00Z
---

# Human-in-the-loop Shared visual

Read before placing, changing or testing the human-in-the-loop Shared visual (`src/components/slide-shared/human-in-the-loop/`) or adding a Workflow to it. Binding rules: [FE-012 Shared Visual Content](../../.archgate/adrs/FE-012-shared-visual-content.md), [FE-006](../../.archgate/adrs/FE-006-server-client-boundary.md) §5, [FE-007](../../.archgate/adrs/FE-007-module-layering.md) §5 and [FE-011](../../.archgate/adrs/FE-011-design-tokens.md). This guide holds the detail that does not bind. A **Workflow** is defined in the [glossary](../../GLOSSARY.md).

## Placing it

A Slide renders `<HumanInTheLoop workflow="summer-party" locale={locale} diagram={…} />` from `human-in-the-loop.tsx`, the server entry. It reads the Workflows and the words of the locale at build time and hands them, serializable, to the one client parent `human-in-the-loop.client.tsx`.

- `words={{ ui, workflow }}` overrides the chrome words and the shown Workflow's words, key by key. Prefer the Workflow's own words; override only what the Slide says differently (both shipped Slides now override none).
- `diagram` carries the Slide's own markers, popovers, notes (`target`), gate words and the worked-chat button, keyed by stage and job id. Its `initials` bolds the first letter of each move; the server entry alone drops it for German, so a Slide just says `initials: true`. `jobsLabel` is a template (`{stage}: jobs`) for every stage's list of jobs, `gateLabel` on a stage slot is the word for its gate, and a stage's or job's `popover` carries no title: the diagram titles it with the stage name.
- `mode`, `level` and `controls` set the start state. `controls` is the Preset's override of the typed control registry in `toolbar-controls.pure.ts` (`mode`, `level`, `setup`, `picker`, `download`, `upload`), laid over it key by key, e.g. `{ picker: { show: false } }`; each control also names the modes it shows in.
- The toolbar is quiet on purpose. In Watch it is only the Watch / Try switch, so the talk looks as before; Try adds the Simple / Technical switch, the picker, download and upload, and the one-time setup block in Technical. The row keeps its height between the two, so the diagram stays put.
- Naming against FE-012 §4.3: the ADR's `renderMode` is `level` here, one global value. There is no per-part override because no part has a Simple and a Technical view of its own; the Level changes only what a job copies.

## Parts

The parent owns all state (`workflow-state.pure.ts`), computes `workflowView` once per change and gives each part its slice: `toolbar-part`, `diagram-part`, `modal-part`. FE-012 §4.5 asks for a pure `*-view.tsx` where a part can render alone; the diagram, its job cards and the modal body compose client leaves (`node-popover.client`, `diagram-try.client`, the ticket graph) and are only ever shown by a client part, so they stay plain `.tsx` (the lint rule bars a `*-view.tsx` from importing a client leaf). The output views in `outputs/` are `*-view.tsx`; anything with a handler is a `.client.tsx` leaf. The glyphs the visual draws live in `slide-shared/glyphs/`. Output views of an example result live in `outputs/` and are chosen by `OutputView` (`output-dispatch.tsx`) from the handoff `kind`: `text`, `spec`, `tickets`, `research`, `comparison`, `requirements`. The tickets view is the dependency graph: the parent holds the ticked ids, a click on a ready ticket ticks it and readies what it blocked.

## Adding a Workflow

1. Copy `summer-party.config.yml` to `<id>.config.yml` and `summer-party.config.de.yml` to `<id>.config.de.yml`. The English file holds the data (stages, jobs, `dependsOn`, `inputs`, `outputs`, `skills`, `fanOut`, `focalJob`) and `words:`; the German file holds `words:` only, under exactly the same key paths. A prompt's `{{id}}` marks where the handoff of the output `id` is pasted; handoff keys (`kind`, `text`, …) stay English in both languages.
2. Give every job a `prompt`, an `exampleInput` (every job after the first) and `exampleOutput` in fenced `handoff` blocks, and a `check` (criteria and prompt). A `command` shows in Technical and is copied as written, so it never holds a raw `{{id}}`: write a bracketed placeholder such as `/to-spec [paste your answers here]`. A `page` has both `simple` (one self-contained HTML file) and `technical` (write a temporary .html file, serve it on localhost, open the browser). In German every prompt, check, page and command says `Antworte auf Deutsch`.
3. Register it in `workflow-data.ts`: import both files, add the id to `WORKFLOW_IDS` and the pair to `PAIRS`. The picker lists `WORKFLOW_IDS` in order.
4. Run `npm run verify`. `workflow-data.test.ts` loads every pair in both locales (the build throws each problem of a shipped pair, see `workflow.pure.ts` and `workflow-checks.pure.ts`) and holds the German keys equal to the English ones.
5. Viewers may also upload a Workflow file (same shape, one file with its own words); problems are listed under the toolbar and the authored Workflow stays.

The output labels (Goal, Done, Waiting, …) are the `output:` tree of `human-in-the-loop.config.yml` and its German twin, not part of a Workflow; English comes from that file alone, with no copy in code.

## Testing

- Fast suite: `*.pure.test.ts` and `*.test.ts` beside the files (Workflow loading, view model, state, handoff parsing, ticket graph, output dispatch, German parity).
- Browser seam: `human-in-the-loop.browser.test.ts`, local only (`npm run test:browser`), drives the "Brief the venue" Slide in the shared headless Chrome: Watch to Try, a job modal and its quick actions, "Copied", backdrop and Escape close, the example spec and ticket graph, ticking a ticket, Vacation with Technical setup and the `/skill` copy, a broken and a valid upload, axe in light and dark, and phone width. `HITL_URL` names the page (default `http://localhost:3000/episodes/onboard-ai-every-time/`), served by `next dev` or `npm run preview`.
- Episode text captures (`tests/…/episode-text`) include the toolbar words; recapture them when a word changes.
