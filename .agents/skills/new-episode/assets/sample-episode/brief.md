---
type: brief
title: The context window is a budget
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-10-12T09:00:00Z
verified:
  - by: process:markdown-harness
    at: 2026-10-12T09:05:00Z
  - by: human:han
    at: 2026-10-12T09:30:00Z
---

# The context window is a budget

## Format

Short, about eight minutes: two Sections of two Slides each, recorded in one take.

## Audience

Developers who use a coding agent every day and have watched it forget an instruction halfway through a long session.

## Style

Editorial: developers read code-heavy Slides fast, and sober, self-explanatory ones keep their attention on the one idea.

## Learning goal

The viewer can explain why an agent forgets in a long session and decide what to put into its context and what to leave out.

## Actionables

1. Start a new session when the task changes, instead of steering an old one.
2. Move standing instructions into a file the agent reads at start, and delete them from the chat.
3. Before pasting a log or a file, cut it to the lines the task needs.

## Hook

You told the agent once, clearly, and an hour later it does the opposite. It did not ignore you. It ran out of room.

## Red thread

Every token costs attention, so the viewer's job is budgeting: what earns a place in the window, and what is waste that crowds out the instruction that mattered.

## Threads

### A thread

The mechanism: how a fixed window fills, and why the oldest and the middle lose out.

### B thread

The story of one afternoon session that drifts, told in turns with the mechanism until the viewer can predict each failure before it happens.

## Analogy

A household budget: rent is the system prompt, groceries are the task, and every pasted log is an impulse buy that leaves less for the rent.

## Research questions

1. Why does a language model's recall of an instruction degrade with its position in a long context?
2. Why does starting a fresh session restore instruction following that a long session lost?

## Open ideas

- Show a token counter filling up on screen while the B thread plays.
- A closing callback to the household budget: the month ends, and so does the session.
