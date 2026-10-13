---
type: research
title: 'Why does a language model''s recall of information degrade with its position in a long context?'
description: 'Language models recall information at the start and end of a long context better than in the middle, because attention is biased by position.'
question: "Why does a language model's recall of an instruction degrade with its position in a long context?"
generated:
  by: claude-code/opus-5.5
  at: 2026-10-12T00:00:00Z
stale_after: 2027-10-12T00:00:00Z
sources:
  - id: liu-lost-in-the-middle
    resource: https://arxiv.org/abs/2307.03172
    title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts'
  - id: hsieh-found-in-the-middle
    resource: https://arxiv.org/abs/2406.16008
    title: 'Hsieh et al., Found in the Middle: Calibrating Positional Attention Bias Improves Long Context Utilization'
---

# Why does a language model's recall of information degrade with its position in a long context?

## Context

Asked to support the claim that a long chat session buries an early instruction. The claim is about where information sits in the context window, not about how long the window is, so the question is scoped to position.

## Answer

Recall is U-shaped over position: models use information at the start and the end of a long context best, and information in the middle worst. The effect holds for models with long context windows too. It comes from a positional bias in attention, which favours the first and last tokens regardless of their relevance.

## Findings

1. On multi-document question answering, accuracy is highest when the relevant document is first or last, and lowest when it is in the middle of the input [^liu-lost-in-the-middle].
2. The same U-shape appears on synthetic key-value retrieval, so it is not specific to natural-language documents [^liu-lost-in-the-middle].
3. Extended-context models show the U-shape as well; a longer window does not by itself make the middle reliable [^liu-lost-in-the-middle].
4. Attention weights show an intrinsic U-shaped bias toward the start and end of the input, and calibrating that bias out improves use of mid-context information [^hsieh-found-in-the-middle].

## Caveats

Both studies measure retrieval of a planted fact, not instruction following over a multi-turn session. Applying them to a forgotten instruction is an inference.

[^liu-lost-in-the-middle]: Liu et al., Lost in the Middle: How Language Models Use Long Contexts, https://arxiv.org/abs/2307.03172
[^hsieh-found-in-the-middle]: Hsieh et al., Found in the Middle: Calibrating Positional Attention Bias Improves Long Context Utilization, https://arxiv.org/abs/2406.16008
