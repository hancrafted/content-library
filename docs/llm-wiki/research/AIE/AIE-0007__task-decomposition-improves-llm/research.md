---
type: research
title: 'Why does decomposing a complex task into smaller subtasks improve LLM
  results?'
description: 'Models often solve each sub-problem yet fail to compose them, and
  decomposing into simpler, separately prompted subtasks closes much of that
  gap.'
confidence: contested
confidence_reason: 'The gain holds on tasks with a known decomposition, and a Source shows its limit.'
informs: [agentic-ai]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T14:06:06Z
stale_after: 2027-10-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2205.10625
    title: 'Zhou et al., Least-to-Most Prompting Enables Complex Reasoning in Large
      Language Models'
  - id: 2
    resource: https://arxiv.org/abs/2210.02406
    title: 'Khot et al., Decomposed Prompting: A Modular Approach for Solving
      Complex Tasks'
  - id: 3
    resource: https://arxiv.org/abs/2210.03350
    title: 'Press et al., Measuring and Narrowing the Compositionality Gap in
      Language Models'
  - id: 4
    resource: https://arxiv.org/abs/2305.18654
    title: 'Dziri et al., Faith and Fate: Limits of Transformers on Compositionality'
---

# Why does decomposing a complex task into smaller subtasks improve LLM results?

## Context

Asked to support the claim that splitting a big request into smaller steps gives better output from a language model than asking for everything at once. The claim is about task structure, so the question is scoped to why decomposition helps, and where it stops helping.

## Answer

Models often handle each sub-problem of a task yet fail to compose them into the overall answer, and a larger model does not close that gap. Decomposing the task helps because each subtask is simpler than the whole, each can have its own prompt, and later subtasks can use earlier answers. The benefit has limits: decomposition does not make a model reliable at composition, since errors in early steps still carry into later ones.

## Findings

1. Breaking a complex problem into simpler subproblems solved in sequence, each aided by the answers to earlier ones, lets GPT-3 code-davinci-002 solve the SCAN compositional benchmark at 99% or better with 14 exemplars, against 16% for chain-of-thought prompting [1].
2. The same least-to-most strategy generalises to problems harder than the examples shown in the prompt, where plain chain-of-thought prompting performs poorly [1].
3. Few-shot prompting struggles as task complexity grows; delegating subtasks to dedicated prompts lets each prompt be optimised for its subtask, further decomposed, or replaced by a trained model or symbolic function, and it outperforms prior few-shot prompting on GPT-3 [2].
4. When the difficulty comes from input length, recursively decomposing the task into the same task on smaller inputs helps [2].
5. Models can answer every sub-problem of a multi-hop question correctly yet fail the whole question; this ratio, the compositionality gap, does not shrink as GPT-3 models grow, because single-hop accuracy improves faster than multi-hop accuracy [3].
6. Prompting the model to answer explicit follow-up questions before the final answer (self-ask) narrows the gap and improves on chain-of-thought [3].
7. On multi-digit multiplication, logic grid puzzles and a dynamic programming problem, transformer LLMs appear to solve compositional tasks by matching linearised subgraphs of what they have seen, not by systematic problem solving, and theoretical arguments show that accuracy can decay rapidly as the number of steps grows [4].

## Caveats

The evidence comes from tasks with a known correct decomposition (symbolic manipulation, multi-hop questions, arithmetic) on GPT-3-era models; whether it carries over to open-ended work with current models, such as drafting a document, is an inference. Finding 7 is the strongest counter-evidence: it shows a limit that decomposition alone does not remove, which is why each step needs checking. The sources test prompting methods in which the model decomposes within one run or via designed prompts; none of them tests a person splitting a task across separate chats.

[1]: https://arxiv.org/abs/2205.10625 'Zhou et al., Least-to-Most Prompting Enables Complex Reasoning in Large Language Models'
[2]: https://arxiv.org/abs/2210.02406 'Khot et al., Decomposed Prompting: A Modular Approach for Solving Complex Tasks'
[3]: https://arxiv.org/abs/2210.03350 'Press et al., Measuring and Narrowing the Compositionality Gap in Language Models'
[4]: https://arxiv.org/abs/2305.18654 'Dziri et al., Faith and Fate: Limits of Transformers on Compositionality'
