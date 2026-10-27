---
type: research
title: 'Why does permission to answer "unknown" reduce made-up answers?'
description: 'An explicit "I don''t know" option removes the pressure to guess, but in prompt-only tests it helps only modestly and mostly turns wrong answers into refusals.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-27T23:22:19Z
stale_after: 2027-10-27T00:00:00Z
sources:
  - id: 1
    resource: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
    title: 'Anthropic, Reduce hallucinations'
  - id: 2
    resource: https://arxiv.org/abs/2509.04664
    title: 'Kalai et al., Why Language Models Hallucinate'
  - id: 3
    resource: https://arxiv.org/abs/2604.03904
    title: 'I-CALM: Incentivizing Confidence-Aware Abstention for LLM Hallucination Mitigation'
  - id: 4
    resource: https://arxiv.org/abs/2606.00919
    title: 'Towards Lightweight Reliability: Using Soft Prompts for Hallucination Mitigation in Large Language Models'
  - id: 5
    resource: https://arxiv.org/abs/2506.09038
    title: 'Kirichenko et al., AbstentionBench: Reasoning LLMs Fail on Unanswerable Questions'
  - id: 6
    resource: https://arxiv.org/abs/2311.09677
    title: 'Zhang et al., R-Tuning: Instructing Large Language Models to Say "I Don''t Know"'
  - id: 7
    resource: https://ai.google.dev/gemini-api/docs/prompting-strategies
    title: 'Google, Gemini API prompt design strategies'
  - id: 8
    resource: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide
    title: 'OpenAI, GPT-5 prompting guide'
---

# Why does permission to answer "unknown" reduce made-up answers?

## Context

Asked to back a prompt-authoring check: every prompt explicitly allows "I don't know" or "not found" and asks the AI to mark unconfirmed facts instead of filling gaps. Prompts are pasted by non-technical people into consumer chats. Why models guess in the first place is covered in [LLM-0004](../LLM-0004__llm-confidence-on-vague-prompts/research.md). This note asks only whether a permission written in the prompt works, and how well.

## Answer

The permission works because models are trained and scored in a way that rewards a guess over a blank, so a prompt that names "I don't know" as an acceptable answer gives the model a safe option it otherwise lacks. Vendor guidance recommends it. The measured effect of the instruction alone is smaller than the guidance suggests. In prompt-only tests it lowers the share of wrong answers mainly by turning them into refusals, it does not make the model more accurate when it must answer, and it can hide correct answers too. It helps more when the prompt also asks the model to state its confidence or to cite what supports each claim. The "why" holds as a mechanism but not as a strong guarantee, so the check should ask for the permission plus a marker for unconfirmed facts, and treat both as risk reduction.

## Findings

1. Anthropic tells prompt authors to explicitly give Claude permission to admit uncertainty and says this can drastically reduce false information. Its examples name the exact reply to give ("I don't have enough information to confidently assess this", "No relevant quotes found") and add a step to retract any claim without a supporting quote. It also says these techniques do not eliminate hallucinations [1]. The "drastically" is a vendor claim; the page gives no measurement.
2. Google's prompting guide has no general "allow uncertainty" advice. Its only instruction of this kind is a sample system prompt for a strictly grounded assistant: if the answer is not in the supplied context, state that the information is not available [7]. OpenAI's GPT-5 guide has no "allow I don't know" advice either; it tells agents to use tools and not to guess or make up an answer, and in some prompts to keep going under uncertainty [8].
3. Training and evaluation reward guessing over acknowledging uncertainty. Under binary grading, an "I don't know" scores zero and a lucky guess can score one, so abstaining is never the best move for a model optimised on such benchmarks [2]. This is the reason a stated option can matter. It is a statistical argument, not a measurement of any prompt.
4. The same paper proposes stating a confidence target in the task itself, for example answer only if more than t confident, with a mistake costing t/(1-t) points and "I don't know" scoring 0 [2]. This is a proposal for how benchmarks should be written. The paper does not test it as a way for ordinary users to prompt chat assistants. Its own introductory example shows a model still guessing after an instruction to answer only if it knew [2].
5. A prompt-only study on GPT-5 mini (PopQA) found that telling the model how answers and abstentions would be scored lowered the false-answer rate among answered questions from 52.3% to 41.0%, while coverage fell from 96.5% to 67.9%. Adding short norms on humility and truthfulness took it to 34.2% with coverage 55.3%. Accuracy when forced to answer stayed about the same, so the gain is selective answering, not more knowledge [3].
6. In the same study, a reward framing without confidence elicitation cut coverage to 29.8% and made the model refuse nearly half the questions it answered correctly under the full scheme. Confidence elicitation alone gave 86.0% coverage but a 48.7% false-answer rate. Effects varied across five models and three datasets [3].
7. A plain instruction, "Reply 'I don't know' if you don't know the answer", gave mixed results on two base models (Gemma-3-12b-pt, Llama 3.1-8B) over five datasets. Several changes were within a few points, some were worse (hallucination on Gemma rose from 67.74% to 69.59% on TruthfulQA and from 62.00% to 66.67% on MedHallu), and the largest gain (Llama on MedHallu, 67.33% down to 47.33%) came with abstentions rising from 10.67% to 37.33% [4]. The authors say such prompts often reduce hallucination at the cost of lower factual recall or more abstention, and are sensitive to wording [4].
8. AbstentionBench tested 20 frontier models on unanswerable, underspecified and false-premise questions. A carefully written system prompt can boost abstention without a significant drop in abstention precision, but it is unlikely to fix the models' inability to reason about uncertainty. Reasoning fine-tuning lowered abstention by 24% on average [5]. The text I read gave no numbers for the prompt effect.
9. Training-time methods work on a different level. R-Tuning fine-tunes a model on refusal-aware data so it declines questions outside its knowledge, and the authors report it generalises as a meta-skill [6]. This is not something a person pasting a prompt into a chat can do. It shows the behaviour can be learned, not that a prompt achieves the same result.

## Caveats

No study found tests consumer chat apps (ChatGPT free, Gemini, Claude) with prompts written by non-technical people. Findings 5 and 7 use short factual question sets, not the document-based tasks such prompts usually carry; Anthropic's examples (finding 1) are of the latter kind but unmeasured. Finding 7 uses base models, which differ from chat-tuned assistants. Sources 3 and 4 are recent preprints I did not see peer-reviewed. For source 5 I read only the abstract-level claims and the system-prompt section, not its appendix with the prompt text and numbers. For sources 2 and 3 the page text was cut off after about the first 100,000 characters, so later sections were not read. For source 6 I read the abstract only. A "mark unconfirmed facts" step (finding 1) is vendor advice and I found no measurement of it in consumer use. I could not read OpenAI's "Why language models hallucinate" blog post (access refused); the claims from it come from the paper [2]. I did not read the full text of Wen et al., "Know Your Limits: A Survey of Abstention in LLMs" (arXiv 2407.18418), only its abstract, so it is not cited.

[1]: https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations 'Anthropic, Reduce hallucinations'
[2]: https://arxiv.org/abs/2509.04664 'Kalai et al., Why Language Models Hallucinate'
[3]: https://arxiv.org/abs/2604.03904 'I-CALM: Incentivizing Confidence-Aware Abstention for LLM Hallucination Mitigation'
[4]: https://arxiv.org/abs/2606.00919 'Towards Lightweight Reliability: Using Soft Prompts for Hallucination Mitigation in Large Language Models'
[5]: https://arxiv.org/abs/2506.09038 'Kirichenko et al., AbstentionBench: Reasoning LLMs Fail on Unanswerable Questions'
[6]: https://arxiv.org/abs/2311.09677 'Zhang et al., R-Tuning: Instructing Large Language Models to Say I Do Not Know'
[7]: https://ai.google.dev/gemini-api/docs/prompting-strategies 'Google, Gemini API prompt design strategies'
[8]: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide 'OpenAI, GPT-5 prompting guide'
