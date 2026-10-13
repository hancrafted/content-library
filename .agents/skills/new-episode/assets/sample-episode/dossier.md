---
type: dossier
status: draft
locale: en
brief: ./brief.md
---

# The context window is a budget {#context-window-budget}

## Why the agent forgets {#why-the-agent-forgets}

#### Voice script

1. **Not a bug** — Forgetting is not a bug in one agent. It is what a fixed budget does when you keep spending.

### Every token is spent attention {#every-token-is-spent-attention}

#### Visual

master: basic-page · motion: liquid-ink-transition

A window drawn as a bar that fills with blocks, one per message, while the share left for the newest answer shrinks.

#### Speaker notes

1. **Attention sums to one** — a softmax normalises each token's attention weights over the window, so every token added dilutes the share of the rest [1].
   - sources: [1] Attention Is All You Need — https://arxiv.org/abs/1706.03762
2. **The window has a size** — a model's context window is a fixed maximum number of tokens it can reference at once [2].
   - sources: [2] Context windows — https://docs.claude.com/en/docs/build-with-claude/context-windows
   - target: the bar in the visual

#### Voice script

1. **Whole window, every turn** — A model reads its whole window on every turn. Each line you add takes a share of the attention the next answer gets.
2. **Not seen, but how much** — So the question is never whether the agent saw your instruction. It is how much attention was left for it.

### The middle goes quiet first {#the-middle-goes-quiet-first}

#### Visual

master: three-column · motion: liquid-ink-transition

#### Speaker notes

1. **A longer window does not help** — extended-context models show the same drop in the middle; size alone does not make it reliable [1].
   - sources: [1] Lost in the Middle — https://arxiv.org/abs/2307.03172

#### Voice script

1. **Start and end, not the middle** — Models recall the start and the end of a long window better than the middle. Your instruction from an hour ago now sits in the middle.

## Spend the budget on purpose {#spend-the-budget-on-purpose}

#### Voice script

1. **Three cheap habits** — Once the window is a budget, three habits follow, and each one is cheap.

### Start fresh when the task changes {#start-fresh-when-the-task-changes}

#### Visual

master: basic-page · motion: liquid-ink-transition

#### Speaker notes

1. **The start is weighted most** — attention carries a built-in bias toward the start of the input, so a fresh session puts the new task where it counts most [1].
   - sources: [1] Found in the Middle — https://arxiv.org/abs/2406.16008

#### Voice script

1. **Rent on the past** — A new task in an old session pays rent on everything that came before. A fresh session spends the whole budget on the work in front of you.

### Cut what you paste {#cut-what-you-paste}

#### Visual

master: basic-page · motion: liquid-ink-transition

#### Speaker notes

1. **Why the file works** — text read at the start of a session sits where recall is strongest, so standing instructions there survive a long session [1].
   - sources: [1] Lost in the Middle — https://arxiv.org/abs/2307.03172

#### Voice script

1. **Impulse buy** — A full log is an impulse buy. Paste the ten lines that matter, and keep standing instructions in a file the agent reads at start.

#### Production note

The counter overlay from the Brief's open ideas would sit on this Slide if it is built.

## Material left out

The quadratic cost of attention is true but does not serve the learning goal, so it stays here and out of the Voice script.
