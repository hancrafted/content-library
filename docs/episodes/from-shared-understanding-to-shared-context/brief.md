---
type: brief
title: From shared understanding to shared context
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-11T12:36:44Z
verified:
  - by: process:markdown-harness
    at: 2026-11-11T12:36:44Z
  - by: human:han
    at: 2026-11-11T12:46:49Z
---

# From shared understanding to shared context

## Format

Foundations, 20 to 30 minutes: the theory block of the Academy hands-on workshop.

## Audience

Tech-adjacent to non-technical Academy participants who use ChatGPT or Copilot day to day, know no engineering, and want reliable results on complex tasks.

## Style

Factory: a production line is a picture non-technical people already know from everyday life.

## Learning goal

Tell static from dynamic context, spot when context goes bad, and use an AI interview to build high-signal context.

## Actionables

1. Before your next complex task, let the AI interview you in rounds of questions, then turn the result into a spec.
2. Move that result into a fresh chat instead of continuing the long one.

## Hook

AI doesn't produce the correct swing, but it can build the wrong one ten times faster.

## Red thread

AI makes every station faster, so what you hand the agent decides the result: context engineering is requirements engineering for agents, and an AI interview builds that context for you.

## Analogy

The factory line, with documents moving between work centres, and one bike assembly bench as the station where static and dynamic context land.

## Constraints

- Keep the factory shallow: everyday production-line knowledge, no manufacturing jargon.
- Every technical term gets an everyday picture first.
- Context engineering stays about what the human manages, never how the AI works inside.

## Slides

### A thought experiment

1. **What the customer really wanted** — carries the Hook: the tire swing cartoon turns into a factory line in balance, constant input, output and high quality, if this was how your organization worked; then cranked dials mimic a real organization where bottlenecks form. _Visual:_ the factory Explorable (work centres, transfer belts, storages, queues, a document icon as the unit, dials for efficiency, effectiveness and multiplication) in three states: cartoon, balanced line, messy reality.
2. **What happens with AI** — AI accelerates every station and brings the whole organization out of balance, as the market shows right now. _Visual:_ the same Explorable with the AI dial up, documents piling up at the bottlenecks. _Research:_ 1
3. **Speed the whole line can carry** — a sustainable increase in overall productivity, not one fast station; the bridge into requirements engineering. _Visual:_ the line running at a higher speed, still balanced.

### Every product is a translation

4. **Value was always translation** — every effort to create value, whether a product, a service or a lecture, translates human intent into something that solves the actual problem. _Visual:_ a person's speech bubble on one end, a box, a handshake and a lectern on the other. _Research:_ 2
5. **Defining and building** — every effort splits into defining and building; AI speeds up building and can assist defining, which foreshadows meta prompting. _Visual:_ the line split into a defining half and a building half, AI on each, and a small speech bubble on the defining half: "as long as AI can't read our minds." _Research:_ 2
6. **Precision and accuracy** — precision: someone else could execute without a single question; accuracy: the result matches the intent and solves the actual problem. _Visual:_ the four classic dartboards, then the same four as documents arriving at the bike bench. _Research:_ 2

### Context is the requirement

7. **What the AI actually sees** — the callback to how context works, from the context window Episode. _Visual:_ the Context window Explorable.
8. **Context engineering is requirements engineering for agents** — the definition: what you add to the context window decides whether the agent has the precision and accuracy to work towards. _Visual:_ the dartboard beside a context window, the same four outcomes. _Research:_ 3
9. **Static and dynamic context** — static is memory files, system prompts and the initial prompt; dynamic is what the agent pulls in through retrieval, web search or your project folder. _Visual:_ the bike bench, what is set up before the shift beside what arrives during it.
10. **You run the bench** — the human manages what goes into the context window and steers the agent in the right direction. _Visual:_ a person at the bench sorting what lands on it, the AI worker beside them.
11. **Context rot** — IBM's four failure modes, poisoning, distraction, confusion and clash, translated for a non-technical audience. _Visual:_ the bike bench as a two-by-four grid; static: wrong screw size on the instruction sheet, a binder of every bike model, fifty near-identical wrenches, old and new sheets both pinned up; dynamic: a mislabelled box of screws, colleagues dropping by with questions, ten crates of similar parts, "rush it" against "check every piece". _Research:_ 4
12. **Keeping the bench clean** — validate, compact, curate and prune. _Visual:_ the same bench, each fix clearing one mess. _Research:_ 4

### Creating context for agents

13. **Meta prompting** — creating precise, accurate context without rot feels like a lot of work, but a separate session can have the AI create the high-signal context for you. _Visual:_ a planning office beside the line, handing one clean work order to the bench. _Research:_ 5
14. **Grill-me** — Matt Pocock's skill, why it works, and what the next 30 minutes practise on a use case before AI turns the session into a spec. _Visual:_ a chat asking a round of questions at a time, ending in a spec document. _Research:_ 5
15. **BRIEF** — the callback to the freelancer Episode: Break it down, Requirements first, Interview with AI, Evaluate each step, Fresh chat, mapped onto what we are doing today. _Visual:_ the five letters, each mapped to today's session.

## Research questions

1. Why does speeding up one station with AI move the bottleneck elsewhere in an organisation?
2. Why does requirements engineering decide the outcome more than execution does?
3. Why does context engineering for agents work like requirements engineering?
4. Why does more context make models worse: context rot and IBM's four failure modes, building on [Context Engineering for AI Agents: 4 Failure Modes to Avoid](https://www.youtube.com/watch?v=BwXremQ-i6I)?
5. Why does letting an AI interview you in rounds of questions produce better requirements than writing the prompt yourself?

## Open ideas

- Factory is not yet a named style in `docs/design/design-guide.md`; add it before the staging check passes. It also mirrors the AI software factory idea.
- "High-signal context" follows Anthropic's "smallest set of high-signal tokens" ([Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)); "dense context" is not an established term.
- A requirements layer in the factory Explorable, shown on the section slide or as a Slide at the end of the thought experiment.
- "An art, not a science" goes into the Voice script of the requirements Section, not onto a Slide.
- Third learning-goal candidate: AI works in a non-deterministic space, so onboard it with all the information a colleague or freelancer would need; could become a Slide's purpose (You run the bench or BRIEF).
- Everyday backups for the four failure modes: a wrong fact in a recipe, a long meeting that forgets the decision, a junk drawer of keys, two bosses with opposite instructions.
- BRIEF as its own Explorable later.
- Threads declined; the Audi Excel story was the B thread candidate.
- Hook alternatives: "If AI makes every team ten times faster, why does the customer still get the wrong swing?" and "Everyone here has lived this cartoon. Now give every station AI."
