---
type: brief
title: Why AI has a weird attention span you must learn to manage
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-10-20T20:56:53Z
verified:
  - by: process:markdown-harness
    at: 2026-10-20T15:27:48Z
  - by: process:markdown-harness
    at: 2026-10-20T19:01:52Z
  - by: human:han
    at: 2026-10-20T19:01:53Z
  - by: process:markdown-harness
    at: 2026-10-20T20:56:53Z
  - by: human:han
    at: 2026-10-20T21:10:33Z
---

# Why AI has a weird attention span you must learn to manage

## Format

Foundations. Aim for about 20 minutes, stay under 25, 30 as the hard cap. In the workshop it follows the hands-on of about 20 minutes, where everyone runs the prepared interview prompt on the summer party until they reach a plan, and explains what they just did. Slide 11 is the advanced option and stays in the YouTube cut, as the only Slide carrying Actionable 4.

## Audience

Anyone from the working world, tech or non-tech, from a receptionist to a developer; many have never worked with AI for long. Keep it light and grounded: the most technical it gets is the context window, how it fills up, how attention spreads across it, and why that leads to hallucination and context rot.

## Style

Chat: a modern messenger on a clean white stage, built from rounded chat bubbles and simple cards, with one bright accent colour as a stage light that picks out what matters while everything else fades to soft grey. It suits a mixed audience because everyone already reads a messenger, and the fade is the Episode's subject made visible.

## Learning goal

Understand that AI's attention span, its context window, is a limited resource you have to actively manage.

## Actionables

1. One chat, one job: when the topic changes, open a new chat.
2. After real progress, or before a coffee break, stop and ask for a handoff; read it and correct what's wrong.
3. Start the next chat with that handoff.
4. For bigger projects, break the task down first, even with AI's help, and keep one chat as the planner that hands each step to a fresh chat and takes the result back.

## Hook

The last long phone call with a close friend or relative: you called to settle one thing, drifted through many topics, and at the end remember how it started and the last few minutes, with the middle blurry except for a few highlights, and the one thing you called for never settled.

## Red thread

A long chat behaves like a long call, because its attention is a limited window, so you manage what goes into it.

## Analogy

The long phone call: primacy, recency, a blurry middle and standout highlights, the same pattern AI shows in a long chat. The sister returns as a voice line twice: she secretly recorded the call but can't find what you said at one hour, 13 minutes and 17 seconds (Slide 5), and she keeps only her own notes of the call (Slide 9).

## Constraints

- Standalone: never names PRICE or BRIEF; uses "break it down" and "fresh start" verbatim.
- The phone call story fits on one Slide, two to three minutes at most.
- "Workflow" appears for the first time on Slide 11.
- The bridge to the short `ai-gives-you-more-work` Episode (standing in for the promotion Episode for now) is spoken in the workshop only, never on a Slide.
- Attention values (for example 20 units to the start, 30 to the end, 50 spread across the middle) and token counts are illustrative, and every Slide showing them says so.
- A grounding comes before every mechanism: the viewer feels the problem before a term names it, so the smart and dumb zone appear only after the viewer has seen the middle fade.
- Slides 3, 4, 5, 7, 8, 9, 10 and 11 are states of one Explorable explanation, the context window cornerstone; each still tells its own story and reads top to bottom without touching a toggle.
- Questions to the room (who plans their own attention, their calendar) are spoken in the workshop only, so the YouTube cut works without an audience.

## Slides

### The long phone call

1. **The long phone call** — grounds the viewer in a personal experience of attention: the call that started with one purpose, drifted, and left only the start, the end and a few highlights. Introduces primacy, recency and the isolation effect. _Visual:_ the call as a transcript in chat bubbles with your sister, opening "Let's sort out the holidays!" and ending "Talk soon, bye!"; three steps: the middle fades while first and last stay lit, the dog-story bubble lights up, then the punchline "…wait, we never fixed the date." _Research:_ 1
2. **AI forgets the middle too** — maps the human effects to AI in a long chat, without naming the context window yet. _Visual:_ the sister thread and an AI thread side by side, with the same lighting, one effect at a time; bottom line "With your sister, a lost detail is funny. With a deadline, it's expensive." _Research:_ 1, 2

### The AI's attention span

3. **The context window** — the reveal: the mechanism behind the effects is the context window, a limit on the bundle the app resends every turn, filling message by message. Context engineering is giving the AI the right context at the right time. _Visual:_ the cornerstone in the Simple view on the default 200K window: chat on the left, one shared scroll bar in the middle, the context bar filling top to bottom on its right, the explanation panel beside it; bubbles and context parts light each other up. _Research:_ 4
4. **What happens when the bar fills up** — grounds the viewer again in the problem before any fix: as the chat grows, Slide 2's effects return one by one (the start stays sharp, the newest stays sharp, the middle blurs, one standout survives), then one new consequence: answers get worse and the budget gets forgotten. _Visual:_ the cornerstone with the Attention view, scrolled further; the attention bars flatten in the middle and the faded bubbles are marked "the AI may fill this gap itself". _Research:_ 2, 3
5. **Attention is a budget** — why the middle fades: a hundred units of attention, a big share to the start, a big share to the most recent messages, the rest spread ever thinner, with spikes where a detail keeps being referred to. Ends on the smart zone and the dumb zone. _Visual:_ the cornerstone paused on the Attention view: a horizontal bar chart of 100 units, labelled illustrative; the dog-story spike stays bright in the middle; a line marks where the middle gets too thin to trust, smart zone above, dumb zone below. Then the same chat side by side on the 200K and the 1M window: "Smart zone by Matt Pocock" at 80K on 200K and 150K on 1M, Han's own line at 300K on 1M only. _Research:_ 2, 3
6. **What we learned so far** — the recap: long AI conversations show the same effects as long human ones; the AI's attention span is its context window; treat it as a resource you actively manage, so important decisions and information don't get lost in the middle. _Visual:_ a small version of the phone-call transcript beside a small cornerstone bar, with one line under each, tying Slide 1 to Slides 3–5.

### What fills the window

7. **What's really in the window** — what you see in the chat is only part of it: starting instructions, memory, attached files, web pages read, results from tools and connectors, and system reminders, the app's hidden notes the chat never shows; only the starting instructions and memory are explained. _Visual:_ the cornerstone in the Technical view, the /context grid, the explanation panel on the starting instructions and the memory. _Research:_ 5
8. **One innocent question** — "which catering offer fits?" gets a one-line answer, but the whole 20-page catering PDF (about 55K) now sits in the window, far more than the two web searches before it. Voice: an intern given the same task would also read the whole file first; AI does it fast and you only see the result. _Visual:_ the cornerstone on the catering PDF read: the big jump, its bubble and its part lit together. _Research:_ 6
9. **You can't watch the meter** — consumer tools quietly squeeze older messages into summaries, so you rarely see how full the window is. Voice: your sister keeps only her notes of the call. _Visual:_ first version: the sister's notepad, a few scribbled lines in place of the whole call. Later stage: the cornerstone shows compaction: the fill enters the space kept free for summaries (16.5K, 8.3% of the 200K window), older blocks fold into one summary block, and the chat looks unchanged. _Research:_ 7

### Managing the attention span

10. **Everyday habits** — break it down and fresh start, as already known; one chat, one job; save a handoff after real progress or before a break, read and correct it, and start the next chat with it. _Visual:_ a cut-down cornerstone with two bars side by side: the full old chat, and a fresh, nearly empty one holding only the handoff card. _Research:_ 3
11. **The workflow for bigger projects** — the first use of "workflow": break the task down first, keep one chat as the planner, hand each step to a fresh chat and bring the result back; you coordinate like a project manager. _Visual:_ mini context bars: the planner's bar stays slim while each worker chat fills up and is thrown away. _Research:_ 3

## Research questions

1. Why do people remember the start, the end and the standout moments of a long conversation?
2. Why do language models attend most to the start and end of a long context?
3. Why does a model's output quality drop as its context window fills?
4. Why does a chat app resend the whole conversation with every request?
5. Why do chat assistants load saved memory at the start of a chat?
6. Why does a web search fill the context window with whole pages rather than just the answer?
7. Why do consumer chat apps summarise older messages without showing it?

## Episode Design Reference

- [Context window cornerstone: synced views](reference/context-window-cornerstone/design-reference.md)

## Open ideas

- Research candidates no Slide claims yet: when do chat assistants fetch past chats dynamically? Why does the total cost of a chat grow faster than its length?
- Smart zone numbers, on Slide 5 and in the voice track: Matt Pocock's smart zone is 80K on a 200K window and 150K on 1M; Han's own line is 300K, on the 1M window only.
- The attention halo, a toggleable glowing dot that follows the mouse while presenting, is its own Chrome feature and its own issue, outside this Episode.
- Slides 1 and 2 may reuse the cornerstone's chat bubbles.
- Rejected: the desk and the meeting-room whiteboard as analogies; click-reveals on the cornerstone ("this is not PowerPoint").
- Workshop prep: the prepared hands-on prompt makes the specification come out already split into about seven phases, so there is something to review without running it live.
- Workshop bridge, spoken only: you just managed one agent's attention; more productivity comes from zooming out to the whole workflow, which leads into the short `ai-gives-you-more-work` Episode, standing in for the promotion Episode for now.
- Section titles and the title of Slide 4 are Claude's proposals, accepted at gist level.
