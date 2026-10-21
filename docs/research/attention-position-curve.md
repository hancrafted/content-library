# A plausible illustrative shape for the Attention distribution

Research date: 2026-10-21. Feeds the Attention part of the context cornerstone (Episode "AI attention span"). Not binding. Sources were fetched on the research date.

Question: how should the Attention part of the context cornerstone split its 100 units over the rows of the window, so the picture is more accurate than a flat or linear one? The units are illustrative, not measured (the Attention card says so), so the target is a shape a reader recognises from the research, not a fitted curve.

## What the primary sources say

- **Serial-position effect (human memory).** Recall is best for the last items (recency), somewhat elevated for the first few (primacy) and lowest in the middle. Murdock (1962), "The serial position effect of free recall", Journal of Experimental Psychology 64(5), measured the curve; Glanzer and Cunitz (1966) showed recency and primacy come apart under a delay. Summary used here: Wikipedia, "Serial-position effect" (https://en.wikipedia.org/wiki/Serial-position_effect), which cites both. The article gives no numbers: the shape is qualitative.
- **Lost in the Middle (language models).** Liu et al. (2023), "Lost in the Middle: How Language Models Use Long Contexts" (https://arxiv.org/abs/2307.03172): "performance is often highest when relevant information occurs at the beginning or end of the input context" and "significantly degrades when models must access relevant information in the middle", even for explicitly long-context models. A U shape in accuracy, not in attention weights.
- **Attention sinks.** Xiao et al. (2023), "Efficient Streaming Language Models with Attention Sinks" (https://arxiv.org/abs/2309.17453): models give unusually high attention to the first tokens "even if they are not semantically important"; keeping them recovers window-attention quality. Supports a strong start, whatever its content.

## Is the attention sink the very first position?

Research date: 2026-10-21 (batch 5). Yes for the first token or tokens, and it is a property of position, not of content or importance.

- Xiao et al. (2023), section 3.1 and Table 1 (https://arxiv.org/abs/2309.17453, full text at https://arxiv.org/html/2309.17453v4): the initial tokens receive strong attention "even if they are not semantically important". Replacing the first four tokens with the line-break token "\n" still recovers perplexity (5.60 against 5.40 with the original tokens, Llama-2-13B), so "the absolute position of the starting tokens, rather than their semantic value, holds greater significance". The stated reason is that early tokens are visible to every later token, so they are more easily trained as sinks. Four initial tokens suffice (Table 2: perplexity 3359.95 with none, 11.88 with one, 9.59 with four).
- Gu et al. (2024), "When Attention Sink Emerges in Language Models: An Empirical View" (https://arxiv.org/abs/2410.10781, abstract read): LMs "assign significant attention to the first token, even if it is not semantically important"; sinks exist universally, emerge during pre-training, behave like key biases that store extra attention scores that need not contribute to the value computation, and come from softmax normalisation (sigmoid attention without normalisation shows none up to 1B parameters). They also report the sink position is "highly correlated with the loss function and data distribution", so it is not guaranteed to be position 0 in every model. Only the abstract was read; the position-versus-content experiments are in the full paper.

What follows for a chat: the first tokens of the window, which are the system prompt or the first user prompt, soak up an outsized share of the raw attention mass, from the first token on, and that share does not decay into the next messages. Lost in the Middle (above) is a separate effect measured on accuracy: the first prompt's content is used better than the middle's (primacy). So the first prompt does not compete with the middle on equal terms: it has a sink (mass) and primacy (use) working for it.

Caveat, and it is the important one: the sink is token-level attention mass, mostly spent on a few leading tokens, not a measure of how important the first message is or how much the model "listens" to it. A big sink share is largely a parking place for attention that has nothing to attend to. The chart's units are illustrative; the very first row standing out is a nod to this, not a measurement.

## What it does not say

No source gives per-position percentages for a real model, and the two LLM papers measure task accuracy and attention to initial tokens, not a recency split over the last three messages. The numbers below are a design choice that matches the shape, not a finding.

## The defaults chosen

| Bucket | Rows               | Share | Why                                                                                                                                              |
| ------ | ------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| start  | first 3            | 20    | Primacy and the sink; inside the bucket the very first row is clearly highest, the next two flat (see below).                                    |
| recent | 4th to 10th newest | 20    | The shoulder of the recency side; falls off linearly inside it.                                                                                  |
| middle | the rest           | 25    | The trough: many rows share it, so per row it is thinnest. Seeded peaks keep "lost in the middle" a story of a few found rows, not a flat floor. |
| newest | last 3             | 35    | Recency is the stronger end in both memory and LLM results, so it takes the largest bucket.                                                      |

Inside the newest bucket the rows fall off by recency, 50 / 30 / 20 of the bucket (newest first), so the last message takes 17.5 units, the one before 10.5 and the third 7.0. Han asked for 50/30/20; the research gives the direction (the newest is strongest), not the numbers.

Inside the start bucket the weights are 50 / 25 / 25, oldest first: the first row (the sink) takes half the bucket, 10 units, and the next two 5 each. Each weight wanders by up to 15% either way through a random seeded from the ids, so the same chat always looks the same but two chats differ; the first row stays clearly highest.

Both are Preset fields: `attention.curve` (bucket totals, sum 100) and `attention.falloff`, with `falloff.start` (three weights, oldest first) and `falloff.newest` (three weights, newest first). The reader can still move the sliders or type shares in the Attention menu.
