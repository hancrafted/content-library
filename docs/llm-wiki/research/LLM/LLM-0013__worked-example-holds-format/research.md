---
type: research
title: 'Why does one worked example hold an LLM to a format better than a description does?'
description: 'Demonstrations teach the model the output format directly, but no study found compares one example with a clear description on modern models.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-27T23:25:00Z
stale_after: 2027-10-27T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2005.14165
    title: 'Brown et al., Language Models are Few-Shot Learners'
  - id: 2
    resource: https://arxiv.org/abs/2202.12837
    title: 'Min et al., Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?'
  - id: 3
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices (Use examples effectively)'
  - id: 4
    resource: https://ai.google.dev/gemini-api/docs/prompting-strategies
    title: 'Google, Gemini API prompt design strategies'
  - id: 5
    resource: https://developers.openai.com/api/docs/guides/prompt-engineering
    title: 'OpenAI, Prompt engineering guide'
  - id: 6
    resource: https://arxiv.org/abs/2410.01288
    title: 'Mitigating Copy Bias in In-Context Learning through Neuron Pruning'
  - id: 7
    resource: https://arxiv.org/abs/2410.13343
    title: 'Do LLMs Overcome Shortcut Learning? An Evaluation of Shortcut Challenges in Large Language Models'
---

# Why does one worked example hold an LLM to a format better than a description does?

## Context

Asked to back a check in a prompt-authoring skill: when the shape of the answer matters, the prompt shows one finished example and does not only describe the shape. The prompts are pasted by non-technical people into consumer chats. The question is why an example should work better than a description.

## Answer

The evidence supports half of the "why" and not the comparison. An example shows the format directly: the model sees the actual sequence it should continue, and Min et al. find that the format of demonstrations, with the label space and input kind, drives in-context learning more than whether the content is correct. All three vendors recommend examples to control format, and Google and Anthropic say clear examples can carry the task. No source found tests one example against a clear description on current models, so "one example beats a description" is vendor guidance, not a measured result. Examples also carry risk: models can copy example content, and Google warns that too many examples overfit the answer. Anthropic gives no sign that newer models need examples less.

## Findings

1. GPT-3 was shown tasks with few-shot demonstrations given purely as text, without any gradient updates, and scaling improved this few-shot performance [1].
2. Demonstrations help through three things: the label space, the input text distribution and "the overall format of the sequence". These, not label correctness, are the key drivers of performance; random labels cost only a minor drop across 12 models [2].
3. Google recommends always including few-shot examples, says prompts without them are likely less effective, and says few-shot examples are often used to regulate formatting, phrasing, scoping or patterning [4].
4. Google says examples can replace instructions: "you can remove instructions from your prompt if your examples are clear enough in showing the task at hand" [4].
5. Google says to keep the structure and formatting of examples identical, including tags, white space and newlines, to avoid responses with undesired formats [4].
6. Anthropic calls examples "one of the most reliable ways to steer Claude's output format, tone, and structure". It asks for relevant and diverse examples, so the model does not pick up unintended patterns, and suggests 3 to 5 [3].
7. OpenAI says the model implicitly picks up the pattern from a few input and output examples, advises showing a diverse range of inputs, and pairs examples with explicit output rules such as "Only output a single word" [5].
8. Risk of copying: LLMs doing few-shot learning can copy answers from the examples instead of learning the pattern, and removing the neurons behind this improved results on many tasks [6]. Google warns that with too many examples "the model may start to overfit the response to the examples" [4].
9. On one benchmark of shortcut learning, few-shot prompts generally underperformed zero-shot prompts, and larger models used shortcuts more under both settings [7].
10. The vendor pages found do not say newer models need examples less. Anthropic's current guide for its latest models still recommends examples [3].

## Caveats

No source read compares one example against a clear written description of the same format, so the check rests on vendor guidance and on Min et al.'s finding about demonstrations, not on a direct test. Min et al. (2022) tested classification and multiple-choice tasks on older models, not free-form answers from current chat models. Brown et al. [1] show that demonstrations work, not that they beat descriptions. Finding 8 and 9 come from tasks that are not format tasks, so they show that copying and shortcuts exist, not how often one example is copied in a consumer chat. The Google statement in finding 4 is guidance, not a measurement. Anthropic's 3 to 5 examples differs from the one example in the check; the vendor pages found do not test one. The consumer chat apps add their own hidden instructions, which none of these sources measure. A 2024 or later study of format adherence with examples versus instructions was searched for and none was found and read in full.

[1]: https://arxiv.org/abs/2005.14165 'Brown et al., Language Models are Few-Shot Learners'
[2]: https://arxiv.org/abs/2202.12837 'Min et al., Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?'
[3]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices 'Anthropic, Prompting best practices (Use examples effectively)'
[4]: https://ai.google.dev/gemini-api/docs/prompting-strategies 'Google, Gemini API prompt design strategies'
[5]: https://developers.openai.com/api/docs/guides/prompt-engineering 'OpenAI, Prompt engineering guide'
[6]: https://arxiv.org/abs/2410.01288 'Mitigating Copy Bias in In-Context Learning through Neuron Pruning'
[7]: https://arxiv.org/abs/2410.13343 'Do LLMs Overcome Shortcut Learning? An Evaluation of Shortcut Challenges in Large Language Models'
