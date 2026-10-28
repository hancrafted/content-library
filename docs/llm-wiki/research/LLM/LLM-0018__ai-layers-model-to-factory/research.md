---
type: research
title: 'Why are a model, prompting, an agent, a workflow and a factory distinct layers of working with AI?'
description: 'A large language model is the foundation; prompting, agents and workflows have first-party definitions, while "factory" is a 2026 practitioner label with no settled definition.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-28T12:00:00Z
stale_after: 2027-04-28T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2005.14165
    title: 'Brown et al., Language Models are Few-Shot Learners (GPT-3)'
  - id: 2
    resource: https://arxiv.org/abs/2108.07258
    title: 'Bommasani et al., On the Opportunities and Risks of Foundation Models'
  - id: 3
    resource: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
    title: 'NIST, AI 600-1 Generative Artificial Intelligence Profile'
  - id: 4
    resource: https://openai.com/index/chatgpt/
    title: 'OpenAI, Introducing ChatGPT'
  - id: 5
    resource: https://developers.openai.com/api/docs/guides/prompt-engineering
    title: 'OpenAI, Prompt engineering guide'
  - id: 6
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents'
  - id: 7
    resource: https://simonwillison.net/2025/Sep/18/agents/
    title: 'Willison, I think "agent" may finally have a widely enough agreed upon definition'
  - id: 8
    resource: https://chadgrant.github.io/dark-factories/
    title: 'Grant, Dark Factories: Agentic Software Factories (briefing, secondary)'
  - id: 9
    resource: https://arxiv.org/abs/2210.03629
    title: 'Yao et al., ReAct: Synergizing Reasoning and Acting in Language Models'
  - id: 10
    resource: https://arxiv.org/abs/2302.04761
    title: 'Schick et al., Toolformer: Language Models Can Teach Themselves to Use Tools'
  - id: 11
    resource: https://openai.com/index/function-calling-and-other-api-updates/
    title: 'OpenAI, Function calling and other API updates (13 Jun 2023, via search result; page blocked)'
  - id: 12
    resource: https://www.langchain.com/blog/langgraph
    title: 'LangChain, LangGraph'
  - id: 13
    resource: https://www.anthropic.com/news/claude-3-7-sonnet
    title: 'Anthropic, Claude 3.7 Sonnet and Claude Code'
  - id: 14
    resource: https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/
    title: 'Shapiro, The Five Levels: from Spicy Autocomplete to the Dark Factory'
  - id: 15
    resource: https://simonwillison.net/2026/Feb/7/software-factory/
    title: "Willison, How StrongDM's AI team build serious software without even looking at the code"
  - id: 16
    resource: https://factory.strongdm.ai/
    title: 'StrongDM, The Software Factory'
---

# Why are a model, prompting, an agent, a workflow and a factory distinct layers of working with AI?

## Context

Asked to give plain-language definitions for the layers of a timeline built on one foundation: the model, prompting, agents, workflows and factories. It also asks whether "generative AI" or "large language model" is the more accurate name for the foundation under ChatGPT, Copilot and Claude.

## Answer

The foundation is best called a large language model (LLM): a model trained on broad text at scale that is steered by text instructions. "Generative AI" names the wider class of models that produce content (text, images, audio), so it is correct but less precise; NIST itself narrows it to "generative foundation models" for its profile. Prompting is writing effective instructions to such a model. An agent is an LLM that directs its own tool use in a loop towards a goal; a workflow chains LLM and tool steps along a path fixed in advance by code. "Factory" has no settled definition: it is a 2026 practitioner term for agents working autonomously on a whole delivery line without humans watching each step.

## Findings

1. GPT-3 (May 2020) was described as an autoregressive language model with 175 billion parameters whose tasks and few-shot demonstrations are "specified purely via text interaction with the model", without fine-tuning [1].
2. A foundation model is "any model that is trained on broad data at scale and can be adapted ... to a wide range of downstream tasks"; the report (Aug 2021) names GPT-3 as an example [2].
3. NIST, quoting Executive Order 14110, defines generative AI as "the class of AI models that emulate the structure and characteristics of input data in order to generate derived synthetic content", including images, video, audio and text; NIST adds that "GAI generally refers to generative foundation models" in its document (July 2024) [3].
4. ChatGPT launched on 30 November 2022 as "a model called ChatGPT which interacts in a conversational way" [4].
5. OpenAI defines prompt engineering as "the process of writing effective instructions for a model" so that it "consistently generates content that meets your requirements", and calls it "a mix of art and science" because output is non-deterministic [5].
6. Anthropic (19 Dec 2024) calls the building block an LLM enhanced with retrieval, tools and memory, and groups all variants as "agentic systems" [6].
7. In the same essay, workflows are "systems where LLMs and tools are orchestrated through predefined code paths", while agents are "systems where LLMs dynamically direct their own processes and tool usage", keeping control over how they accomplish tasks [6].
8. Simon Willison (18 Sep 2025) settles on "An LLM agent runs tools in a loop to achieve a goal", and notes the loop has a stopping condition [7].
9. A 2026 briefing reports Steve Yegge's definition, "any system in which coding agents are set up to work autonomously without humans watching", and lists other vendor definitions (BCG Platinion, i-SCOOP, Augment Code, OpenHands) that differ in how much human review remains [8].
10. Date ranges: ReAct (first submitted 6 Oct 2022) has the model interleave reasoning traces with actions that pull in outside information, and Toolformer (9 Feb 2023) has a model learn when to call external APIs [9][10]. OpenAI shipped function calling on 13 Jun 2023 for gpt-4-0613 and gpt-3.5-turbo-0613 [11]. Tool-using LLMs therefore existed from late 2022, before the 2024 to 2025 range.
11. Anthropic defined agents and workflows on 19 Dec 2024 [6], and launched Claude Code on 24 Feb 2025 as "our first agentic coding tool", a limited research preview [13]. Willison's agent definition followed on 18 Sep 2025 [7]. These dates support 2024 to 2025 as the period agents became mainstream tooling.
12. LangGraph was published on 17 Jan 2024 to build graphs with loops, controlled state machines where developers still decide the structure [12]. This anchors graph-shaped workflow tooling in 2024, a year before the 2025 to 2026 range; no 2025 to 2026 source defining "workflow" as a new discipline was found.
13. Dan Shapiro published the five levels on 23 Jan 2026, with Level 5, the "dark factory", as "a black box that turns specs into software" [14]. StrongDM published its Software Factory on 6 Feb 2026, with the rules "Code must not be written by humans" and "Code must not be reviewed by humans"; its AI team was founded on 14 Jul 2025 [16]. Willison covered it on 7 Feb 2026 [15]. The label dates from early 2026; the practice began in mid-2025 at one team.

## Caveats

Findings 1 to 8 were read on the owning pages; the NIST wording was read from a text extract of the PDF. Finding 9 rests on a secondary briefing and was not checked against Yegge's own post, which could not be fetched; treat "factory" as unsettled. Date ranges: OpenAI's function-calling page and the Operator page returned 403, so the 13 Jun 2023 date rests on a search result; AutoGPT's March 2023 launch, the Anthropic guide dates for prompt engineering and the 2023 "prompt engineer" job boom were not verified; no primary source dates "workflow" as a 2025 to 2026 discipline, and the ranges are the speaker's judgement bracketed by the dated anchors. The claim that prompting became a discipline in 2022 to 2023 is inferred from findings 1 and 4, not stated by a source. "Workflow replaces a team" and "factory replaces an organization" are not claims any source above makes. Sources 1 to 3 date the terms; they do not say which label is better for non-technical audiences, so the LLM-over-generative-AI verdict is a judgement from findings 2 and 3.

[1]: https://arxiv.org/abs/2005.14165 'Brown et al., Language Models are Few-Shot Learners (GPT-3)'
[2]: https://arxiv.org/abs/2108.07258 'Bommasani et al., On the Opportunities and Risks of Foundation Models'
[3]: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf 'NIST, AI 600-1 Generative Artificial Intelligence Profile'
[4]: https://openai.com/index/chatgpt/ 'OpenAI, Introducing ChatGPT'
[5]: https://developers.openai.com/api/docs/guides/prompt-engineering 'OpenAI, Prompt engineering guide'
[6]: https://www.anthropic.com/engineering/building-effective-agents 'Anthropic, Building effective agents'
[7]: https://simonwillison.net/2025/Sep/18/agents/ 'Willison, I think "agent" may finally have a widely enough agreed upon definition'
[8]: https://chadgrant.github.io/dark-factories/ 'Grant, Dark Factories: Agentic Software Factories (briefing, secondary)'
[9]: https://arxiv.org/abs/2210.03629 'Yao et al., ReAct: Synergizing Reasoning and Acting in Language Models'
[10]: https://arxiv.org/abs/2302.04761 'Schick et al., Toolformer: Language Models Can Teach Themselves to Use Tools'
[11]: https://openai.com/index/function-calling-and-other-api-updates/ 'OpenAI, Function calling and other API updates (13 Jun 2023, via search result; page blocked)'
[12]: https://www.langchain.com/blog/langgraph 'LangChain, LangGraph'
[13]: https://www.anthropic.com/news/claude-3-7-sonnet 'Anthropic, Claude 3.7 Sonnet and Claude Code'
[14]: https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/ 'Shapiro, The Five Levels: from Spicy Autocomplete to the Dark Factory'

[15]: https://simonwillison.net/2026/Feb/7/software-factory/ 'Willison, How StrongDM's AI team build serious software without even looking at the code'
[16]: https://factory.strongdm.ai/ 'StrongDM, The Software Factory'
