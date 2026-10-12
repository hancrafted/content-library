---
type: dossier
status: draft
locale: en
brief: ./brief.md
---

# The context window is a budget {#context-window-budget}

The Episode argues from mechanism to habit: first why the agent forgets, then the three habits that keep the budget for the instruction that matters.

## Why the agent forgets {#why-the-agent-forgets}

### Every token is spent attention {#every-token-is-spent-attention}

#### Visual

master: basic-page · motion: liquid-ink-transition

A window drawn as a bar that fills with blocks, one per message, while the share left for the newest answer shrinks.

#### Speaker notes

1. **Attention is shared** — every token in the window competes for the attention the next token gets [1].
   - sources: [1] Attention Is All You Need — https://arxiv.org/abs/1706.03762
2. **The window is fixed** — a model's context length is a hard limit set at training time [2].
   - sources: [2] Lost in the Middle — https://arxiv.org/abs/2307.03172
   - target: the bar in the visual

#### Segments

1. Whole window, every turn — read, share, attention
2. Not seen, but how much — attention left, instruction

### The middle goes quiet first {#the-middle-goes-quiet-first}

#### Visual

master: three-column · motion: liquid-ink-transition

#### Speaker notes

1. **Recall is U-shaped** — models answer best from the start and the end of a long context and worst from the middle [1].
   - sources: [1] Lost in the Middle — https://arxiv.org/abs/2307.03172

#### Segments

1. Start and end, not the middle — U-shape, recall, an hour ago

## Spend the budget on purpose {#spend-the-budget-on-purpose}

### Start fresh when the task changes {#start-fresh-when-the-task-changes}

#### Visual

master: basic-page · motion: liquid-ink-transition

#### Speaker notes

1. **A fresh session resets the budget** — nothing from the old task competes for attention in the new one [1].
   - sources: [1] Lost in the Middle — https://arxiv.org/abs/2307.03172

#### Segments

1. Rent on the past — old session, fresh session, whole budget

### Cut what you paste {#cut-what-you-paste}

#### Visual

master: basic-page · motion: liquid-ink-transition

#### Speaker notes

1. **Standing instructions belong in a file** — a file read at start sits at the top of the window, where recall is strongest [1].
   - sources: [1] Lost in the Middle — https://arxiv.org/abs/2307.03172

#### Segments

1. Impulse buy — full log, ten lines, standing instructions

#### Production note

The counter overlay from the Brief's open ideas would sit on this Slide if it is built.

## Material left out

The quadratic cost of attention is true but does not serve the learning goal, so it stays here and out of the Manuscript.
