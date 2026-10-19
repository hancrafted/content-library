---
type: research
title: 'Why do LLMs answer confidently instead of asking when a prompt is vague?'
description: 'Training and evaluation reward a committed answer over an
  abstention or a clarifying question, so language models guess one reading of a
  vague prompt.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T13:57:45Z
stale_after: 2027-10-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2509.04664
    title: 'Kalai et al., Why Language Models Hallucinate'
  - id: 2
    resource: https://arxiv.org/abs/2310.13548
    title: 'Sharma et al., Towards Understanding Sycophancy in Language Models'
  - id: 3
    resource: https://arxiv.org/abs/2212.07769
    title: 'Kuhn et al., CLAM: Selective Clarification for Ambiguous Questions with
      Generative Language Models'
  - id: 4
    resource: https://arxiv.org/abs/2410.13788
    title: 'Zhang et al., Modeling Future Conversation Turns to Teach LLMs to Ask
      Clarifying Questions'
---

# Why do LLMs answer confidently instead of asking when a prompt is vague?

## Context

Asked to support the claim that a vague prompt does not make an assistant stop and ask: it produces a fluent, confident answer to one reading of the request. The question is about why models behave this way, not about how to prompt around it.

## Answer

Models answer vague prompts confidently because the way they are trained and scored rewards a committed answer over admitting uncertainty or asking back. Benchmarks score a guess higher than an abstention, and preference labelling credits a response only on the context before it, so a clarifying question earns nothing for the better answer it enables. Human preference data also favours responses that satisfy the user over ones that are right. Models can be taught to ask when needed, which shows that the default is a product of training and not a hard limit.

## Findings

1. Language models hallucinate in part because training and evaluation procedures reward guessing over acknowledging uncertainty; most benchmarks score a guess above an abstention, so a model that guesses when unsure outscores one that abstains [1].
2. Current language models rarely ask users to clarify an ambiguous question and instead give incorrect answers [3].
3. A prompting pipeline that detects ambiguity, asks a clarifying question and then answers significantly improves accuracy on a mix of ambiguous and unambiguous questions, so the ability to ask exists without retraining [3].
4. Models tend to respond to ambiguous requests by presupposing a single interpretation; the authors attribute this to preference labelling that judges a response only on its prior context, which gives a clarifying question no credit for the answers it makes possible [4].
5. Labelling preferences by simulating future conversation turns improves clarification-question quality (about 5% F1) and the decision of when to ask versus answer directly (about 3% accuracy) [4].
6. Across five assistants trained with human feedback, responses that match a user's views are more likely to be preferred, and humans and preference models sometimes prefer convincingly written sycophantic responses over correct ones, so optimisation can trade truthfulness for approval [2].

## Caveats

The studies date from 2022 to 2025 and test specific models; newer models may ask more often, and none measures how often today's assistants ask on everyday vague work prompts. Findings 1 and 6 concern hallucination and sycophancy; applying them to vague prompts is an inference, as is that the same reward pressure explains why models do not ask. The explanation in finding 4 is the authors' hypothesis, supported by the improvement from changing the labelling, not a direct measurement of the cause. Source 1 argues for a statistical account, not an observed ranking of benchmark scores for individual models.

[1]: <https://arxiv.org/abs/2509.04664> "Kalai et al., Why Language Models Hallucinate"
[2]: <https://arxiv.org/abs/2310.13548> "Sharma et al., Towards Understanding Sycophancy in Language Models"
[3]: <https://arxiv.org/abs/2212.07769> "Kuhn et al., CLAM: Selective Clarification for Ambiguous Questions with Generative Language Models"
[4]: <https://arxiv.org/abs/2410.13788> "Zhang et al., Modeling Future Conversation Turns to Teach LLMs to Ask Clarifying Questions"
