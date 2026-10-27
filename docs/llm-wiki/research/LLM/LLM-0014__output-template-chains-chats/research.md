---
type: research
title: "Why does a stated output template make an LLM's answers readable by the next chat?"
description: 'A stated format steers output and chains pass one output in as the next input, but no source tests a fixed template as the handoff between chats.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-27T23:20:43Z
stale_after: 2027-10-27T00:00:00Z
sources:
  - id: 1
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices (be specific about format, control the format of responses, chain complex prompts)'
  - id: 2
    resource: https://ai.google.dev/gemini-api/docs/prompting-strategies
    title: 'Google, Gemini API prompting strategies'
  - id: 3
    resource: https://developers.openai.com/api/docs/guides/prompt-engineering
    title: 'OpenAI, Prompt engineering guide'
  - id: 4
    resource: https://arxiv.org/abs/2110.01691
    title: 'Wu et al., AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts'
  - id: 5
    resource: https://arxiv.org/abs/2408.02442
    title: 'Tam et al., Let Me Speak Freely? A Study on the Impact of Format Restrictions on Performance of Large Language Models'
  - id: 6
    resource: https://arxiv.org/abs/2311.07911
    title: 'Zhou et al., Instruction-Following Evaluation for Large Language Models'
---

# Why does a stated output template make an LLM's answers readable by the next chat?

## Context

Asked to back a prompt-authoring check: each job's prompt states the exact Markdown template of its answer, with fixed headings, so the next job's prompt can take that answer as input in a fresh chat. The people pasting these prompts are non-technical and use consumer chats. The question is why a stated template helps, and what it costs.

## Answer

The evidence supports two parts of the "why" but not the whole of it. Vendors say that stating the output format steers what the model writes, and that in a chain the output of one prompt becomes the input of the next. So a stated template makes the answer predictable, and a predictable answer is something the next prompt can be written against. No source tests a fixed Markdown template as the handoff between fresh chats, so that link is an inference. The paper on format restrictions also shows a cost: strict formats such as JSON, XML and YAML can lower reasoning accuracy, though looser instructions and putting reasoning before the answer reduce the harm.

## Findings

1. Anthropic's guidance tells authors to be specific about the output format and constraints, and says examples are one of the most reliable ways to steer output format, tone and structure [1].
2. Anthropic says that matching the prompt's style to the wanted output style can steer the response, and that explicit format guidance gives more control [1].
3. Google says you can give instructions that specify the format of a response, and that examples largely teach format, so the format must be consistent across examples [2].
4. Google defines prompt chaining as splitting a task into one prompt per step, where "the output of one prompt in the sequence becomes the input of the next prompt" [2].
5. Anthropic says explicit chaining is still useful when you need to inspect intermediate outputs or enforce a pipeline structure, and that each step is a separate call so you can log, evaluate or branch at any point [1].
6. OpenAI says Markdown headers and lists mark distinct sections of a prompt and communicate hierarchy to the model, and that XML tags show where a piece of content begins and ends [3]. This is about the input prompt, not the output.
7. Wu et al. define a chain as steps where the output of one step becomes the input of the next. In a 20-person user study, chaining improved task outcomes and increased transparency and controllability, and users debugged chains by testing parts of them [4].
8. IFEval measures whether models follow instructions that can be checked objectively, about 500 prompts over 25 instruction types. It shows that format-style instructions can be scored, but the page read gives no result on handoff between chats [6].
9. Tam et al. find a significant decline in reasoning ability under format restrictions, and the stricter the restriction, the larger the decline. On GSM8K, Claude-3-Haiku fell from 86.5 in natural language to 23.4 under a JSON schema [5].
10. In the same paper, classification tasks often improved under format restrictions. For example, Gemini on DDXPlus rose from 41.6 to 60.3 with JSON instructions. The authors suggest the format narrows the answer space [5].
11. Tam et al. report three mitigations: answer in natural language and convert to the format afterwards (nearly as good as free text), use looser instructions without a schema, and place the reasoning field before the answer field [5].

## Caveats

No source tests the claim as asked. Findings 1 to 5 show that format can be steered and that chains pass output to input, but not that a heading template makes a later fresh chat read the answer better. That link is an inference. Source 1 is API-oriented guidance, and source 2 and 3 are API docs; none tests consumer chat apps. Tam et al. test JSON, XML and YAML on small and mid-sized models from 2024 with simple schemas, not Markdown headings, so the size of the cost for a heading template is unknown. The authors say larger models were left out. For source 6 only the abstract page was read, so no IFEval results are cited. For source 3 only the input-structure advice was found, not a statement about output templates. The Anthropic chaining and format guidance is now part of one best-practices page; the older separate pages redirect there.

[1]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices 'Anthropic, Prompting best practices (be specific about format, control the format of responses, chain complex prompts)'
[2]: https://ai.google.dev/gemini-api/docs/prompting-strategies 'Google, Gemini API prompting strategies'
[3]: https://developers.openai.com/api/docs/guides/prompt-engineering 'OpenAI, Prompt engineering guide'
[4]: https://arxiv.org/abs/2110.01691 'Wu et al., AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts'
[5]: https://arxiv.org/abs/2408.02442 'Tam et al., Let Me Speak Freely? A Study on the Impact of Format Restrictions on Performance of Large Language Models'
[6]: https://arxiv.org/abs/2311.07911 'Zhou et al., Instruction-Following Evaluation for Large Language Models'
