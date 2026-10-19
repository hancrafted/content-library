---
type: research
title: 'Why do language models, unlike earlier machines and tools, produce
  non-deterministic results?'
description: 'Language models sample each next word from a probability
  distribution, and even with sampling off, serving infrastructure varies the
  arithmetic, so the same prompt can give different results.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-10-19T18:22:08Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/1904.09751
    title: 'Holtzman et al., The Curious Case of Neural Text Degeneration'
  - id: 2
    resource: https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
    title: 'He and Thinking Machines Lab, Defeating Nondeterminism in LLM Inference'
  - id: 3
    resource: https://arxiv.org/abs/2408.04667
    title: 'Atil et al., LLM Stability: A detailed analysis with some surprises'
  - id: 4
    resource: https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter
    title: 'OpenAI, How to make your completions outputs consistent with the new
      seed parameter'
verified:
  - by: process:markdown-harness
    at: 2026-10-19T18:22:08Z
---

# Why do language models, unlike earlier machines and tools, produce non-deterministic results?

## Context

Asked to support the claim that a language model, unlike a plough, a steam engine or a calculator, may answer the same input differently each time, so its output has to be reviewed rather than trusted. The claim concerns where the variation comes from, not how large it is on a given task.

## Answer

A language model does not compute one fixed answer: it produces a probability distribution over the next token and the system samples from it, so variety is part of the design. Even when sampling is switched off (temperature zero), hosted models still vary, because the numerical result of a request depends on how many other requests share the server at that moment. The practical consequence is that the same prompt can yield different wording and, on some tasks, measurably different accuracy, and providers state that determinism is not guaranteed.

## Findings

1. Choosing the single most likely token at every step yields text that is "bland and strangely repetitive"; sampling from the distribution while cutting off its unreliable tail (nucleus sampling) gives more human-like text, so generation is built around sampling [1].
2. The decoding method alone, with the same model, "can dramatically effect the quality of machine text" [1].
3. Floating-point addition is not associative, so adding the same numbers in a different order can give a different result [2].
4. The popular explanation that parallel GPU threads finish in random order is "not entirely wrong" but not the cause: repeating the same matrix multiplication gives bitwise identical results, and an LLM forward pass involves no operations that need atomic adds [2].
5. The actual cause is a lack of batch invariance: kernels change their reduction strategy with batch size, so one request's numerics depend on the server load, which a user cannot see or control. The effect is not unique to GPUs [2].
6. In one experiment, 1,000 temperature-zero completions of the same prompt on Qwen3-235B produced 80 distinct outputs, first diverging at token 103; with batch-invariant kernels all 1,000 were identical [2].
7. Across five LLMs and eight tasks, run ten times each with settings meant to be deterministic, accuracy varied by up to 15% between runs, and "none of the LLMs consistently delivers repeatable accuracy across all tasks, much less identical output strings" [3].
8. OpenAI's `seed` parameter only makes "a best effort to sample deterministically"; its documentation says "Determinism is not guaranteed", and a `system_fingerprint` field signals backend changes that can alter outputs [4].

## Caveats

Finding 6 is a demonstration by the vendor of the fix, on one open model; it shows the mechanism, not the rate for any particular hosted service. Source [3] reports that industry insiders suggested shared input buffers as the cause, which the authors did not verify; source [2] gives a tested explanation instead. Source [4] describes one provider's beta-era feature. The Answer's claim that the effect is absent from earlier machines is an inference from contrast, not a finding any source tests. The Anthropic Messages API reference was not readable for its `temperature` wording, so no Claude-specific statement is made.

[1]: <https://arxiv.org/abs/1904.09751> "Holtzman et al., The Curious Case of Neural Text Degeneration"
[2]: <https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/> "He and Thinking Machines Lab, Defeating Nondeterminism in LLM Inference"
[3]: <https://arxiv.org/abs/2408.04667> "Atil et al., LLM Stability: A detailed analysis with some surprises"
[4]: <https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter> "OpenAI, How to make your completions outputs consistent with the new seed parameter"
