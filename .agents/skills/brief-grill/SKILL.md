---
name: brief-grill
description: Grill Han through a new Episode idea until it is a Brief, the goals the Episode is written towards. Use when Han starts a new Episode, says "Brief grill", or wants an Episode idea grilled.
---

# Brief grill

A creative dialogue with Han that ends in a governed **Brief** for a new Episode. Claude Code and a Claude Desktop voice session both run this procedure, and both end with the same Brief, the one under _Brief template_ at the end of this file.

This file is self-contained: Claude Code loads it as the `brief-grill` skill (`.agents/skills/brief-grill/SKILL.md`), and the Claude Desktop project holds a copy named `brief-grill.md`. Terms are in `GLOSSARY.md` under _Episode production_.

## When this applies

Only when Han starts a new Episode: "new episode", "Brief grill", or an Episode idea he wants grilled. The Claude Desktop project loads this file into every conversation; it is inert otherwise.

The Brief grill overrides the `grilling` skill's design tree and the classification in `grilling-format.md`: every element of a Brief is Han's creative decision, so nothing is decided without asking. Take only the `grilling` skill's stance, relentless and one round at a time. In voice, the channel rules of `grilling-voice.md` hold in every phase (see _Voice sessions_).

## The phases

### 1. Frame

Settle the frame before any creative work, so Explore does not drift towards the wrong audience. Ask for what the opening prompt left out:

1. **Topic**: the idea in one line.
2. **Audience**: who watches, and what they already know and want. The English YouTube audience wants reach; German businesses want a reason to hire Han.
3. **Format or length**: Foundations, Teardown or Short, and the planned minutes. The length decides later whether the Episode gets Threads.

_Done when_ you have read all three back in one sentence and Han has confirmed it.

### 2. Explore

A creative dialogue with no form. Propose ideas, push back, ask what would make a viewer stay, try angles Han has not mentioned. Leave the Brief's headings unspoken: walking them is Settle's job.

Keep a **candidates log** as private bookkeeping. Whenever a possible decision surfaces (a hook, an analogy, a Red thread, a learning goal, an actionable, a story rule, a Section or a Slide, a research question, a pair of Threads), log it as a candidate under the Brief heading it would fill, in Han's words where he said it. Log it and move on; a candidate is put to Han as a decision only in Settle. Read the log back only when Han asks.

_Done when_ the log reaches **coverage**: a candidate for about half of the Brief's headings and of the Sections Han has named. Then steer Han towards settling the rest ("we have enough to settle; shall we?"). The moment Han says **"settle"**, switch, whatever the coverage.

### 3. Settle

Fill each heading from the candidates log first, in this order: goals, then Constraints, then Slides, then Research questions. A Slide's claims are what raise its research questions, so the questions settle last.

- **Format** and **Audience**: read back what Frame settled.
- **Style**: one line naming a style from `docs/design/design-guide.md` and the audience reason for it. Offer 2–3 of the named styles with the audience each suits, and recommend one. A style may differ by audience but stays the same within the Episode, and the designers write the Slides within it. A style the guide does not list is a design-guide change: flag it as open, and the Brief fails the staging check until `docs/design/design-guide.md` lists it.
- **Creative elements** (Learning goal, Actionables, Hook, Red thread, Threads, Analogy): offer 2–3 candidates, each in one sentence, and recommend one with its reason. Draw them from the log; generate new ones only where the log has fewer than two. Han chooses or rewords; write down his wording verbatim, because his edits are what later teach agents his style.
- **Threads**: offer "no Threads" as one candidate for a Short. A longer Episode gets an A thread (the mechanism or argument) and a B thread (a story told in turns with it). For 10 minutes or more, Han chooses Threads or declines them by name.
- **Constraints**: the story rules every Slide obeys, such as "reusable across talks: no dated claims". A rule for one Slide goes into that Slide's purpose instead.
- **Slides**: propose one whole **spine** from the log, read Section by Section: each Section's title, then each Slide's title, purpose and visual idea. Han edits, reorders or cuts; offer an alternative only where he asks for one. The spine is the Red thread made concrete: the first Slide carries the Hook, each purpose advances one step of the Red thread in order, and the last Section lands the Learning goal. With Threads, tag each Slide `(A)` or `(B)`. The spine ends on the last Section's last Slide: the about-me Slide that closes every Episode comes from the template.
- **Research questions**: list every claim the spine makes that needs evidence, then propose one _why_ question per claim, scoped to a subject matter, one research job per item. Han adds, cuts or rewords. Then write each question's number after `_Research:_` on the Slides whose claims rest on it; a Slide of opinion names none.
- **Open ideas**: every logged candidate Han did not choose, plus anything else worth keeping for the feedback loop.

_Done when_ every required heading holds Han's choice. Where Han stops before that, write `Not settled.` under each heading still empty and name it as open, rather than presenting an unfinished Brief as finished.

### 4. Self-check

Run `npx mh query` on the Brief's path (in voice, read the `staging-brief` and `staging-brief-body` rules in `markdown-harness.config.yaml`), and judge every heading against its intent: its `Fail if` lines are the test. Put each fail to Han as a question while he is still here, and write down his answer verbatim: his answer is the only fix.

_Done when_ every intent passes or Han has answered its question.

## Writing the Brief (Claude Code)

1. Write the Brief to `docs/episodes/<slug>/brief.md`, where `<slug>` is the working title in kebab case, filled from the _Brief template_ (`status: draft`, and `generated` naming you and the current UTC time). Under `/new-episode`, write it in the Episode's worktree.
2. Run `npm run check:docs` and `npx vitest run tests/docs/episode-staging.test.ts` until both are clean, then append the machine entry `{ by: process:markdown-harness, at: <now UTC> }` to `verified` (a list; create it when the Brief has none). Rewriting the Brief later moves `generated.at` forward and re-opens the gate. `npx mh query docs/episodes/<slug>/brief.md` prints the intent of every field and heading.
3. Commit the checked Brief through the `commit` skill with the trailer `Gate: draft brief`, before Han edits it, so his edits stay visible as a diff.
4. Hand the Brief to Han. Only Han approves, by running `node .agents/skills/new-episode/scripts/approve.ts docs/episodes/<slug>/brief.md`, which appends his `verified` entry; that commit carries `Gate: approved brief`.

## Voice sessions

A Claude Desktop voice session follows the channel rules of `grilling-voice.md` in every phase: one question at a time, nothing advances until "let's move on", acknowledgement only while Han thinks aloud, glossary terms used silently. Frame replaces that guide's calibration batch. In Settle, speak the 2–3 candidates one heading at a time, and the spine one Section at a time.

A voice session hands over the **Brief file itself**: the template filled in as one markdown block, Han's wording verbatim, `status: draft`, `Not settled.` under any open heading, and as its first line `<!-- save as docs/episodes/<slug>/brief.md -->`. Han pastes it into Claude Code; a session with a project folder (Cowork) writes it to `.scratch/<slug>/handoff.md` instead. Either way `/new-episode` takes it from there: it checks the Brief and puts any fail to Han, so the hand-over needs no list of open questions and no next action.

## Brief template

Every heading, Style included, is required and stays in this order, except Threads, Constraints, Episode Design Reference and Open ideas, which are optional: delete any of them when it is empty. Actionables, Research questions and each Section under Slides are ordered lists; Constraints, Episode Design Reference and Open ideas are unordered lists; Analogy is prose or an unordered list; every other section is prose. A Slide is `**<title>** — <purpose>. _Visual:_ <idea>`, with `_Research:_ <n, m>` at the end when its claims rest on research, and `(A)` or `(B)` in front when the Brief has Threads; numbering runs on across Sections. The `staging-brief` and `staging-brief-body` rules in `markdown-harness.config.yaml` govern the Brief, the staging test checks its Slides, and `npm run verify` checks this template against both.

```markdown
---
type: brief
title: The working title of the Episode
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-10-13T09:00:00Z
---

# The working title of the Episode

## Format

Foundations, Teardown or Short, and the planned length in minutes.

## Audience

Who watches, and what they already know and want.

## Style

One line naming a style from `docs/design/design-guide.md`, and the audience reason for it.

## Learning goal

What the viewer can do or explain after the Episode, in one or two sentences.

## Actionables

1. One concrete step a viewer takes afterwards.
2. Another step, one per item.

## Hook

The opening that earns the first thirty seconds.

## Red thread

The single line of argument from the hook to the learning goal.

## Threads

### A thread

The first storyline, usually the mechanism or argument.

### B thread

The second storyline, told in turns with the A thread.

## Analogy

One everyday picture the Episode returns to.

## Constraints

- A story rule every Slide obeys.

## Slides

### The first Section

1. (A) **The first Slide's title** — what it does for the Red thread. _Visual:_ what the viewer sees. _Research:_ 1
2. (B) **The second Slide's title** — what it does for the Red thread. _Visual:_ what the viewer sees.

### The second Section

3. (A) **The third Slide's title** — what it does for the Red thread. _Visual:_ what the viewer sees. _Research:_ 2

## Research questions

1. Why does one claim the Episode makes hold, scoped to a subject matter?
2. Why does another claim hold, one research job per question?

## Episode Design Reference

- [A sales deck](reference/sales-deck/design-reference.md)

## Open ideas

- An idea the grill did not settle, kept for the feedback loop.
```
