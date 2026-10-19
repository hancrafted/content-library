---
type: research
title: 'Why does an LLM forget everything between chats?'
description: 'A model keeps nothing between requests, so it only knows what the
  current context holds; any memory across chats is text an application stores
  and sends again.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T13:59:10Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://platform.claude.com/docs/en/build-with-claude/working-with-messages
    title: 'Anthropic, Using the Messages API'
  - id: 2
    resource: https://platform.claude.com/docs/en/build-with-claude/context-windows
    title: 'Anthropic, Context windows'
  - id: 3
    resource: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
    title: 'Anthropic, Memory tool'
  - id: 4
    resource: https://arxiv.org/abs/2005.14165
    title: 'Brown et al., Language Models are Few-Shot Learners'
---

# Why does an LLM forget everything between chats?

## Context

Asked to support the claim that an AI assistant starts every new chat with no knowledge of earlier ones. The claim is about where an LLM's working information lives and what carries it from one conversation to the next, not about how the model was trained.

## Answer

An LLM holds nothing between requests. Its only working memory is the context window, the text sent with the current request, and a new chat starts with an empty window. What looks like memory inside a chat is the application sending the whole history again each turn. Memory across chats exists only when an application stores notes outside the model and puts them back into the context.

## Findings

1. The Messages API is stateless, so the caller always sends the full conversational history with each request [1].
2. The context window is all the text a model can reference when generating a response, described as a "working memory" distinct from the corpus the model was trained on [2].
3. Each turn's input contains all previous conversation history plus the new user message, and the response becomes part of the next turn's input [2].
4. A task can be given to the model purely as text in its input, with no gradient updates or fine-tuning, so instructions and examples in the prompt shape its behaviour without changing its weights [4].
5. Anthropic's memory tool lets Claude store and retrieve information across conversations in memory files, so it can build up knowledge without keeping everything in the context window [3].
6. The memory tool runs client-side: Claude only requests file operations and the application executes them against storage the developer controls, so memory lives entirely in the application [3].
7. Memory-tool usage adds a system instruction to check the memory directory first and warns that the context window might be reset at any moment, so progress not recorded in memory is lost [3].

## Caveats

The Sources are Anthropic's API documentation and the GPT-3 paper. Findings 1 to 3 and 5 to 7 describe the Claude API and its memory tool, not every chat product. Consumer chat apps can offer their own saved-memory features, which these Sources do not cover. That such features work by storing text and re-inserting it into the context follows from Findings 5 and 6 and is an inference for products other than Anthropic's. Finding 4 shows that the weights are not updated by a prompt; it does not itself state that a chat leaves the weights unchanged afterwards.

[1]: <https://platform.claude.com/docs/en/build-with-claude/working-with-messages> "Anthropic, Using the Messages API"
[2]: <https://platform.claude.com/docs/en/build-with-claude/context-windows> "Anthropic, Context windows"
[3]: <https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool> "Anthropic, Memory tool"
[4]: <https://arxiv.org/abs/2005.14165> "Brown et al., Language Models are Few-Shot Learners"
