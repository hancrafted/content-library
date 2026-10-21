# A plausible illustrative shape for the Attention distribution

Research date: 2026-10-21. Feeds the Attention part of the context cornerstone (Episode "AI attention span"). Not binding. Sources were fetched on the research date.

Question: how should the Attention part of the context cornerstone split its 100 units over the rows of the window, so the picture is more accurate than a flat or linear one? The units are illustrative, not measured (the Attention card says so), so the target is a shape a reader recognises from the research, not a fitted curve.

## What the primary sources say

- **Serial-position effect (human memory).** Recall is best for the last items (recency), somewhat elevated for the first few (primacy) and lowest in the middle. Murdock (1962), "The serial position effect of free recall", Journal of Experimental Psychology 64(5), measured the curve; Glanzer and Cunitz (1966) showed recency and primacy come apart under a delay. Summary used here: Wikipedia, "Serial-position effect" (https://en.wikipedia.org/wiki/Serial-position_effect), which cites both. The article gives no numbers: the shape is qualitative.
- **Lost in the Middle (language models).** Liu et al. (2023), "Lost in the Middle: How Language Models Use Long Contexts" (https://arxiv.org/abs/2307.03172): "performance is often highest when relevant information occurs at the beginning or end of the input context" and "significantly degrades when models must access relevant information in the middle", even for explicitly long-context models. A U shape in accuracy, not in attention weights.
- **Attention sinks.** Xiao et al. (2023), "Efficient Streaming Language Models with Attention Sinks" (https://arxiv.org/abs/2309.17453): models give unusually high attention to the first tokens "even if they are not semantically important"; keeping them recovers window-attention quality. Supports a strong start, whatever its content.

## What it does not say

No source gives per-position percentages for a real model, and the two LLM papers measure task accuracy and attention to initial tokens, not a recency split over the last three messages. The numbers below are a design choice that matches the shape, not a finding.

## The defaults chosen

| Bucket | Rows               | Share | Why                                                                                                                                              |
| ------ | ------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| start  | first 3            | 20    | Primacy and the sink; equal inside the bucket (Han's call).                                                                                      |
| recent | 4th to 10th newest | 20    | The shoulder of the recency side; falls off linearly inside it.                                                                                  |
| middle | the rest           | 25    | The trough: many rows share it, so per row it is thinnest. Seeded peaks keep "lost in the middle" a story of a few found rows, not a flat floor. |
| newest | last 3             | 35    | Recency is the stronger end in both memory and LLM results, so it takes the largest bucket.                                                      |

Inside the newest bucket the rows fall off by recency, 50 / 30 / 20 of the bucket (newest first), so the last message takes 17.5 units, the one before 10.5 and the third 7.0. Han asked for 50/30/20; the research gives the direction (the newest is strongest), not the numbers.

Both are Preset fields: `attention.curve` (bucket totals, sum 100) and `attention.falloff` (the newest bucket's three weights, newest first). The reader can still move the sliders or type shares in the Attention menu.
