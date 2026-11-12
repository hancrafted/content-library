---
type: research
title: "Why does a language model's output get worse when its context holds
  distractors, contradictions or unclear instructions?"
description: 'Output gets worse when the context holds irrelevant, conflicting
  or underspecified material, not only when it is long, because early wrong
  assumptions persist.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-10T16:51:47Z
stale_after: 2027-10-12T00:00:00Z
sources:
  - id: 1
    resource: docs/episodes/ai-attention-span/research/LLM-0007__context-rot-as-window-fills/research.md
    title: "content-library research, Why does a language model's output quality
      drop as its context window fills?"
  - id: 2
    resource: https://arxiv.org/abs/2302.00093
    title: 'Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant
      Context'
  - id: 3
    resource: https://arxiv.org/abs/2404.10198
    title: "Wu, Wu, Zou, ClashEval: Quantifying the tug-of-war between an LLM's
      internal prior and external evidence"
  - id: 4
    resource: https://arxiv.org/abs/2401.14887
    title: 'Cuconasu et al., The Power of Noise: Redefining Retrieval for RAG Systems'
  - id: 5
    resource: https://arxiv.org/abs/2505.06120
    title: 'Laban et al., LLMs Get Lost In Multi-Turn Conversation'
---

# Why does a language model's output get worse when its context holds distractors, contradictions or unclear instructions?

## Context

Asked to support the claim that a muddy context, one cluttered with irrelevant, conflicting or underspecified material, degrades output beyond what length alone explains. The earlier file [1] covers the length effect; this one covers what the window holds.

## Answer

Output gets worse when the context holds material that does not help the task, in three measured ways. Irrelevant details sharply lower accuracy on tasks the model otherwise solves [2]. Content that contradicts what is right is often accepted over the model's own correct answer [3]. Instructions that arrive incomplete and piecemeal lower accuracy by 39% on average, because early wrong assumptions persist [5]. The picture of irrelevance is not uniform: in retrieval, plausible but off-topic passages hurt while random ones can help [4], so what matters is how much a passage resembles the answer, not only whether it is relevant. That a clear, complete requirement reduces these effects is an inference from [2] and [5], not a result any of them measures.

## Findings

1. On GSM-IC, grade-school math problems with unrelated information added, performance of leading prompting techniques dropped dramatically; instructing the model to disregard irrelevant details and self-consistency decoding reduced the loss [2].
2. In ClashEval, over 1,200 questions in six domains with retrieved content altered from subtle to blatant errors, six leading models abandoned their correct prior answer over 60% of the time to follow the faulty content; the further the content strayed from the truth, the less likely models were to accept it [3].
3. Models whose first answer had lower token probability were more likely to defer to the conflicting content, and the authors use that to propose simple techniques that improve accuracy under conflict [3].
4. In a retrieval study, the highest-scoring passages that did not contain the answer hurt accuracy, while adding random documents raised accuracy by up to 35% [4].
5. In over 200,000 simulated conversations across six generation tasks, every tested model did significantly worse when instructions arrived incomplete over several turns than when fully specified at once, with an average decline of 39% [5].
6. Most of that decline was a rise in unreliability, not a loss of aptitude; the authors report models make assumptions early, try final answers too soon and lean on those attempts, and "when LLMs take a wrong turn in a conversation, they get lost and do not recover" [5].
7. The earlier length findings show that irrelevant material and a single distractor lower accuracy further than length alone [1].

## Caveats

- The counter-evidence is Finding 4: random documents helped in one retrieval setting, so "more irrelevant text is always worse" is false [4]; the finding is specific to retrieval-augmented question answering and the authors call for more research.
- GSM-IC is an arithmetic benchmark from 2023 [2]; ClashEval alters facts in retrieved passages, which is not the same as a team's contradictory documents [3]; the multi-turn study is simulated, not real users [5].
- Sources [2], [3] and [4] study retrieval or single prompts, so applying them to a whole team's working context is an inference.
- None of the sources tests a clear requirement as an intervention; [2] tests an instruction to ignore irrelevant details, and [5] contrasts full with piecemeal specification.
- Findings concern models of 2023 to 2025; effect sizes differ by model and task.

[1]: docs/episodes/ai-attention-span/research/LLM-0007__context-rot-as-window-fills/research.md "content-library research, Why does a language model's output quality drop as its context window fills?"
[2]: https://arxiv.org/abs/2302.00093 'Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context'
[3]: https://arxiv.org/abs/2404.10198 "Wu, Wu, Zou, ClashEval: Quantifying the tug-of-war between an LLM's internal prior and external evidence"
[4]: https://arxiv.org/abs/2401.14887 'Cuconasu et al., The Power of Noise: Redefining Retrieval for RAG Systems'
[5]: https://arxiv.org/abs/2505.06120 'Laban et al., LLMs Get Lost In Multi-Turn Conversation'
