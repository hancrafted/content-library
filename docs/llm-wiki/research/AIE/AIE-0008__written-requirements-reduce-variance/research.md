---
type: research
title: 'Why do explicit written requirements reduce the variation in LLM output?'
description: 'A stated requirement is met more steadily across prompts and model
  updates than a guessed one, but stating all at once can lower compliance and
  run noise remains.'
confidence: open
informs: [agentic-ai, llm-behaviour]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T14:05:29Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2505.13360
    title: "Yang, Shi, Ma, Liu, Kästner, Wu, What Prompts Don't Say: Understanding
      and Managing Underspecification in LLM Prompts (v3)"
  - id: 2
    resource: https://arxiv.org/abs/2310.11324
    title: 'Sclar, Choi, Tsvetkov, Suhr, Quantifying Language Models Sensitivity to
      Spurious Features in Prompt Design, ICLR 2024'
  - id: 3
    resource: https://arxiv.org/abs/2408.04667
    title: 'Atil et al., Non-Determinism of "Deterministic" LLM Settings'
  - id: 4
    resource: https://arxiv.org/abs/2505.06120
    title: 'Laban, Hayashi, Zhou, Neville, LLMs Get Lost In Multi-Turn Conversation'
  - id: 5
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices, section "Be clear and direct"'
  - id: 6
    resource: docs/llm-wiki/research/AIE/AIE-0004__context-and-brief-improve-ai-output/research.md
    title: 'Why does richer context and a clearer brief measurably improve AI
      output? (earlier research file)'
---

# Why do explicit written requirements reduce the variation in LLM output?

## Context

Asked to support the claim that writing requirements down before an AI starts makes its output more predictable, not only better on average. The question is about spread: how much results differ between prompts, between model versions and between runs. A neighbouring file covers whether a clearer brief raises quality [6].

## Answer

A requirement the prompt leaves unstated is something the model must guess. It often guesses right, but the guess is fragile, so how well that requirement is met swings with the wording of the prompt and with each model update. Stating the requirement makes it more than 2x steadier across prompt variations and roughly halves the share that regress badly after a model update [1]. The effect has limits: listing every requirement at once can lower compliance on individual ones [1], and run-to-run randomness persists even for identical, fully specified prompts [3].

## Findings

1. Across prompts that each state a different subset of 20 requirements, the standard deviation of how often a requirement was met was 8.9% when it was unspecified, more than 2x its value when specified; with requirement conflicts controlled, 7.9% against 0.8% [1].
2. Across model updates (three gpt-4o snapshots, three Llama-3 versions), 5.9% of unspecified requirements regressed by more than 20%, almost 2x the rate for specified requirements; one gpt-4o update made skimmable output 48% less likely [1].
3. Models often guess an unstated requirement correctly (41.1% of unspecified requirements reached at least 98% accuracy), but unspecified requirements scored 22.6% lower on average, with drops up to 93.1%. Format requirements were guessed most often (70.7%) and conditional ones least often (22.9%) [1].
4. Stating all requirements together is not free: one requirement stated alone was followed 98.7% of the time, while with all 19 stated gpt-4o fell to 85.0% and Llama-3.3-70B to 79.7%. The authors attribute part of this to conflicts between requirements and part to imperfect instruction following [1].
5. Wording alone moves results widely: formatting changes that leave a prompt's meaning intact produced differences of up to 76 accuracy points on LLaMA-2-13B, and the sensitivity persisted with larger models, more few-shot examples and instruction tuning [2]. A prompt that pins down format and requirements removes some of these free choices; this study varies format, not requirement text.
6. Instructions revealed piece by piece rather than fully specified cost models 39% of performance on average over six generation tasks; the authors split that into a minor loss in aptitude and a significant increase in unreliability [4].
7. Randomness is separate from underspecification: five LLMs configured to be deterministic still varied by up to 15% in accuracy across ten naturally occurring runs of the same task, and none gave repeatable accuracy on all tasks [3].
8. Anthropic's guidance says "the more precisely you explain what you want, the better the result" and advises asking explicitly for the behaviour wanted instead of relying on inference from a vague prompt. It is guidance, not a measured effect on variance [5].

## Caveats

- Findings 1 to 4 come from one study, a preprint revised to v3, on three main tasks and three models (Llama-3.3-70B, gpt-4o, o3-mini) with LLM validators; no Claude model was tested. The size of the effects will differ for other models [1].
- The study measures variation across prompt versions and model updates, not across repeated runs of one prompt. The claim that written requirements reduce run-to-run variation is not shown by these sources; [3] suggests that variation is largely independent of the prompt.
- The 76-point spread [2] and the 15% run variation [3] are measured on older or open models and benchmark tasks, and [3] reports no per-model detail on its abstract page.
- [4] uses simulated users and measures multi-turn underspecification, not a person writing a requirements document.
- Finding 8 is vendor guidance. No source here measures variance reduction for a human-written requirements list in everyday work; extending the findings to it is an inference.

[1]: https://arxiv.org/abs/2505.13360 "Yang, Shi, Ma, Liu, Kästner, Wu, What Prompts Don't Say: Understanding and Managing Underspecification in LLM Prompts (v3)"
[2]: https://arxiv.org/abs/2310.11324 'Sclar, Choi, Tsvetkov, Suhr, Quantifying Language Models Sensitivity to Spurious Features in Prompt Design, ICLR 2024'
[3]: https://arxiv.org/abs/2408.04667 'Atil et al., Non-Determinism of "Deterministic" LLM Settings'
[4]: https://arxiv.org/abs/2505.06120 'Laban, Hayashi, Zhou, Neville, LLMs Get Lost In Multi-Turn Conversation'
[5]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices 'Anthropic, Prompting best practices, section "Be clear and direct"'
[6]: docs/llm-wiki/research/AIE/AIE-0004__context-and-brief-improve-ai-output/research.md 'Why does richer context and a clearer brief measurably improve AI output? (earlier research file)'
