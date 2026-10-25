---
type: research
title: 'Why does a language model''s output quality drop as its context window fills?'
description: 'Output quality drops as the window fills because length itself
  degrades results, even with perfect retrieval, and each token must share a
  finite attention budget with more tokens.'
confidence: settled
informs: [llm-behaviour, context-engineering]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-20T19:22:02Z
stale_after: 2027-04-20T00:00:00Z
sources:
  - id: 1
    resource: docs/llm-wiki/research/AIE/AIE-0011__fresh-context-beats-long-chat/research.md
    title: 'content-library research, Why does a fresh, focused context outperform a
      long, accumulated chat?'
  - id: 2
    resource: https://arxiv.org/abs/2404.06654
    title: 'Hsieh et al., RULER: What''s the Real Context Size of Your Long-Context
      Language Models?'
  - id: 3
    resource: https://arxiv.org/abs/2402.14848
    title: 'Levy, Jacoby, Goldberg, Same Task, More Tokens: the Impact of Input
      Length on the Reasoning Performance of Large Language Models'
  - id: 4
    resource: https://arxiv.org/abs/2502.05167
    title: 'Modarressi et al., NoLiMa: Long-Context Evaluation Beyond Literal
      Matching'
  - id: 5
    resource: https://arxiv.org/abs/2510.05381
    title: 'Du et al., Context Length Alone Hurts LLM Performance Despite Perfect
      Retrieval'
  - id: 6
    resource: https://www.trychroma.com/research/context-rot
    title: 'Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts
      LLM Performance'
  - id: 7
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic, Effective context engineering for AI agents'
---

# Why does a language model's output quality drop as its context window fills?

## Context

Asked to support the claim that a long chat produces worse answers than a short one, and that the window is a limited resource to manage. The claim concerns how much text the model holds at once, not which position in the window a fact sits at, so the question is scoped to the effect of filling the window.

## Answer

Output quality falls as the window fills, well before the advertised maximum: across benchmarks of retrieval, reasoning, math and coding, almost all models lose substantial accuracy as input grows [2][3][4][5]. Length itself is a cause: the drop persists with perfect retrieval and with irrelevant tokens masked out [5], and irrelevant material makes it worse [1][6]. The vendor explanation is an "attention budget": every token attends to every other, so each added token spreads the same attention thinner [7]. That mechanism is a vendor account of the measured effect, not itself measured in these studies.

## Findings

1. On RULER, a benchmark with 13 tasks, almost all of 17 long-context models showed large performance drops as context length increased; although all claimed 32K tokens or more, only half kept satisfactory performance at 32K [2].
2. Reasoning degrades at lengths far below the technical maximum: with the question held constant and only padding varied, accuracy dropped on every dataset version [3].
3. When the needle shares no words with the question, 11 of 13 models advertised at 128K or more fell below half of their short-input score at 32K; GPT-4o fell from 99.3% to 69.7%. The authors attribute this to attention struggling to find relevant content in long contexts [4].
4. Length alone hurts: with perfect retrieval, performance still dropped by 13.9% to 85% as input grew, within advertised limits, and the drop persisted when irrelevant tokens were replaced by whitespace or masked from attention [5].
5. Having the model recite the retrieved evidence before solving, which turns a long task into a short one, improved results (GPT-4o on RULER by up to 4%) [5].
6. Chroma's test of 18 models found performance degrades with input length in every experiment, and even a single distractor lowers it relative to the needle alone [1][6].
7. Anthropic describes an "attention budget": every token attends to every other (n² pairwise relationships for n tokens), and recall from the context decreases as it grows; its remedy for long tasks includes sub-agents working with clean windows [1][7].

## Caveats

- Most studies use synthetic tasks, a planted fact or padded filler, not real multi-turn chats, and cover models of 2024 and 2025. Degradation size varies by model and task: 13.9% to 85% in one study [5].
- The Chroma report is a technical report, not peer reviewed [1][6]. The attention budget is Anthropic's explanatory framing, a vendor account without a measurement of its own [7]; NoLiMa's attribution to attention is the authors' reading [4].
- The studies do not measure a hallucination mechanism directly; that a model fills gaps itself when context is thin or long is an inference from the lost-accuracy results and from the multi-turn study summarised in [1].
- This file does not give a token count at which quality becomes unreliable; the onset differs per model and task.

[1]: <docs/llm-wiki/research/AIE/AIE-0011__fresh-context-beats-long-chat/research.md> "content-library research, Why does a fresh, focused context outperform a long, accumulated chat?"
[2]: <https://arxiv.org/abs/2404.06654> "Hsieh et al., RULER: What's the Real Context Size of Your Long-Context Language Models?"
[3]: <https://arxiv.org/abs/2402.14848> "Levy, Jacoby, Goldberg, Same Task, More Tokens: the Impact of Input Length on the Reasoning Performance of Large Language Models"
[4]: <https://arxiv.org/abs/2502.05167> "Modarressi et al., NoLiMa: Long-Context Evaluation Beyond Literal Matching"
[5]: <https://arxiv.org/abs/2510.05381> "Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval"
[6]: <https://www.trychroma.com/research/context-rot> "Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance"
[7]: <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents> "Anthropic, Effective context engineering for AI agents"
