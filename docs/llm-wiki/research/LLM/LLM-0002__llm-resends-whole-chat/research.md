---
type: research
title: 'Why does an LLM resend the whole chat on every message?'
description: 'The model keeps no state between requests, so each message must
  carry the full conversation as input, and that whole input is processed and
  billed again unless a cache covers it.'
confidence: open
confidence_reason: 'All four Sources come from one publisher, Anthropic, so none is independent.'
informs: [context-engineering, ai-cost]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T13:59:39Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://platform.claude.com/docs/en/api/messages
    title: 'Anthropic, Messages API reference'
  - id: 2
    resource: https://platform.claude.com/docs/en/build-with-claude/context-windows
    title: 'Anthropic, Context windows'
  - id: 3
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
    title: 'Anthropic, Prompt caching'
  - id: 4
    resource: https://platform.claude.com/docs/en/about-claude/pricing
    title: 'Anthropic, Pricing'
---

# Why does an LLM resend the whole chat on every message?

## Context

Asked to support the claim that a longer chat costs more per message, because everything said so far is paid for again. The claim concerns how a chat with a language model is built on the interface the model is served through, so the question is scoped to the request, not to the model's internals.

## Answer

The model itself holds no conversation between requests: the interface is stateless, so the caller supplies every earlier turn, the model's own replies included, with each new message. The model reads that whole input to produce the next reply, and the reply then becomes part of the input for the following turn. Input and output are priced per word-piece (token), so a longer chat means a larger input to pay for on every message. Caching can discount the repeated part, but only while the identical prefix is still cached.

## Findings

1. The Messages API is described as supporting "stateless multi-turn conversations"; the caller passes prior user and assistant turns in the `messages` parameter, and the model generates the next message from them [1].
2. Each turn's input phase contains all previous conversation history plus the current user message, and the generated response becomes part of the input for the next turn [2].
3. Previous turns are preserved completely in the context window, which holds the conversation history plus the newly generated output [2].
4. On models that keep earlier thinking blocks, those blocks are billed once as output and then again as input in later requests, "like the rest of the conversation history" [2].
5. Pricing lists separate per-million-token rates for base input tokens and output tokens, so every resent token is billed as input [4].
6. With prompt caching, a request whose prompt prefix is already cached reuses it; otherwise the full prompt is processed. Cache hits require identical prompt segments up to the cache breakpoint [3].
7. Cache reads are priced below base input: 0.1 times the base input price by default, with lower multipliers for some models [3].
8. The default cache lifetime is 5 minutes, refreshed each time the cached content is used, so a pause longer than that leaves the next request uncached [3].
9. Prompt caching changes what is paid for the cached tokens, not whether they count toward the context window [2].
10. Claude.ai-style chat interfaces can manage the window on a rolling first-in, first-out basis, so a chat product may differ from the raw API [2].

## Caveats

The sources describe one provider's API and pricing, and the pricing and cache multipliers vary by model and change over time. They do not describe how consumer chat apps assemble each request; that the app resends the history is an inference from the API's stateless design. They do not state outright that history "must" be resent: that follows from statelessness plus the instruction to pass prior turns. Whether other providers behave the same is not shown here.

[1]: https://platform.claude.com/docs/en/api/messages 'Anthropic, Messages API reference'
[2]: https://platform.claude.com/docs/en/build-with-claude/context-windows 'Anthropic, Context windows'
[3]: https://platform.claude.com/docs/en/build-with-claude/prompt-caching 'Anthropic, Prompt caching'
[4]: https://platform.claude.com/docs/en/about-claude/pricing 'Anthropic, Pricing'
