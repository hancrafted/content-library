---
type: manuscript
status: draft
locale: en
brief: ./brief.md
---

# The context window is a budget {#context-window-budget}

You told the agent once, clearly, and an hour later it does the opposite. It did not ignore you. It ran out of room.

## Why the agent forgets {#why-the-agent-forgets}

Forgetting is not a bug in one agent. It is what a fixed budget does when you keep spending.

### Every token is spent attention {#every-token-is-spent-attention}

A model reads its whole window on every turn. Each line you add takes a share of the attention the next answer gets.

So the question is never whether the agent saw your instruction. It is how much attention was left for it.

### The middle goes quiet first {#the-middle-goes-quiet-first}

Models recall the start and the end of a long window better than the middle. Your instruction from an hour ago now sits in the middle.

## Spend the budget on purpose {#spend-the-budget-on-purpose}

Once the window is a budget, three habits follow, and each one is cheap.

### Start fresh when the task changes {#start-fresh-when-the-task-changes}

A new task in an old session pays rent on everything that came before. A fresh session spends the whole budget on the work in front of you.

### Cut what you paste {#cut-what-you-paste}

A full log is an impulse buy. Paste the ten lines that matter, and keep standing instructions in a file the agent reads at start.
