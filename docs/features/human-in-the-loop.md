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
- `diagram` carries the Slide's own markers, popovers, notes (`target`), gate words and the worked-chat button, keyed by stage and job id. Its `initials` bolds the first letter of each move (English only).
- `mode`, `level` and `controls` (`picker`, `download`, `upload`, each on unless `false`) set the start state.
- The toolbar is quiet on purpose: one compact row, the Watch / Try switch and Simple / Technical switch left, the picker, download and upload as ghost buttons right.

## Parts

The parent owns all state (`workflow-state.pure.ts`) and gives each part its slice: `toolbar-part`, `diagram-part`, `modal-part`. Output views of an example result live in `outputs/` and are chosen by `OutputView` (`output-dispatch.tsx`) from the handoff `kind`: `text`, `spec`, `tickets`, `research`, `comparison`, `requirements`. The tickets view is the dependency graph: the parent holds the ticked ids, a click on a ready ticket ticks it and readies what it blocked.

## Adding a Workflow

1. Copy `summer-party.config.yml` to `<id>.config.yml` and `summer-party.config.de.yml` to `<id>.config.de.yml`. The English file holds the data (stages, jobs, `dependsOn`, `inputs`, `outputs`, `skills`, `fanOut`, `focalJob`) and `words:`; the German file holds `words:` only, under exactly the same key paths. A prompt's `{{id}}` marks where the handoff of the output `id` is pasted; handoff keys (`kind`, `text`, …) stay English in both languages.
2. Give every job a `prompt`, an `exampleInput` and `exampleOutput` in fenced `handoff` blocks, and a `check` (criteria and prompt). A `command` (for example `/to-spec {{answers}}`) shows in Technical.
3. Register it in `workflow-data.ts`: import both files, add the id to `WORKFLOW_IDS` and the pair to `PAIRS`. The picker lists `WORKFLOW_IDS` in order.
4. Run `npm run verify`. `workflow-data.test.ts` loads every pair in both locales (the build throws each problem of a shipped pair, see `workflow.pure.ts` and `workflow-checks.pure.ts`) and holds the German keys equal to the English ones.
5. Viewers may also upload a Workflow file (same shape, one file with its own words); problems are listed under the toolbar and the authored Workflow stays.

The output labels (Goal, Done, Waiting, …) are the `output:` tree of `human-in-the-loop.config.yml` and its German twin, not part of a Workflow.

## Testing

- Fast suite: `*.pure.test.ts` and `*.test.ts` beside the files (Workflow loading, view model, state, handoff parsing, ticket graph, output dispatch, German parity).
- Browser seam: `human-in-the-loop.browser.test.ts`, local only (`npm run test:browser`), drives the "Brief the venue" Slide in the shared headless Chrome: Watch to Try, a job modal and its quick actions, "Copied", backdrop and Escape close, the example spec and ticket graph, ticking a ticket, Vacation with Technical setup and the `/skill` copy, a broken and a valid upload, axe in light and dark, and phone width. `HITL_URL` names the page (default `http://localhost:3000/episodes/onboard-ai-every-time/`), served by `next dev` or `npm run preview`.
- Episode text captures (`tests/…/episode-text`) include the toolbar words; recapture them when a word changes.
