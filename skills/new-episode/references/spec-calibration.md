# Spec calibration

What every Episode's Spec shares. [`to-decision-html`](../../to-decision-html/SKILL.md) takes these values as the caller's inputs and writes the Spec template from them; `/new-episode` keeps everything else about Episodes ([design-ADR-0011](../../../docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md)). The per-Episode inputs stay where they are: the Brief, the Dossier and the designers' fragments. The skill knows nothing of Episodes; this file is the whole seam.

## Page

| Input         | Value                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------- |
| Mode          | `decide`                                                                                 |
| Fidelity      | `mock`, a real-content mock of the Slide (`data-fidelity="mock"` on every item)          |
| Design size   | 1920 × 1080: a mock is a Slide frame that grows to 1920 px on a wide screen              |
| Audience      | Han, who judges each Slide's design and picks an Option per Slide                        |
| Template file | `assets/spec-template.html`                                                              |
| Revision      | `data-revision` on `<html>` is the Gate round: one past the feedback rounds saved so far |
| Page id       | `data-page-id` on `<html>` is the Episode slug                                           |

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
- **Option.** One per fragment Option. The assembler sets `data-option` and `data-recommended` from the fragment, `data-picked` on the locked Option, and on the `pick` checkbox `name="pick:<slug>"`, the Option id as `value` and `checked` when locked. `stage` takes the fragment's mock, `caption` its figcaption, `build-notes` its build notes.
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

The template is hand-written for now. Regenerating it from this calibration with `to-decision-html` around the sample Episode, with the freshness test that points here, is the follow-up [#565](https://github.com/hancrafted/content-library/issues/565).
