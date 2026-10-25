---
type: research
title: 'Why do consumer chat apps summarise older messages without showing it?'
description: 'Only Claude documents it: its app summarises earlier messages near
  the window limit so a chat can go on, with only an occasional status hint;
  ChatGPT, Gemini and Copilot document no such step.'
confidence: open
confidence_reason: 'That the apps summarise without showing it is inference.'
informs: [context-engineering]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-20T19:18:00Z
stale_after: 2027-04-20T00:00:00Z
sources:
  - id: 1
    resource: https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work
    title: 'Anthropic, How do usage and length limits work?'
  - id: 2
    resource: https://support.claude.com/en/articles/8606394-how-large-is-the-context-window-on-paid-claude-plans
    title: 'Anthropic, How large is the context window on paid Claude plans?'
  - id: 3
    resource: https://platform.claude.com/docs/en/build-with-claude/compaction
    title: 'Anthropic, Compaction overview'
  - id: 4
    resource: https://platform.claude.com/docs/en/build-with-claude/context-windows
    title: 'Anthropic, Context windows'
  - id: 5
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic, Effective context engineering for AI agents'
  - id: 6
    resource: https://developers.openai.com/api/docs/guides/compaction
    title: 'OpenAI, Compaction'
---

# Why do consumer chat apps summarise older messages without showing it?

## Context

Asked to support the claim that a chat app may quietly replace older messages with a summary, so the user cannot see how full the context window is. The question is about what the vendors document for their own consumer apps, and about the reasons they give.

## Answer

Claude is the one consumer app that documents it: when a chat nears the context window limit, the app summarises earlier messages so the conversation can continue, and it surfaces this only as an occasional "organizing its thoughts" message. The reasons the vendors give are to keep a long conversation going past the limit and to keep quality, cost and latency under control as it grows; none gives hiding it as a goal. For ChatGPT, Gemini and Copilot no vendor page documents summarisation of older messages in the app; what is documented is the context window limit, and for OpenAI's API an opaque compaction item. Whether those apps truncate or summarise silently is therefore unknown from primary sources.

## Findings

1. Claude's help centre says that, for users with code execution enabled, "Claude summarizes earlier messages to continue the conversation seamlessly" when a conversation approaches the context limit [1].
2. The same page says the full chat history is preserved so Claude can reference it after summarisation, and that such long conversations use more of the usage limit [1].
3. The only user-facing sign it describes is that "you may occasionally see that Claude is 'organizing its thoughts'"; the page announces no notice each time a summary happens, and no meter of how full the window is [1].
4. A second help page repeats this under "Automatic context management", says it lets conversations continue "indefinitely in most cases", and requires code execution to be enabled [2].
5. Anthropic's API docs describe the same mechanism as compaction: older turns are replaced by a summary Claude writes on the server, which keeps a long conversation inside the context window and keeps the active context small "because response quality degrades as a conversation grows" [3].
6. Anthropic's context window docs note that chat interfaces such as claude.ai can also manage the window on a rolling "first in, first out" basis, which is dropping the oldest content rather than summarising it [4].
7. Anthropic's engineering write-up defines compaction as summarising a conversation nearing the limit and starting a new window from the summary; it keeps decisions, unresolved bugs and details, and warns that over-aggressive compaction "can result in the loss of subtle but critical context whose importance only becomes apparent later" [5].
8. OpenAI documents compaction for its API: it reduces context size "while preserving state", helps "balance quality, cost, and latency as conversations grow", and returns an encrypted item that "is opaque and not intended to be human-interpretable" [6].
9. The OpenAI page describes the developer API, not the ChatGPT app; it does not say whether ChatGPT uses it [6].

## Caveats

- Findings 5 to 9 describe developer APIs and an engineering practice; they explain why vendors compact, and show the summary can be opaque, but do not prove how any consumer app behaves.
- No official Gemini, Copilot or ChatGPT help page on summarising older messages was found. The ChatGPT help centre returned HTTP 403 to the fetch, so a page there may exist and could not be read. Third-party claims about those apps are not used.
- "Without showing it" is an inference from Findings 1 to 4: the documents describe an occasional status message and no visible meter, not an intent to hide.
- Finding 6 means a consumer app may drop old messages instead of summarising them; the docs do not say which apps do which.
- Claude's behaviour is documented for users with code execution enabled and may change; the help pages are updated often.

[1]: <https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work> "Anthropic, How do usage and length limits work?"
[2]: <https://support.claude.com/en/articles/8606394-how-large-is-the-context-window-on-paid-claude-plans> "Anthropic, How large is the context window on paid Claude plans?"
[3]: <https://platform.claude.com/docs/en/build-with-claude/compaction> "Anthropic, Compaction overview"
[4]: <https://platform.claude.com/docs/en/build-with-claude/context-windows> "Anthropic, Context windows"
[5]: <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents> "Anthropic, Effective context engineering for AI agents"
[6]: <https://developers.openai.com/api/docs/guides/compaction> "OpenAI, Compaction"
