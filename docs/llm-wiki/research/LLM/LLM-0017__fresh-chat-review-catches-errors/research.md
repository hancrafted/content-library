---
type: research
title: 'Why does a fresh chat catch errors the chat that wrote the answer misses?'
description: 'A review in the chat that wrote the answer leans toward approving
  it; a fresh chat drops that context, but the gain over one self-review is thin.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-27T23:24:04Z
stale_after: 2027-10-27T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2310.01798
    title: 'Huang et al., Large Language Models Cannot Self-Correct Reasoning Yet'
  - id: 2
    resource: https://arxiv.org/abs/2406.01297
    title: 'Kamoi et al., When Can LLMs Actually Correct Their Own Mistakes? A
      Critical Survey of Self-Correction of LLMs'
  - id: 3
    resource: https://arxiv.org/abs/2404.13076
    title: 'Panickssery, Bowman, Feng, LLM Evaluators Recognize and Favor Their Own
      Generations'
  - id: 4
    resource: https://arxiv.org/abs/2603.04582
    title: 'Khullar et al., Self-Attribution Bias: When AI Monitors Go Easy on
      Themselves'
  - id: 5
    resource: https://arxiv.org/abs/2603.12123
    title: 'Song, Cross-Context Review: Improving LLM Output Quality by Separating
      Production and Review Sessions'
  - id: 6
    resource: https://arxiv.org/abs/2303.17651
    title: 'Madaan et al., Self-Refine: Iterative Refinement with Self-Feedback'
  - id: 7
    resource: https://code.claude.com/docs/en/best-practices
    title: 'Anthropic, Best practices for Claude Code'
  - id: 8
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices'
---

# Why does a fresh chat catch errors the chat that wrote the answer misses?

## Context

Asked to back a check in a prompt-authoring skill: a job's result is reviewed by a separate review prompt, pasted into a new chat that sees only the result and the goal. The question is why the new chat should do better than the chat that wrote the result. It separates two things: the same model with a fresh context, and a different model. Related notes: [AIE-0010](../../AIE/AIE-0010__checking-intermediate-steps/research.md) on checking intermediate steps and [AIE-0011](../../AIE/AIE-0011__fresh-context-beats-long-chat/research.md) on fresh context over a long chat.

## Answer

The evidence supports a narrow version of the claim. A model that judges an answer inside the conversation that produced it tends to approve it, and showing the same answer in a new chat as something to check removes that pull, even with the same model. One study of 11 models found monitors missed more bad actions right after the turn that produced them than in a fresh context, and one study found a second review in the same session worse than a review in a fresh session. The older self-correction studies show why the same chat is a weak reviewer: without outside feedback, a model asked to re-check its own answer does not improve it and sometimes makes it worse. But none of the sources tests the exact setup of a fresh chat of the same model against one plain self-review on everyday work, and the one study that did found the difference was not established. Whether a different model catches more is not measured by any source read here; the self-preference results suggest it could, but they are not a test of it.

## Findings

1. In intrinsic self-correction, where a model re-checks its own answer with no external feedback, Huang et al. found that performance did not improve and often fell. The re-check prompt ("Review your previous answer and find problems with your answer") ran inside the same conversation as the answer [1].
2. The mechanism Huang et al. give: after self-correction on GSM8K, GPT-3.5 kept its answer 74.7% of the time, and among the rest was more likely to change a correct answer to a wrong one than the reverse. They write that "LLMs cannot properly judge the correctness of their reasoning" [1].
3. The improvements reported by earlier self-correction papers came from oracle labels, which are not available in real use. Huang et al. also show that one prior gain came from an initial prompt that left out a requirement the feedback prompt then supplied [1].
4. Kamoi et al., a survey, conclude that no major work shows successful self-correction using feedback from the model prompting itself under fair settings in general tasks. The exception is tasks where checking is much easier than producing, such as verifying each item in a list. Self-correction works where reliable external feedback exists [2].
5. Kamoi et al. state that the idea that recognising errors is easier than avoiding them holds "only true for certain tasks whose verification is exceptionally easy" [2].
6. Neither [1] nor [2] tests a fresh chat. Both study a model correcting its own answer in context. They show the same-chat reviewer is weak, not that a fresh chat is strong.
7. Models recognise their own text and favour it. On two news-summary tasks, GPT-3.5, GPT-4 and Llama 2 scored their own summaries higher than others' and than human-written ones, and all three picked out their own output above chance. GPT-4 was 73.5% accurate at telling its summary from two other models and a human. The strength of the preference rose in step with self-recognition when the authors fine-tuned it [3].
8. Position in the conversation matters, not only authorship. Khullar et al. tested 11 models on four coding and tool-use datasets. Monitors flagged risky or wrong actions less often when the action sat in the same or the previous assistant turn than when the same action was given in a user turn in a new context. Telling the monitor that the action was its own "does not by itself induce self-attribution bias" [4].
9. Size of that effect in one test: AUROC for telling passing from failing code patches was 0.99 in the fresh user-turn baseline, 0.89 for same-turn and 0.92 for previous-turn. In one setting, a self-attributed monitor was five times more likely to approve a patch with an injected instruction. More reasoning budget gave no consistent reduction [4].
10. The only direct test of a fresh review session of the same model is a single-author preprint using Claude Opus 4.6 for both writing and reviewing. On 30 artifacts with 150 seeded errors, a fresh-session review scored an F1 of 28.6% against 21.7% for a second review in the same session (significant). Against one review in the same session (27.1%) the difference was not significant. The author writes that whether a fresh session beats one self-review "is not established" [5].
11. The author of [5] explains the gain as anchoring: the production history in the context "does not scrutinize; it rationalizes". A fresh session has "no prior decisions to anchor to". He labels this a hypothesis and did not measure sycophancy or self-preference directly. A second same-session pass lowered precision (21.0% against 26.2%), which he reads as added noise [5].
12. Self-Refine is the counterpoint: one model drafts, critiques and revises in a loop, and across 7 tasks with GPT-3.5, ChatGPT and GPT-4, humans and metrics preferred its output, with about 20% absolute gain on average [6]. Huang et al. and Kamoi et al. attribute such gains in part to weak initial prompts and to tasks with an easy check [1][2]. The abstract of [6] does not report a test against a fresh chat.
13. Anthropic's Claude Code guidance says "a second session is also the easiest independent reviewer you can get": one session writes, another reviews "without having watched it being written". It says "a fresh reviewer does help, because it hasn't seen your reasoning" [7]. This is vendor advice, given without a measurement. It also warns that "a reviewer that's asked to find problems will always find _something_", so the review prompt should state what to skip [7].
14. Anthropic's prompting guide names generate, review against criteria, then refine as the most common chaining pattern, with each step a separate call. Its stated reason is that you can log, evaluate or branch at any step, not that a separate call is less biased [8].

## Caveats

The two direct tests are young and narrow. Finding 10 is one author, one model, seeded errors, a heuristic matcher, and a version 2 that withdrew its earlier claims of advantage over a single self-review; its same-session reviews also ran in a different language than the fresh ones, a confound the author lists. Finding 8 and 9 are from a preprint with simple datasets and few-turn settings, and the AUROC figures are given inconsistently in the paper's text and a figure caption. The older studies in 1 to 6 used 2023 models and reasoning tasks, and not a fresh chat.

"Same model, fresh context" and "different model" are not the same test. A fresh chat of the same model removes the conversation but keeps the model's habits, including its taste for its own style (finding 7); no source read here compares a fresh same-model chat with another model. Which model a person's second chat uses is also their free choice in a consumer app, so the skill cannot assume either. No source tests a fresh chat reviewing the work of non-technical users on everyday tasks, or a review prompt that states a goal and a result only. A fresh chat also lacks the context that made the work correct, so it may flag choices that were intended.

[1]: https://arxiv.org/abs/2310.01798 'Huang et al., Large Language Models Cannot Self-Correct Reasoning Yet'
[2]: https://arxiv.org/abs/2406.01297 'Kamoi et al., When Can LLMs Actually Correct Their Own Mistakes? A Critical Survey of Self-Correction of LLMs'
[3]: https://arxiv.org/abs/2404.13076 'Panickssery, Bowman, Feng, LLM Evaluators Recognize and Favor Their Own Generations'
[4]: https://arxiv.org/abs/2603.04582 'Khullar et al., Self-Attribution Bias: When AI Monitors Go Easy on Themselves'
[5]: https://arxiv.org/abs/2603.12123 'Song, Cross-Context Review: Improving LLM Output Quality by Separating Production and Review Sessions'
[6]: https://arxiv.org/abs/2303.17651 'Madaan et al., Self-Refine: Iterative Refinement with Self-Feedback'
[7]: https://code.claude.com/docs/en/best-practices 'Anthropic, Best practices for Claude Code'
[8]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices 'Anthropic, Prompting best practices'
