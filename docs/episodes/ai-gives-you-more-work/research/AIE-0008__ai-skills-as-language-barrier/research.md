---
type: research
title: 'Why does Matt Pocock describe the skills for working with AI as a language barrier?'
description: 'Pocock names a communication barrier between a person and an AI agent, caused by differing vocabulary, and answers it with shared-language and questioning skills.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T00:00:00Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://ai.engineer/talks/v4F1gFy-hqg-software-fundamentals-for-ai-coding
    title: 'Matt Pocock, Software Fundamentals Matter More Than Ever (AI Engineer Europe 2026)'
  - id: 2
    resource: https://github.com/mattpocock/skills
    title: 'Matt Pocock, Skills for Real Engineers (mattpocock/skills README)'
  - id: 3
    resource: https://podscripts.co/podcasts/the-pragmatic-engineer/ai-skills-with-matt-pocock
    title: 'Gergely Orosz and Matt Pocock, AI Skills with Matt Pocock (The Pragmatic Engineer, transcript)'
---

# Why does Matt Pocock describe the skills for working with AI as a language barrier?

## Context

Asked to support the claim that working well with AI is a matter of communication skill, attributed to Matt Pocock. The question scopes to what Pocock himself says, in his talks, interviews and skills repository.

## Answer

Pocock does not use the exact phrase "language barrier" in the sources found. He says there is a "communication barrier" or "communication gap" between a person and an AI agent, and he locates it in language: the person and the agent do not share vocabulary, so the agent misreads intent and uses too many words. His skills are the remedy: questioning the person until they align (`/grill-me`), and building a shared domain language (`/grill-with-docs`). The management reading, that these are management skills, is not in these sources.

## Findings

1. Pocock says of the person and the AI: "there is a communication barrier there" [1].
2. He locates the gap in vocabulary: the AI "using too many words", "not ... using the same language", so "you need to establish some kind of shared language", just as a developer and a domain expert have a "language gap" [1].
3. His fix is a markdown file of terms the person and the AI have in common, based on the domain-driven design idea of a ubiquitous language, which lets the AI "think in a less verbose way"; he calls it tip number two, "create a shared language with the AI" [1].
4. In interview he says "there is a communication gap between you and the agent, right? There is a barrier there", and that you have to communicate your values to it [3].
5. In the same interview he asks how to "start talking a common language between me and the agents, this communication barrier again", credits Eric Evans on ubiquitous language, and says that once the agent uses the domain language "the difference is night and day" because "suddenly you're speaking the same language" [3].
6. His skills repository states the same diagnosis in writing: "There is a communication gap between you and the agent", fixed by a grilling session in which the agent asks detailed questions; and "The Fix for this is a shared language", because developers and domain experts "are usually speaking different languages" and agents must "figure out the jargon as they go" [2].
7. He says precise language is the learnable skill: "just having the language to explain that ... is the whole game" [3].

## Caveats

No source found carries the exact words "language barrier"; the phrase is a compression of "communication barrier" plus "language gap", and should not be quoted as his. Pocock frames the skills as software-engineering fundamentals for coding agents, not as management skills; calling them management skills is this project's inference. The Pragmatic Engineer transcript is a third-party transcript of the episode; the audio was not checked, and only the first 100,000 of its 114,003 characters were read. Pocock's YouTube videos, newsletter and aihero.dev articles beyond the skills index were not found to use the phrase.

[1]: <https://ai.engineer/talks/v4F1gFy-hqg-software-fundamentals-for-ai-coding> "Matt Pocock, Software Fundamentals Matter More Than Ever (AI Engineer Europe 2026)"
[2]: <https://github.com/mattpocock/skills> "Matt Pocock, Skills for Real Engineers (mattpocock/skills README)"
[3]: <https://podscripts.co/podcasts/the-pragmatic-engineer/ai-skills-with-matt-pocock> "Gergely Orosz and Matt Pocock, AI Skills with Matt Pocock (The Pragmatic Engineer, transcript)"
