---
type: research
title: 'Why do IBM and Salesforce define agentic workflows as structured
  processes in which AI agents make decisions, take actions and coordinate tasks
  with minimal human intervention?'
description: 'Both vendors define an agentic workflow by agent autonomy, the
  benefit their platforms sell; Anthropic and Ng define it by who controls the
  steps and treat autonomy as a degree.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T11:51:24Z
stale_after: 2027-05-14T00:00:00+00:00
sources:
  - id: 1
    resource: https://www.ibm.com/think/topics/agentic-workflows
    title: 'Gutowska and Stryker (IBM), What are Agentic Workflows?'
  - id: 2
    resource: https://www.salesforce.com/agentforce/agentic-workflows/
    title: 'Salesforce, What Are Agentic Workflows?'
  - id: 3
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents'
  - id: 4
    resource: https://www.deeplearning.ai/the-batch/issue-253/
    title: 'Andrew Ng, The Batch issue 253 (letter on agentic workflows)'
  - id: 5
    resource: https://learn.deeplearning.ai/courses/agentic-ai/lesson/zqs9ty/degrees-of-autonomy
    title: 'Andrew Ng, Agentic AI: Degrees of autonomy'
---

# Why do IBM and Salesforce define agentic workflows as structured processes in which AI agents make decisions, take actions and coordinate tasks with minimal human intervention?

## Context

Asked to support a definition of an agentic workflow that two large vendors share, and to weigh how far a vendor's definition can be trusted. The claim is about how the term is defined and by whom, not about how well agents work.

## Answer

Both pages define an agentic workflow by the autonomy of its agents: they decide and act, and a person is needed as little as possible. Neither page states why it chose that wording. The reason is an inference: IBM and Salesforce sell agent platforms, and reduced human effort is the benefit those platforms offer. Non-vendor sources agree that agents decide and act, but define the term by who controls the steps, and treat autonomy as a spectrum rather than a given.

## Findings

1. IBM defines the term as: "Agentic workflows are AI-driven processes where autonomous AI agents make decisions, take actions and coordinate tasks with minimal human intervention." [1]
2. Salesforce defines it as: "Agentic workflows are structured processes where AI agents make decisions, solve problems, and perform tasks with minimal human input." "Structured" appears only in Salesforce's sentence; IBM's has "AI-driven" instead, and "coordinate tasks" and "minimal human intervention" appear only in IBM's. A sentence that merges the two takes "structured" from Salesforce and the rest from IBM [1][2].
3. IBM frames the benefit as less human involvement: it names adoption "while reducing reliance on human oversight", and it still names human-in-the-loop feedback as a mechanism that "can be valuable" [1].
4. Salesforce frames the benefit the same way: tasks executed "without requiring constant human oversight", "reduced manual intervention" as a benefit, and "Train and upskill employees" as an implementation step so they can collaborate with agents [2].
5. Anthropic does not use the vendors' autonomy wording. It defines workflows as "systems where LLMs and tools are orchestrated through predefined code paths" and agents as systems "where LLMs dynamically direct their own processes and tool usage". It calls both "agentic systems" and draws the line at who controls the steps [3].
6. Anthropic advises "finding the simplest solution possible, and only increasing complexity when needed", so the autonomous end is a choice to make, not the definition [3].
7. Andrew Ng coined the adjective to avoid a binary: "it would be more useful to think of systems as being agent-like to different degrees", with a "gray zone" between a single prompt and a clear agent [4].
8. In his course, "less autonomous" systems have "all the steps predetermined in advance" and most of their autonomy is "in what text the LLM generates". Such a system still counts as agentic [5].

## Caveats

- IBM and Salesforce are vendors of agent platforms. Their pages are marketing-adjacent explainers, so each definition is a vendor's description, not a standard. The IBM page is bylined (an IBM AI engineer and an editor) and gives no publication date; the Salesforce page names no author.
- Neither vendor page gives a reason for its wording. The Answer's explanation (the definitions favour autonomy because autonomy is what the platforms sell) is an inference from their commercial position and from how each page praises reduced oversight.
- The vendor definitions say "minimal", not "no", human involvement, and the pages themselves keep humans in some roles (IBM's HITL feedback, Salesforce's upskilling). How minimal is left open.
- Anthropic and Ng do not define "agentic workflow" in the vendors' sentence. They agree on decisions and actions by the model, and differ on autonomy being definitional. Ng's course lesson gives no formal definition of the term [5]. Anthropic is also a vendor of models, though its article is engineering guidance, not a product page.
- The two vendor pages are web pages that can be edited without notice; the quotes were read on 2026-11-14.

[1]: <https://www.ibm.com/think/topics/agentic-workflows> "Gutowska and Stryker (IBM), What are Agentic Workflows?"
[2]: <https://www.salesforce.com/agentforce/agentic-workflows/> "Salesforce, What Are Agentic Workflows?"
[3]: <https://www.anthropic.com/engineering/building-effective-agents> "Anthropic, Building effective agents"
[4]: <https://www.deeplearning.ai/the-batch/issue-253/> "Andrew Ng, The Batch issue 253 (letter on agentic workflows)"
[5]: <https://learn.deeplearning.ai/courses/agentic-ai/lesson/zqs9ty/degrees-of-autonomy> "Andrew Ng, Agentic AI: Degrees of autonomy"
