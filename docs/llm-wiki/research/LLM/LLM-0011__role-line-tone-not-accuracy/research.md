---
type: research
title: "Why does a role line shape an LLM's tone and depth but not its accuracy?"
description: 'Studies find that a persona or role line does not reliably raise factual accuracy, while it does shift style and depth; vendor guides describe a role as a tone and focus setting.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-27T23:20:49Z
stale_after: 2027-10-27T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2311.10054
    title: 'Zheng et al., When "A Helpful Assistant" Is Not Really Helpful: Personas in System Prompts Do Not Improve Performances of Large Language Models'
  - id: 2
    resource: https://arxiv.org/abs/2512.05858
    title: "Basil et al., Prompting Science Report 4: Playing Pretend: Expert Personas Don't Improve Factual Accuracy"
  - id: 3
    resource: https://arxiv.org/abs/2603.18507
    title: 'Hu et al., Expert Personas Improve LLM Alignment but Damage Accuracy: Bootstrapping Intent-Based Persona Routing with PRISM'
  - id: 4
    resource: https://arxiv.org/abs/2605.29420
    title: 'Xiao et al., When Does Persona Prompting Actually Help? A Retrieval and Metric Analysis of Expert Role Injection in LLMs'
  - id: 5
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices (Give Claude a role)'
  - id: 6
    resource: https://ai.google.dev/gemini-api/docs/prompting-strategies
    title: 'Google, Gemini API prompting strategies'
  - id: 7
    resource: https://arxiv.org/abs/2308.07702
    title: 'Kong et al., Better Zero-Shot Reasoning with Role-Play Prompting'
---

# Why does a role line shape an LLM's tone and depth but not its accuracy?

## Context

Asked to support a check in a prompt-authoring skill: the "Your role" section of a prompt is one optional sentence that sets tone and depth, and accuracy comes from context, steps and the output template. Non-technical people paste these prompts into consumer chats, so the role arrives in the user turn, not a system prompt. The question is whether the evidence supports that split.

## Answer

The evidence supports the split on its "not accuracy" half, and only partly on the "why". Controlled tests on factual and exam-style questions find that persona or role lines do not reliably raise accuracy, and low-knowledge personas lower it. The same studies and both vendor guides describe a role as steering style, tone and focus, and one study measures a shift toward more expert depth with less clarity. No source tests a mechanism, so the "why" is an inference: a role changes the register of the answer, while the facts the model can retrieve stay the same. One counter-study shows a task-specific role raising reasoning accuracy, so the claim holds for a generic role line, not for every role.

## Findings

1. Across 162 personas and 2,410 factual questions on four model families, personas in system prompts did not improve performance over a no-persona control; the authors conclude the effect of each persona is largely random [1].
2. Picking the best persona per question after the fact raises accuracy, but predicting the best persona in advance often does no better than a random pick [1].
3. On GPQA Diamond and MMLU-Pro across six models, matched expert personas had no significant effect on accuracy (Gemini 2.0 Flash was the exception), mismatched experts gave marginal or lower scores, and low-knowledge personas such as a layperson or toddler were generally harmful [2].
4. The authors of source 2 note that their results concern answer accuracy only, and that personas may still be useful for other things, such as changing tone [2].
5. Expert personas improve alignment (human preference and safety) on generative tasks but damage accuracy on discriminative tasks, and the effect depends on task type, prompt length and placement [3].
6. On 1,140 open-ended questions with 38 expert roles, role prompting systematically increased expertise depth while reducing clarity, with only small differences in averaged scores. Roles helped on advisory questions in medicine and psychology; no role was better for conceptual and explanatory questions in finance, law, science and technology [4].
7. Anthropic's guide says setting a role in the system prompt "focuses Claude's behavior and tone for your use case" and that even a single sentence makes a difference; it makes no accuracy claim [5].
8. Google's Gemini guide places role definitions (persona) and output format requirements in the system instruction, and lists tone as a constraint to specify, such as formal, casual or technical; it makes no accuracy claim for the role [6].
9. Counter-evidence: a two-stage method that has the model build a task-specific role-play prompt raised ChatGPT accuracy on 10 of 12 reasoning benchmarks in the authors' report, for example AQuA from 53.5% to 63.8%, and they describe it as a stronger trigger for step-by-step reasoning than "think step by step" [7].

## Caveats

Sources 1 and 2 test accuracy on multiple-choice or short factual questions; they say nothing about the quality of long-form work such as emails or reports. Source 3 and source 4 are recent preprints; I read their abstract pages, not the full papers. The fetched pages did not name every model: source 1 lists four model families and source 2 lists six models, and only Gemini 2.0 Flash is named. No study read here tests GPT-5, Claude 4.x or Gemini 3 with a role line, so newer-model behaviour is untested. Sources 1 and 2 put the persona in a system prompt, and none of the sources tests a role in the user turn, which is where consumer chat users place it. Source 7 uses a model-written, task-specific role and ChatGPT only; it is consistent with the skill's rule that steps carry accuracy, because the role there acts as a reasoning trigger, but that reading is an inference. The mechanism in the Answer is not measured by any source. I did not read the OpenAI GPT-5 prompting guide, so no claim about it is made.

[1]: https://arxiv.org/abs/2311.10054 'Zheng et al., When "A Helpful Assistant" Is Not Really Helpful: Personas in System Prompts Do Not Improve Performances of Large Language Models'

[2]: https://arxiv.org/abs/2512.05858 'Basil et al., Prompting Science Report 4: Playing Pretend: Expert Personas Don''t Improve Factual Accuracy'
[3]: https://arxiv.org/abs/2603.18507 'Hu et al., Expert Personas Improve LLM Alignment but Damage Accuracy: Bootstrapping Intent-Based Persona Routing with PRISM'
[4]: https://arxiv.org/abs/2605.29420 'Xiao et al., When Does Persona Prompting Actually Help? A Retrieval and Metric Analysis of Expert Role Injection in LLMs'
[5]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices 'Anthropic, Prompting best practices (Give Claude a role)'
[6]: https://ai.google.dev/gemini-api/docs/prompting-strategies 'Google, Gemini API prompting strategies'
[7]: https://arxiv.org/abs/2308.07702 'Kong et al., Better Zero-Shot Reasoning with Role-Play Prompting'
