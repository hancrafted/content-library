# Handoff: Spec corrections for "What lies below the waterline of sustainable AI skills"

`docs/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/spec/spec.html` is the source of truth. It was reviewed against `brief.md` (generated 2026-11-12T15:08:35Z) and the voice-grill decisions in `.scratch/what-lies-below-the-waterline-of-sustainable-ai-skills/handoff-slides.md`.

## Verdict

- All 26 Slides are present, in Brief order, in the right 8 Sections. Each Slide's title, purpose, caption and Visual idea match the Brief verbatim.
- The spec is a skeleton (`generated.by: process:spec-assemble`, 2026-11-12T15:10:59Z). What a Spec must hold for Build is missing. Fix the gaps below before Han reviews it.

## 1. Missing for Build (blocking)

1. **No Options on any Slide.** No `.spec-options`, no `data-spec="option"` figures, no mocks. Each of the 26 Slides needs 2–3 drawn Options, one marked recommended.
2. **No Title slide.** No `data-spec="title-slide"` article exists, yet every section band says "drawn in the Title-slide Options". Add the Title slide (title, caption, Hero motif) with its Options, each Option followed by its strip of 8 section-slide echoes.
3. **No Speaker notes or Voice script** on any Slide. The Dossier's content per Slide, with citations, must be in the Spec.
4. **No research links.** The Brief's `_Research:_` numbers were dropped. Carry them into each Slide's Speaker notes:
   | Slide  | Research | Slide | Research |
   | ------ | -------- | ----- | -------- |
   | 3–6    | 3        | 15    | 1, 4     |
   | 7      | 3, 5     | 16    | 4        |
   | 8      | 1, 8     | 18    | 7        |
   | 9      | 1        | 20    | 6        |
   | 10     | 4        | 21    | 6, 7     |
   | 11, 14 | 2        | 22    | 5        |
   | 12     | 4        | 23    | 1        |
   | 13     | 2, 5     | 24    | 1, 9     |
5. **Review form incomplete.** Only `note:visual-language` exists. Each Slide (and the Title slide) needs its `pick:<slide-slug>` checkboxes per Option and its `note:<slide-slug>` textarea, as the form comment and design-ADR 0011 require.

## 2. Missing from the Brief card

The card shows Learning goal, Actionables, Research questions, Style and Constraints. Add **Analogy**, since every Visual idea depends on it. If `write-spec` allows more, also add Hook, Red thread, Audience and Format.

## 3. Grill decisions missing from both spec and Brief

Add these to the spec's design notes (the visual-language block), so the designers draw them without asking:

- **Zone per Section on the section bands.** Surface: Sections 1–2. Sunlit: 3–4. Twilight: 5–6. Midnight: 7. Abyss: 8. The Constraints list it, but no section band names its zone.
- **Iceberg mechanics** (from the design guide, restated for this Episode):
  - depth ruler on section slides with a rising-bubbles transition, the Section's tile lighting up
  - slim left-edge rail on page Slides
  - the diving robot on its cable as the depth marker
  - one emphasis motion per Slide; nothing loops at rest; under reduced motion everything shows in its final state
  - zone colours as tokens; each Slide only names its zone
- **Meaning colours** (_agent-decided_, confirm with Han): pilot `ai`, captain `human`, robot and ship machinery `machine`.
- **Slide 2 Options**: Han expects a new kind of visual. Offer at least a comic Option and a cutaway-illustration Option.
- **Slide 8**: the Sunlit section slide carries the line "What works for people also works for AI". Today it sits only inside Slide 8's purpose. Draw it on the section slide.
- **Slide 18**: label the matrix "rule of thumb" in the drawing, not only in the text.
- **Slide 21**: a callback zoom into Slide 18's matrix, not a new chart. Reuse Slide 18's drawing.

## 4. Unsettled in the grill (designers propose, Han picks)

Motion was never settled for these Slides; each Option should name one emphasis motion:

- **Slide 1**: _agent-decided_ suggestion: panels appear one after another.
- **Slide 3**: none settled.
- **Slide 6**: none settled.
- **Slide 14**: _agent-decided_ suggestion: the depth note moves from the card to the wall.

## 5. Brief changes since the voice grill (confirm with Han)

Claude Code changed these after the grill. They aren't errors, but they aren't in Han's verbatim wording either:

- **Red thread** gained "once you've explained a task three times". Grill wording: "Every conversation with AI starts from zero on how you work; a skill hands the AI your proven procedure on demand, and where you put the project details, inside the skill or beside it, decides how reusable it is."
- **Slide 17 caption** became "Project details **can** stay beside the skill…"; the grill had "Project details stay beside the skill…". The change fits the "Not a law" Constraint.
- **Research questions** were split from 6 into 9. Content is the same; the Slide links were renumbered correctly.

## Next action

1. Run `write-spec` to draw the Title slide and all 26 Slides' Options, and to fill Speaker notes, Voice scripts and research links from the Dossier.
2. Add the design notes from part 3 and the review-form fields from part 1.
3. Ask Han the two confirmations in part 5, and write his answers verbatim into `brief.md`.
4. Then serve with `npm run episode:spec` for Han's review.
