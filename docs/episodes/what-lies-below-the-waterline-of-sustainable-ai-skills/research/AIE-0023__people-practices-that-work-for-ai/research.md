---
type: research
title: 'Why does "what works for people also works for AI" hold as a rule of thumb, and where does it break?'
description: 'Written context, explicit briefs and checks help both people and models because both act only on what they are given; it breaks on memory, literal reading, attention limits and sycophancy.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T15:44:06Z
stale_after: 2027-05-12T00:00:00Z
sources:
  - id: 1
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices'
  - id: 2
    resource: https://developers.openai.com/api/docs/guides/prompt-engineering
    title: 'OpenAI, Prompt engineering'
  - id: 3
    resource: https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide
    title: 'OpenAI, GPT-4.1 Prompting Guide'
  - id: 4
    resource: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
    title: 'Anthropic Engineering, Equipping agents for the real world with Agent Skills'
  - id: 5
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic Engineering, Effective context engineering for AI agents'
  - id: 6
    resource: https://code.claude.com/docs/en/memory
    title: 'Anthropic, How Claude remembers your project'
  - id: 7
    resource: https://arxiv.org/abs/2310.13548
    title: 'Sharma et al., Towards Understanding Sycophancy in Language Models'
  - id: 8
    resource: https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/AIE/AIE-0001__ai-as-onboarding-a-colleague/research.md
    title: 'Earlier research file, Why do others frame working with AI as onboarding a colleague? (AIE-0001)'
---

# Why does "what works for people also works for AI" hold as a rule of thumb, and where does it break?

## Context

Asked to support the claim that practices people use with a newcomer (a clear brief, onboarding documents, written procedures, a check of the result) are a good first guess for working with a model. The question is why the claim holds, so it can be said as a rule of thumb, and where it fails, so it is not said as a law.

## Answer

The rule holds because a model, like a newcomer, acts only on what it is given: it has broad ability but no knowledge of your norms, so written context, explicit instructions and a way to check the work help both. Model vendors say so in their own guidance, which tells the writer to treat the model as a brilliant but new employee and to test a prompt on a colleague with minimal context. It breaks where the model is not a person: nothing carries over between sessions unless written down, newer models follow instructions literally instead of inferring intent, attention degrades as context grows, models drift toward agreeing with the user, and a different model reads the same words differently. Treat it as a strong rule of thumb for what to write, and as no guide to how the model will behave.

## Findings

1. Anthropic's prompting guidance states the analogy directly: "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows. The more precisely you explain what you want, the better the result." Its test is a human one: "Show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, Claude will be too." [1] The earlier research file (AIE-0001) collects the same frame from Anthropic Engineering, Matt Pocock and Ethan Mollick, and records Mollick's later revision to an "infinitely patient new coworker who forgets everything" [8].
2. OpenAI frames it by seniority instead: "A reasoning model is like a senior co-worker", to whom you give a goal and trust the details, while "A GPT model is like a junior coworker", who performs best "with explicit instructions to create a specific output". The page has no "new employee" comparison [2]. The analogy is used by both vendors, but it points to different amounts of detail by model type.
3. Written procedures transfer, and the vendor says so. Anthropic Engineering writes "Building a skill for an agent is like putting together an onboarding guide for a new hire", and describes loading as "a well-organized manual that starts with a table of contents, then specific chapters, and finally a detailed appendix". Skills capture "procedural knowledge" so it can be shared [4]. Onboarding guides, manuals and tables of contents are people's practices carried over.
4. A practice for people also helps the model manage its limited attention. Anthropic says LLMs "like humans, lose focus or experience confusion at a certain point", have a finite "attention budget", and, like people who rely on "file systems, inboxes, and bookmarks" instead of memorising everything, do well with notes kept outside the context window [5].
5. Where it breaks, memory: each Claude Code session "begins with a fresh context window", and only written files (CLAUDE.md) or notes Claude writes itself carry knowledge across sessions [6]. A human newcomer keeps what they were told; the model keeps only what is written down (see also AIE-0001's Finding 11 [8]).
6. Where it breaks, enforcement: Claude treats CLAUDE.md content "as context, not enforced configuration", and blocking an action regardless of what Claude decides needs a hook. The same page says "The more specific and concise your instructions, the more consistently Claude follows them" [6]. A rule told to a colleague carries social weight; a rule in a file is only more text.
7. Where it breaks, literal reading: OpenAI says GPT-4.1 is "trained to follow instructions more closely and more literally than its predecessors", earlier models "tended to more liberally infer intent", and "implicit rules are no longer being as strongly inferred", so developers "may need to include explicit specification" [3]. Anthropic says "If you want Claude to do more than the task strictly requires, explicitly request it rather than relying on the model to infer this from vague prompts", and that "can you suggest some changes" may get suggestions, not edits [1]. A colleague fills gaps from shared background; the model's behaviour here depends on the model and its version.
8. Where it breaks, the same words read differently by model: Anthropic's guide has model-specific sections listing where "a single model behaves differently and what to change in your prompt" [1], and OpenAI notes that "existing prompts optimized for other models may not immediately work" [3]. A colleague's reading of a card stays fairly stable; a model update or a switch changes the reader.
9. Where it breaks, sycophancy: five state-of-the-art assistants "consistently exhibit sycophancy", and "when a response matches a user's views, it is more likely to be preferred", partly because human preference judgements favour agreement; both people and preference models sometimes "prefer convincingly-written sycophantic responses over correct ones" [7]. A new colleague may stay silent out of politeness, but this is a trained tendency in the model, so asking the model "is this right?" is weaker than a check that does not depend on its agreement.

## Caveats

- The earlier research file [8] was read in this pass; its quotes were not re-fetched, and its sources carry their own caveats. It is cited, not duplicated.
- The sources are vendor guidance and one research paper. They show vendors endorse the analogy and where their own docs say it fails; none measures how well "people's practices" transfer, so the rule's strength is inference from guidance.
- Finding 2 reads OpenAI's junior/senior wording on a page about its current models; the analogy there is about how much detail to give, and not a claim that models are staff.
- The Anthropic prompting page [1] is model-specific in parts and changes with each model release; the quoted lines were on the page when fetched on 2026-11-12. The old docs.claude.com URL redirects to the page cited.
- Finding 9: sycophancy was measured on the five assistants of 2023; later models may differ. The comparison to a polite colleague is this file's inference.
- "Different failure modes" (Findings 5 to 9) are each backed by a source, but listing them as the places the analogy breaks is this file's synthesis; no source gives that list.

[1]: <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices> "Anthropic, Prompting best practices"
[2]: <https://developers.openai.com/api/docs/guides/prompt-engineering> "OpenAI, Prompt engineering"
[3]: <https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide> "OpenAI, GPT-4.1 Prompting Guide"
[4]: <https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills> "Anthropic Engineering, Equipping agents for the real world with Agent Skills"
[5]: <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents> "Anthropic Engineering, Effective context engineering for AI agents"
[6]: <https://code.claude.com/docs/en/memory> "Anthropic, How Claude remembers your project"
[7]: <https://arxiv.org/abs/2310.13548> "Sharma et al., Towards Understanding Sycophancy in Language Models"
[8]: <https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/AIE/AIE-0001__ai-as-onboarding-a-colleague/research.md> "Earlier research file, Why do others frame working with AI as onboarding a colleague? (AIE-0001)"
