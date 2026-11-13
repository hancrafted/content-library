# Spec calibration

What every Episode's Spec shares. [`to-decision-html`](../../to-decision-html/SKILL.md) takes these values as the caller's inputs and writes the Spec template from them; `/new-episode` keeps everything else about Episodes ([design-ADR-0011](../../../docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md)). The per-Episode inputs stay where they are: the Brief, the Dossier and the designers' fragments. The skill knows nothing of Episodes; this file is the whole seam.

## Page

| Input         | Value                                                                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Mode          | `decide`                                                                                                                                                                                                                 |
| Fidelity      | `mock`, a real-content mock of the Slide (`data-fidelity="mock"` on every item)                                                                                                                                          |
| Design size   | 1920 × 1080: a mock is a Slide frame that grows to 1920 px on a wide screen                                                                                                                                              |
| Audience      | Han, who judges each Slide's design and picks an Option per Slide                                                                                                                                                        |
| Feedback      | The local review server (below): the page posts the form to it; it has no download, Copy prompt, handoff or Reset all, because a reset would unlock a locked Slide                                                       |
| Reflection    | _Before you approve_ lists these lenses, answered in the general comment: accessibility (contrast, focus, motion), the German text length, what each pick costs to build, what a Slide's Option copies from a shared one |
| Template file | `assets/spec-template.html`                                                                                                                                                                                              |
| Revision      | `data-revision` on `<html>` is the Gate round: one past the feedback rounds saved so far                                                                                                                                 |
| Page id       | `data-page-id` on `<html>` is the Episode slug                                                                                                                                                                           |

## Render presets

The device toolbar re-renders every mock at one of these; `fit` is the full column.

| Preset    | Size                   |
| --------- | ---------------------- |
| `desktop` | 1920 px wide           |
| `laptop`  | 1440 px wide           |
| `tablet`  | 1024 px wide           |
| `mobile`  | 390 px wide            |
| `shorts`  | 1080 × 1920 (vertical) |

## Template and slots

The template is a page frame plus two `<template>` elements. The assembler (`npm run episode:spec-assemble`, `src/pipeline/lib/episode-spec-assemble.pure.ts`) clones each `<template>`, fills its `data-slot` elements and sets the attributes below. A slot holding markup has its content replaced; one with no content is removed; a slot the assembler does not know makes it throw.

| Where                               | Slots                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| Page frame                          | `page-title`, `meta`, `outline`, `kicker`, `heading`, `lede`, `intro`, `items` |
| `<template data-template="item">`   | `number`, `title`, `purpose`, `words`, `options`, `note`                       |
| `<template data-template="option">` | `stage`, `caption`, `build-notes`, `pick`, `id`                                |

- **Item.** One per Slide and one for the Title slide, whose `stage` holds each Option's mock and its `ol[data-spec="echoes"]`. The assembler sets `data-spec` (`slide` or `title-slide`), `id` and `data-item` to the Slide slug (`top` for the Title slide), `data-fidelity="mock"` and, on a Slide, `data-number`. The `note` slot is a `<textarea>`: the assembler sets its `name` (`note:<slug>`) and placeholder.
- **Option.** One per fragment Option. The assembler sets `data-option` and `data-recommended` from the fragment, `"true"` for a bare or `"true"` attribute and `"false"` for an absent or `"false"` one (the page contract's form), `data-picked` on the locked Option, and on the `pick` checkbox `name="pick:<slug>"`, the Option id as `value` and `checked` when locked. `stage` takes the fragment's mock, `caption` its figcaption, `build-notes` its build notes. The template puts `data-visual` and `data-design-width="1920"` on the `stage` element, so a mock widens to the design size.
- **Frame.** `data-revision` and `data-page-id` on `<html>`. The review form (`#spec-review`) holds the general comment `note:page`, the Next action `next` and Save; every pick and note field outside it joins it by `form="spec-review"`.
- **Fragments.** The designers' format is the one in [`spec-designer.md`](spec-designer.md#the-markup-rules); the assembler reads it unchanged.
- **Outside the slots.** The outline, intro cards and Section bands are built by the assembler as markup, placed in the `outline`, `intro` and `items` slots.

## Saving the review

`npm run episode:spec -- <slug>` serves the page and receives the form's `POST /` (`application/x-www-form-urlencoded`). Fields:

| Field                  | Carries                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `pick:<slug>`          | One per ticked Option, valued by the Option id; `pick:top` for the Title slide |
| `note:<slug>`          | The note on a Slide; required while it has no pick                             |
| `note:visual-language` | The note on the Visual language                                                |
| `note:brief--<slug>`   | The note on a Brief heading, while the Brief is not approved                   |
| `note:page`            | The general comment on the Spec as a whole                                     |
| `next`                 | The Next action                                                                |

The server writes the next `feedback/<NN>/feedback.md` (`via: spec`) and answers `303` to `/?saved=<NN>`; a refused review answers `400` and writes nothing. The lines are ``- `top` · design — picked: 0b``, ``- `<section>--<slide>` · design — picked: 3b | 4a, 4c | none — <note>``, ``- `visual-language` · design — <note>``, ``- `page` · design — <note>`` and ``- `next` · gate — redesign|approve``. The server refuses `approve` while a Slide has no pick, naming it.

## Next actions

| Action     | The orchestrator then                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `redesign` | Starts a new Attempt for the Slides with zero or several picks ([Spec Gate](write-spec.md#the-spec-gate) step 4) |
| `approve`  | Tells Han the Spec is theirs to approve ([Spec Gate](write-spec.md#the-spec-gate) step 5)                        |

Preset `redesign`. A round saved with no `next` line is the one case to ask in chat.

## Tokens and `design.css`

`design.css` is the site's `src/app/globals.css` compiled by Tailwind over the folder, and `spec-assemble` inlines it as `<style data-design-css>`, so the page stands alone. Its tokens are the FE-011 tokens; mocks use token classes and the type roles `text-body`, `text-caption`, `text-subheading`, `text-heading` and `text-hero`, never a hex colour, an arbitrary value or a raw size. The template's own CSS uses the same variables (`--background`, `--card`, `--border`, `--primary`, `--foreground`, `--muted-foreground`, `--ring`), each with a system-colour fallback.

## Regenerating the template

A test (`tests/docs/spec-template-fresh.test.ts`) fails when `to-decision-html` or this file has changed since the template was generated. The template records a hash of its sources in `<meta name="spec-template-source-hash">`; the hash covers the skill's `SKILL.md`, every file under the skill's `references/` and this file without this section. Regenerate the template, then record the new hash:

1. Invoke the Skill tool with `to-decision-html`, mode `decide`, with this calibration as the caller's inputs and the Slides of [the sample Episode](../assets/sample-episode/brief.md) as the items, each with two or three Options at fidelity `mock`. When the session does not list the skill (a worktree made after the session began), read its `SKILL.md` and `references/` and follow them. Here the template is the frame, so the caller does not own it: the skill's steps 4 to 6 write the page frame, the review form and the layout of an item and of an Option, and step 7 inlines and verifies by hand, with no grader. Its items and Options become the two `<template>`s with the slots from [Template and slots](#template-and-slots), and the assembler fills them.
2. Write the result to `assets/spec-template.html`. Keep every `data-slot` and `data-template` name this file lists, and the review form's fields from [Saving the review](#saving-the-review). The checks read the assembled page, so keep `figcaption` a direct child of the Option's `figure`, the pick `<input type="checkbox" form="spec-review">` inside it and the note `<textarea>` with `form="spec-review"`.
3. Run `npm run episode:spec-template-hash` and write its output as the `content` of `<meta name="spec-template-source-hash">` in the template's `<head>`. Run Prettier on the template first: it does not touch that tag.
4. Reassemble the sample Spec, `assets/sample-episode/spec/spec.html`. The assembler reads the designers' fragments from `.scratch/<Episode folder name>/spec/`, which is git-ignored, so copy the sample's from [`assets/sample-fragments/`](../assets/sample-fragments) first: `mkdir -p .scratch/sample-episode/spec && cp skills/new-episode/assets/sample-fragments/*.html .scratch/sample-episode/spec/`, then `npm run episode:spec-assemble -- skills/new-episode/assets/sample-episode`. The sample holds `feedback/01`, so the Spec is written with `data-revision="2"`; delete any `feedback/02` round a test save made, then assemble again.
5. Check the sample by hand, never with the grader: `npm run episode:spec -- skills/new-episode/assets/sample-episode` serves it, and `npm run inspect-page` (the `visual-check` skill) measures a mock, a pick target, the rail and the left gap at 2560 × 1440, 1440 × 900 and 1024 × 768, and a save through the server writes the `page` and `next` lines. Stop the server.
6. Run `npm run verify`, then commit the template and the sample Spec together.

Never copy a hash in without step 1: the hash states that the template was generated from these sources.
