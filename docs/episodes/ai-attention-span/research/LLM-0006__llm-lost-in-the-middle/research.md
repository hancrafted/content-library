---
type: research
title: 'Why do language models attend most to the start and end of a long context?'
description: 'Models attend most to the start and end because causal masking
  favours early tokens and distance decay favours recent ones, leaving the
  middle weakest.'
confidence: contested
confidence_reason: 'The Answer itself says the strength of the effect is disputed among the Sources.'
informs: [llm-behaviour, context-engineering]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-20T19:17:16Z
stale_after: 2027-04-20T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2307.03172
    title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts'
  - id: 2
    resource: https://arxiv.org/abs/2309.17453
    title: 'Xiao et al., Efficient Streaming Language Models with Attention Sinks'
  - id: 3
    resource: https://arxiv.org/abs/2502.01951
    title: 'Wu et al., On the Emergence of Position Bias in Transformers'
  - id: 4
    resource: https://arxiv.org/abs/2406.16008
    title: 'Hsieh et al., Found in the Middle: Calibrating Positional Attention Bias
      Improves Long Context Utilization'
  - id: 5
    resource: https://arxiv.org/abs/2508.07479
    title: 'Veseli et al., Positional Biases Shift as Inputs Approach Context Window
      Limits'
---

# Why do language models attend most to the start and end of a long context?

## Context

Asked to support the claim that a long chat gives a model's attention an uneven shape: the first and the most recent messages are used best and the middle worst. The question is about the mechanism inside the model, not about how people remember.

## Answer

Two built-in position effects pull in opposite directions: causal masking makes early tokens accumulate attention across layers, and relative position encodings make nearby tokens count more. Together they favour the start and the end and leave the middle weakest, a pattern measured as "lost in the middle". The effect is disputed in its strength: it is strongest when the input fills up to about half the context window, and at longer inputs the start advantage fades while the recency advantage stays. The explanation by these two forces is the authors' account of controlled models, not a proof for every commercial model.

## Findings

1. Models use relevant information best when it sits at the beginning or end of the input and worst in the middle, even models built for long contexts [1].
2. The first few tokens of an input draw strong attention scores as an "attention sink" even when they are not semantically important, and removing them from a model's memory of the text breaks it [2].
3. Causal masking inherently biases attention toward earlier positions, because tokens in deeper layers attend to increasingly contextualised representations of earlier tokens [3].
4. Relative position encodings such as RoPE introduce distance-based decay, which favours nearby tokens; stacked across layers, this trades off against the accumulating importance of early positions [3].
5. Measured attention itself has a U-shape toward the start and end of the input, whether or not those tokens are relevant, and calibrating it out improves retrieval from the middle [4].
6. Counter-evidence: the lost-in-the-middle effect peaks when inputs occupy up to 50% of a model's context window; beyond that the primacy bias weakens, recency stays stable, and performance improves the nearer the information is to the end [5]. Earlier long-context studies had not reliably reproduced the effect [5].

## Caveats

Finding 3 and 4 come from a theoretical analysis with controlled experiments; the paper's abstract does not itself say that the two forces produce the U-shape, so that link is an inference [3]. The studies measure retrieval of a planted fact, not instruction following in a multi-turn chat, and none tests current commercial chat products, so applying them to a chat is an inference. The sources report positions in tokens, and exact strength varies by model.

[1]: <https://arxiv.org/abs/2307.03172> "Liu et al., Lost in the Middle: How Language Models Use Long Contexts"
[2]: <https://arxiv.org/abs/2309.17453> "Xiao et al., Efficient Streaming Language Models with Attention Sinks"
[3]: <https://arxiv.org/abs/2502.01951> "Wu et al., On the Emergence of Position Bias in Transformers"
[4]: <https://arxiv.org/abs/2406.16008> "Hsieh et al., Found in the Middle: Calibrating Positional Attention Bias Improves Long Context Utilization"
[5]: <https://arxiv.org/abs/2508.07479> "Veseli et al., Positional Biases Shift as Inputs Approach Context Window Limits"
