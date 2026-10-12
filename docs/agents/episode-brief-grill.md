---
type: agent-guide
---

# Episode Brief grill

How to run the Brief grill: a creative dialogue with Han that ends in a governed **Brief** for a new Episode. Claude Code and a Claude Desktop voice session both follow this guide, and both end with the same Brief, the one in [the template](#brief-template).

## When this applies

Only when Han starts a new Episode: "new episode", "Brief grill", or an Episode idea he wants to grill. This guide sits in the Claude Desktop project context, so it loads into every conversation there; it is inert otherwise.

The Brief grill overrides the `grilling` skill's design tree and [`grilling-format.md`](grilling-format.md)'s classification: every element of a Brief is Han's creative decision, so nothing is decided without asking. In voice, the channel rules of [`grilling-voice.md`](grilling-voice.md) still hold in every phase (see [Voice sessions](#voice-sessions)).

## The time-box

Han sets the session length at the start. Note the start time, and switch to [Settle](#3-settle) about 10 minutes before the end, or the moment Han says **"settle"**, whichever comes first. Say the switch aloud: "ten minutes left, settling now." In Claude Code, read the clock with `date`. Where no clock is readable, ask Han once to say "settle" when he wants to stop exploring.

## The phases

### 1. Frame

Settle the frame before any creative work, so Explore does not drift towards the wrong audience. Ask for what the opening prompt left out:

1. **Session length**, for the time-box.
2. **Topic**: the idea in one line.
3. **Audience**: who watches, and what they already know and want. The English YouTube audience wants reach; German businesses want a reason to hire Han.
4. **Format or length**: Foundations, Teardown or Short, and the planned minutes. The length decides later whether the Episode gets Threads.

Done when you have read all four back in one sentence and Han has confirmed it.

### 2. Explore

A creative dialogue with no form. Propose ideas, push back, ask what would make a viewer stay, try angles Han has not mentioned. Leave the Brief's headings unspoken: walking them is Settle's job.

Keep a **candidates log** as private bookkeeping. Whenever a possible decision surfaces (a hook, an analogy, a Red thread, a learning goal, an actionable, a research question, a pair of Threads), log it as a candidate under the Brief heading it would fill, in Han's words where he said it. Log it and move on; a candidate is never put to Han as a decision in Explore. Read the log back only when Han asks.

Done when the time-box reaches its switch point or Han says "settle".

### 3. Settle

Work through the Brief's headings in template order, filling each from the candidates log first:

- **Format** and **Audience**: read back what Frame settled.
- **Creative elements** (Learning goal, Actionables, Hook, Red thread, Threads, Analogy): offer 2–3 candidates, each in one sentence, and recommend one with its reason. Draw them from the log; generate new ones only where the log has fewer than two. Han chooses or rewords; write down his wording verbatim, because his edits are what later teach agents his style.
- **Threads**: offer "no Threads" as one candidate for a Short. A longer Episode gets an A thread (the mechanism or argument) and a B thread (a story told in turns with it).
- **Research questions**: propose the list, each a _why_ question scoped to a subject matter, one research job per item. Han adds, cuts or rewords.
- **Open ideas**: every logged candidate Han did not choose, plus anything else worth keeping for the feedback loop.

Done when every required heading holds Han's choice. If time runs out first, write `Not settled.` under each heading still empty and name it as open, rather than presenting an unfinished Brief as finished.

## Writing the Brief (Claude Code)

1. Write the Brief to `docs/episodes/<slug>/brief.md`, where `<slug>` is the working title in kebab case, filled from [the template](#brief-template) with `status: draft`.
2. Run `npm run check:docs` until it is clean. `npx mh query docs/episodes/<slug>/brief.md` prints the intent of every field and heading.
3. Commit the draft through the `commit` skill with the trailer `Gate: draft brief`, before Han edits it, so his edits stay visible as a diff.
4. Hand the Brief to Han. Only Han sets `status: approved`; that commit carries `Gate: approved brief`.

## Voice sessions

A Claude Desktop voice session has no filesystem. It follows the channel rules of [`grilling-voice.md`](grilling-voice.md) in every phase: one question at a time, nothing advances until "let's move on", acknowledgement only while Han thinks aloud, glossary terms used silently. Frame replaces that guide's calibration batch. In Settle, speak the 2–3 candidates one heading at a time.

A voice session ends in a **handoff**, not a file. Han pastes it into Claude Code, which saves it verbatim to `.scratch/<slug>/handoff.md` and turns it into `brief.md` by the steps in [Writing the Brief](#writing-the-brief-claude-code). The handoff holds three parts:

1. **The Brief**: the template filled in, as one markdown block, Han's wording verbatim.
2. **Open questions**: every heading still `Not settled.`, marked as open.
3. **The next action**: "Write this Brief to `docs/episodes/<slug>/brief.md` following `docs/agents/episode-brief-grill.md`."

## Brief template

Every heading is required and stays in this order, except Threads and Open ideas, which are optional: delete either when it is empty. Actionables and Research questions are ordered lists; every other section except Open ideas is prose. The `staging-brief` and `staging-brief-body` rules in `markdown-harness.config.yaml` govern the Brief, and `npm run verify` checks this template against them.

```markdown
---
type: brief
status: draft
---

# The working title of the Episode

## Format

Foundations, Teardown or Short, and the planned length in minutes.

## Audience

Who watches, and what they already know and want.

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

## Research questions

1. Why does one claim the Episode makes hold, scoped to a subject matter?
2. Why does another claim hold, one research job per question?

## Open ideas

- An idea the grill did not settle, kept for the feedback loop.
```
