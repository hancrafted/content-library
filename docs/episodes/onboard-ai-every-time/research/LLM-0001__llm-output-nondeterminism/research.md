---
type: research
title: 'Why do large language models give different answers to the same prompt?'
description: 'Models sample each next token from a probability distribution, and
  even with sampling switched off, server-side numerical effects still change
  the output between runs.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T14:02:52Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/1904.09751
    title: 'Holtzman et al., The Curious Case of Neural Text Degeneration'
  - id: 2
    resource: https://platform.claude.com/docs/en/api/messages
    title: 'Anthropic, Messages API reference (temperature parameter)'
  - id: 3
    resource: https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
    title: 'He et al., Defeating Nondeterminism in LLM Inference'
  - id: 4
    resource: https://arxiv.org/abs/2408.04667
    title: 'Atil et al., Non-Determinism of "Deterministic" LLM Settings'
---

# Why do large language models give different answers to the same prompt?

## Context

Asked to support the claim that repeating one request yields a different result each time, so a single answer is one draw rather than the answer. The question covers where the variation comes from, not how to reduce it.

## Answer

A language model does not look up one answer: it produces a probability for every possible next token and, by default, samples from that distribution, so two runs of the same prompt can diverge from the first differing token onward. Providers expose a randomness setting (temperature), but even at its lowest value the output is not guaranteed identical. Part of the remaining variation comes from the serving system: the numerical result of a request depends on how many other requests are processed alongside it. In measurements, this shifts both the wording and, on some tasks, the accuracy.

## Findings

1. Text produced by always choosing the single most likely continuation is bland and repetitive, so generation methods sample from the model's probability distribution instead, which varies the text between runs [1].
2. A provider's API documents temperature as the "amount of randomness injected into the response", with a default of 1.0 and a range of 0.0 to 1.0 [2].
3. The same documentation states that even with temperature 0.0, "the results will not be fully deterministic" [2].
4. Floating-point addition is not associative, so summing the same numbers in a different order can give a different result [3].
5. The cause of run-to-run variation at temperature 0 is not mainly concurrency within one request: a forward pass is repeatable by itself, but the computing kernels change their reduction order with batch size, so a request's numbers depend on the server's load, which the user cannot see or control [3].
6. In one test, 1,000 completions of one prompt at temperature 0 gave 80 unique completions, the first difference appearing at token 103 [3].
7. With batch-invariant kernels, the same test produced 1,000 identical completions, at a cost in serving speed [3].
8. Across five models set up for determinism and eight tasks run ten times each, accuracy varied by up to 15% between runs, and no model repeated its output exactly on every task [4].

## Caveats

Finding 6 and 7 come from one model and one prompt, run on an open-source serving stack; hosted providers' serving stacks are not documented in these sources, so applying the mechanism to them is an inference. The Anthropic page notes that newer models no longer accept a temperature setting, so the setting itself is not a lever for every model. The Answer's claim that serving effects shift accuracy rests on the benchmark study [4], which attributes the cause to input batching only as early feedback from insiders.

[1]: <https://arxiv.org/abs/1904.09751> "Holtzman et al., The Curious Case of Neural Text Degeneration"
[2]: <https://platform.claude.com/docs/en/api/messages> "Anthropic, Messages API reference (temperature parameter)"
[3]: <https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/> "He et al., Defeating Nondeterminism in LLM Inference"
[4]: <https://arxiv.org/abs/2408.04667> "Atil et al., Non-Determinism of \"Deterministic\" LLM Settings"
