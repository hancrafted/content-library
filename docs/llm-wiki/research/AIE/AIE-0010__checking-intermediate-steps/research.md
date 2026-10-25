---
type: research
title: 'Why does checking intermediate steps catch errors that a review of only
  the final result misses?'
description: 'A correct-looking final answer can rest on flawed reasoning, so
  step-level checks find errors that final-result checks pass, though models
  cannot reliably find those errors in themselves.'
confidence: open
confidence_reason: 'The human-review claim is inferred from training studies.'
informs: [agentic-ai]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T14:09:05Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2305.20050
    title: "Lightman et al., Let's Verify Step by Step"
  - id: 2
    resource: https://arxiv.org/abs/2211.14275
    title: 'Uesato et al., Solving math word problems with process- and
      outcome-based feedback'
  - id: 3
    resource: https://arxiv.org/abs/2305.04388
    title: "Turpin, Michael, Perez, Bowman, Language Models Don't Always Say What
      They Think: Unfaithful Explanations in Chain-of-Thought Prompting"
  - id: 4
    resource: https://arxiv.org/abs/2310.01798
    title: 'Huang et al., Large Language Models Cannot Self-Correct Reasoning Yet'
  - id: 5
    resource: https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/AIE/AIE-0005__risks-of-unchecked-ai-output/research.md
    title: 'Earlier research file, Why does unchecked AI work carry real risk?
      (docs/llm-wiki/research/AIE/AIE-0005__risks-of-unchecked-ai-output/research.md)'
---

# Why does checking intermediate steps catch errors that a review of only the final result misses?

## Context

Asked to support the claim that reviewing each step of an AI's work finds errors that a look at the finished result lets through. The question is scoped to what step-level and result-level checking each detect in language-model reasoning, and to who can do the checking.

## Answer

A final result can be right or plausible while the reasoning under it is wrong, so a check on the result alone passes flawed work. Feedback on each reasoning step exposes those flaws: in math reasoning, step-level supervision outperformed result-level supervision, and it cut reasoning errors among correct final answers sharply. The model's own written explanation is not a safe substitute for a check, because it can misstate the real reason for an answer, and models asked to correct themselves without outside feedback do not reliably improve. The step check therefore needs an outside reader, a person or an independent verifier. The evidence comes from math and multiple-choice reasoning; applying it to everyday AI tasks is an inference.

## Findings

1. Outcome supervision gives feedback on a final result; process supervision gives feedback on each intermediate reasoning step. On the MATH dataset, "process supervision significantly outperforms outcome supervision", and the process-supervised model solved 78% of problems from a representative subset of the test set [1].
2. The authors motivate the comparison by noting that "even state-of-the-art models still regularly produce logical mistakes" [1].
3. Training on final-answer feedback alone gave similar final-answer error rates to process feedback with less labelling, yet getting the reasoning steps themselves right needed process-based supervision or a learned reward model that emulates it [2].
4. Among solutions whose final answer was correct, the best reported system cut reasoning errors from 14.0% to 3.4%, against 16.8% to 12.7% for final-answer error; so a checker that looks only at the answer leaves reasoning errors in the pile of answers it accepts [2].
5. A model's chain-of-thought explanation "can systematically misrepresent the true reason for a model's prediction". When prompts were biased toward a wrong answer, explanations never mentioned the bias and justified the wrong answer, and accuracy fell by up to 36% across 13 tasks with GPT-3.5 and Claude 1.0 [3].
6. For reasoning tasks, LLMs "struggle to self-correct their responses without external feedback", and "at times, their performance even degrades after self-correction" [4].
7. The earlier file records the cost of skipping a check: lawyers filed a brief with cases ChatGPT had invented, and the court held that rules "impose a gatekeeping role on attorneys to ensure the accuracy of their filings"; it also records that a short checklist of checks reduced complications among skilled surgeons [5].

## Caveats

- Sources [1] and [2] study training models with step labels on math word problems, not a person reviewing an AI's work. That a person checking steps catches errors that a final-result review misses is an inference from the finding that step-level signal detects errors the result-level signal does not.
- The figures in finding 4 are the abstract's comparison with previous best results, not a split between process and outcome methods; the abstract of [2] gives no per-method numbers. The abstract of [1] gives no figure for outcome supervision, so the size of the gap was not verified here.
- Findings 5 and 6 rest on 2022 to 2023 models and on abstracts; current models may behave differently. [4] scopes its claim to correction without external feedback and does not say that feedback from a person or a verifier fails.
- Finding 7 is evidence about unchecked output and about checklists in surgery, not about step-level review of AI reasoning; it shows the stakes, not the mechanism.

[1]: https://arxiv.org/abs/2305.20050 "Lightman et al., Let's Verify Step by Step"
[2]: https://arxiv.org/abs/2211.14275 'Uesato et al., Solving math word problems with process- and outcome-based feedback'
[3]: https://arxiv.org/abs/2305.04388 "Turpin, Michael, Perez, Bowman, Language Models Don't Always Say What They Think: Unfaithful Explanations in Chain-of-Thought Prompting"
[4]: https://arxiv.org/abs/2310.01798 'Huang et al., Large Language Models Cannot Self-Correct Reasoning Yet'
[5]: https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/AIE/AIE-0005__risks-of-unchecked-ai-output/research.md 'Earlier research file, Why does unchecked AI work carry real risk? (docs/llm-wiki/research/AIE/AIE-0005__risks-of-unchecked-ai-output/research.md)'
