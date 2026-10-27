---
type: research
title: 'Why does fencing pasted text keep an LLM from following instructions hidden in it?'
description: 'A fence marks which text is input, which lowers the rate of obeyed hidden instructions, but models do not enforce the boundary, so fencing reduces the risk and does not prevent it.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-27T23:25:00Z
stale_after: 2027-10-27T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2302.12173
    title: 'Greshake et al., Not what you have signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection'
  - id: 2
    resource: https://arxiv.org/abs/2402.06363
    title: 'Chen et al., StruQ: Defending Against Prompt Injection with Structured Queries'
  - id: 3
    resource: https://arxiv.org/abs/2404.13208
    title: 'Wallace et al., The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions'
  - id: 4
    resource: https://arxiv.org/html/2403.14720
    title: 'Hines et al., Defending Against Indirect Prompt Injection Attacks With Spotlighting'
  - id: 5
    resource: https://genai.owasp.org/llmrisk/llm01-prompt-injection/
    title: 'OWASP, LLM01 Prompt Injection'
  - id: 6
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices'
  - id: 7
    resource: https://ai.google.dev/gemini-api/docs/prompting-strategies
    title: 'Google, Gemini API prompt design strategies'
  - id: 8
    resource: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide
    title: 'OpenAI, GPT-5 prompting guide'
---

# Why does fencing pasted text keep an LLM from following instructions hidden in it?

## Context

Asked to back a check in a prompt-authoring skill: every pasted input, such as a previous chat's answer or a document, sits inside a fence (``` or XML tags), and the prompt says pasted text is data, not instructions. The people pasting are non-technical and use consumer chats. The question is why this works, and how well.

## Answer

The evidence supports a weaker claim than the question makes. Models are not built to keep instructions and data apart: they read both as one stream of text and tend to follow instructions wherever they appear. A fence plus a sentence naming it as data gives the model a marker for where the input starts and ends, and that lowers the rate at which hidden instructions are followed. In the one controlled test found, delimiters alone roughly halved attack success on one older model, and the same authors do not recommend relying on them. Vendors recommend tags to avoid mixing up instructions and input, but none of the vendor pages measures it. So fencing is a cheap, worthwhile habit that reduces the risk. It does not keep a model from following hidden instructions.

## Findings

1. Applications that feed retrieved or pasted content to a model "blur the line between data and instructions", so instructions planted in that content can steer the model. The authors report working attacks on deployed systems and say effective mitigations were lacking [1].
2. Prompt injection works because of the model's instruction-following ability and its "inability to separate prompts and user data". The StruQ authors fix this with a special input format and fine-tuning, so the model is trained to obey only the prompt part [2].
3. A core weakness is that models give system prompts "the same priority as text from untrusted users and third parties". Training models to rank instructions by source drastically increased robustness, including against attacks not seen in training [3].
4. Spotlighting gives the model a signal of where input comes from. Delimiting wraps the input in boundary markers and tells the model never to obey instructions between them. With GPT-3.5-Turbo on summarization, the baseline attack success was around 60% and delimiters "can reduce the ASR by half". The authors say more improvement is needed for real-world systems [4].
5. Stronger variants did better in the same paper. Datamarking, which inserts a marker token through the whole input, cut attack success from about 50% to below 3% on GPT-3.5-Turbo. Across GPT-family models, spotlighting overall cut it from above 50% to below 2% [4].
6. Fences can be forged. An attacker who knows the delimiters could write a string that contains them and overrides the instructions. The authors "do not recommend using delimiting in practice". A plain warning in the system prompt gave GPT-3.5-Turbo almost no added benefit [4].
7. OWASP lists "Segregate and identify external content" as one mitigation among several. It says it is unclear if there are fool-proof methods of prevention, and that the measures only mitigate the impact [5].
8. Anthropic says XML tags help Claude parse prompts that mix instructions, context and inputs, and that wrapping each type of content in its own tag "reduces misinterpretation". It also advises wrapping each document in `<document>` tags. It gives no measurement and does not mention injection in that passage [6].
9. Google advises clear delimiters, XML-style tags or Markdown headings, because tags help the model distinguish instructions, context and tasks. Its template notes that content in the user-input tag is data, not instructions [7].
10. OpenAI's GPT-5 guide uses XML-style tags in its sample prompts and says structured, scoped prompts give reliable results. It does not recommend delimiters to separate documents from instructions [8].

## Caveats

No source measures plain mix-ups, such as a pasted answer that contains "now write a summary" being treated as a request. Findings 8 to 10 are vendor advice without data, and the claim that fences reduce such mix-ups is an inference from them and from the attack results. The only controlled number for delimiters (finding 4) comes from a 2024 paper on GPT-3.5-Turbo with attacker-written injections; current consumer models are likely more robust, and none of the sources tests ChatGPT, Gemini or Claude chat apps. The paper's delimiters were special symbols with a system prompt, not triple backticks typed by a user in a chat. Hidden instructions in a pasted answer are usually accidental, not an adaptive attack, so the forging risk in finding 6 matters less for this use. The abstracts of sources 1 to 3 were read, not the full papers. The HTML text of source 4 was read through a fetch tool that summarised it, so its figures were not checked against the PDF.

[1]: https://arxiv.org/abs/2302.12173 'Greshake et al., Not what you have signed up for'
[2]: https://arxiv.org/abs/2402.06363 'Chen et al., StruQ: Defending Against Prompt Injection with Structured Queries'
[3]: https://arxiv.org/abs/2404.13208 'Wallace et al., The Instruction Hierarchy'
[4]: https://arxiv.org/html/2403.14720 'Hines et al., Defending Against Indirect Prompt Injection Attacks With Spotlighting'
[5]: https://genai.owasp.org/llmrisk/llm01-prompt-injection/ 'OWASP, LLM01 Prompt Injection'
[6]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices 'Anthropic, Prompting best practices'
[7]: https://ai.google.dev/gemini-api/docs/prompting-strategies 'Google, Gemini API prompt design strategies'
[8]: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide 'OpenAI, GPT-5 prompting guide'
