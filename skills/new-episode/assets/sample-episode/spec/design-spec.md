---
type: design-spec
title: The context window is a budget
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-10-12T12:30:00Z
locale: en
brief: ../brief.md
---

# The context window is a budget

## Visual language

The window is always a horizontal bar, filled left to right with message blocks. No motion: the bar's fill carries the point. The accent marks the instruction block wherever it sits.

## Why the agent forgets {#why-the-agent-forgets}

### Every token is spent attention {#every-token-is-spent-attention}

Keeps `basic-page`, motion none. A Scene from `SlideFrame` and the kit's `<Title>`: one bar of message blocks in `--color-card`, the newest block in `--color-accent`.

```text
[ Title                                   ]
[ ■■■■■■■■■■■■■■■■■■■■■■■■■■■□□□ ]
  messages ...                 newest
```

### The middle goes quiet first {#the-middle-goes-quiet-first}

The Slide library entry `three-column` used as is: start, middle, end of the window, the middle column at `--color-muted-foreground`.

## Spend the budget on purpose {#spend-the-budget-on-purpose}

### Start fresh when the task changes {#start-fresh-when-the-task-changes}

Keeps `basic-page`, motion none. Two bars side by side, the old one full and the new one empty, labelled by i18n keys `old` and `fresh`.

```text
[ ■■■■■■■■■■■■■■ ]   [ □□□□□□□□□□□□□□ ]
   old session          fresh session
```

### Cut what you paste {#cut-what-you-paste}

Keeps `basic-page`, motion none. A long log block beside its ten kept lines, the kept lines in `--color-accent`.

```text
[ log ............ ]  ->  [ 10 lines ]
```
