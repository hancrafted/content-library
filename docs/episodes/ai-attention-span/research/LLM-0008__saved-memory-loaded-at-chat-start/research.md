---
type: research
title: 'Why do chat assistants load saved memory at the start of a chat?'
description: 'A model keeps nothing between chats, so an app stores notes about
  you and puts them into the new, empty context window so the assistant seems to
  know you.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-20T19:15:08Z
stale_after: 2027-04-20T00:00:00Z
sources:
  - id: 1
    resource: docs/llm-wiki/research/LLM/LLM-0003__llm-memory-between-chats/research.md
    title: 'Han, Why does an LLM forget everything between chats? (earlier research
      file, excludes consumer chat apps)'
  - id: 2
    resource: https://code.claude.com/docs/en/memory
    title: 'Anthropic, How Claude remembers your project'
  - id: 3
    resource: https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-conversations
    title: 'Anthropic, Use Claude''s chat search and memory to build on previous
      conversations'
  - id: 4
    resource: https://support.google.com/gemini/answer/16598625
    title: 'Google, Manage what Gemini remembers about you and customize responses'
  - id: 5
    resource: https://help.openai.com/en/articles/8590148-memory-faq
    title: 'OpenAI, Memory in ChatGPT'
---

# Why do chat assistants load saved memory at the start of a chat?

## Context

Asked to support the claim that what an assistant seems to remember about you is text the app puts into the context window, and that this memory therefore competes with the conversation for space. The question is about consumer chat assistants' saved-memory features and the mechanism behind them, which an earlier research file left out.

## Answer

A new chat starts with an empty context window and the model keeps nothing between chats, so a chat assistant can only know you if the app stores notes about you and puts them in front of the model again. Claude Code states this mechanism outright: its memory is loaded at the start of every conversation, as context that counts against the window. The Claude, Gemini and ChatGPT consumer apps document the effect, a new chat that already knows you, but not the loading itself, so that they load it at the start is an inference. ChatGPT's documentation adds that it does not search memory for every response, only when relevant context is likely to improve one.

## Findings

1. A model holds nothing between requests; memory across chats exists only when an application stores notes outside the model and puts them back into the context [1].
2. Claude Code starts each session with a fresh context window, and two memory mechanisms carry knowledge across sessions: instructions the user writes and notes Claude writes itself [2].
3. Both are loaded at the start of every conversation, and Claude treats them as context, not enforced configuration [2].
4. Loading has a cost: longer instruction files consume more context and reduce adherence, and only the first 200 lines or 25KB of the auto-memory index load at the start of a conversation [2].
5. Claude's consumer app saves memory as a set of individual topics while you chat, and the effect is that "your next conversation already knows" what changed [3].
6. In Claude, past-chat search is a separate feature that is not preloaded: Claude fetches results when asked, and the searches appear as tool calls [3].
7. Gemini will "remember the information or instructions you share with it, even in new chats", and its instructions can be set to apply to every chat [4].
8. ChatGPT's FAQ answers whether it searches your history for every response with "No. ChatGPT looks for relevant context when it is likely to improve a response" [5].

## Caveats

The consumer-app sources describe what memory does for the user, not how it reaches the model. Neither the Claude help article, the Gemini help page nor the ChatGPT FAQ says that a stored memory is placed into the context window at the start of a chat. That it is follows from Finding 1 and from Findings 2 and 3 for Claude Code, and is an inference for the consumer apps. The apps differ: Claude's app marks past-chat search as fetched on demand, and ChatGPT retrieves relevant context rather than loading everything, so "loaded at the start" fits saved memory best and does not describe every cross-chat feature. The ChatGPT FAQ could not be fetched directly, so Finding 8 rests on a search result's quotation of it. Product behaviour changes often; the pages describe versions current in October 2026.

[1]: <docs/llm-wiki/research/LLM/LLM-0003__llm-memory-between-chats/research.md> "Han, Why does an LLM forget everything between chats? (earlier research file, excludes consumer chat apps)"
[2]: <https://code.claude.com/docs/en/memory> "Anthropic, How Claude remembers your project"
[3]: <https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-conversations> "Anthropic, Use Claude's chat search and memory to build on previous conversations"
[4]: <https://support.google.com/gemini/answer/16598625> "Google, Manage what Gemini remembers about you and customize responses"
[5]: <https://help.openai.com/en/articles/8590148-memory-faq> "OpenAI, Memory in ChatGPT"
