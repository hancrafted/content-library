---
type: research
title: 'Why does a web search fill the context window with whole pages rather
  than just the answer?'
description: 'A search tool returns retrieved page content to the model, which
  composes the answer itself, so the pages sit in the context window as input
  tokens unless the tool filters them first.'
confidence: open
confidence_reason: 'Developer-API documentation only; the step to the apps is inferred.'
informs: [context-engineering, ai-cost]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-20T19:17:38Z
stale_after: 2027-04-20T00:00:00Z
sources:
  - id: 1
    resource: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
    title: 'Anthropic, Web search tool (Claude API documentation)'
  - id: 2
    resource: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool
    title: 'Anthropic, Web fetch tool (Claude API documentation)'
  - id: 3
    resource: https://developers.openai.com/api/docs/guides/tools-web-search
    title: 'OpenAI, Web search (API documentation)'
---

# Why does a web search fill the context window with whole pages rather than just the answer?

## Context

Asked to support the claim that one innocent question to a chat assistant can add many pages of text to its context window. The claim concerns how search tools hand material to a language model, not how a search engine ranks results.

## Answer

A search tool does not return an answer; it returns retrieved web content, and the model reads that content and writes the answer itself. With basic search, every result is handed over unfiltered, much of it irrelevant to the request, and enters the context window as ordinary input tokens that stay there for later turns. The vendors document this cost and offer ways to trim it (filtering before the content reaches the window, caps on returned tokens), but basic search behaves this way. How many pages a given consumer app loads per question is not published in these sources.

## Findings

1. With basic web search, every search result is loaded into the model's context window, and much of that content can be irrelevant to the request [1].
2. Search results retrieved during a conversation are counted as input tokens, both in the search iterations of a single turn and in subsequent conversation turns, so they remain part of the window [1].
3. The search results are passed back into later requests and restored in the model's context; the API decrypts the stored result content on later turns for this purpose [1].
4. A single request can run many searches: simple factual queries typically use 1 to 3, and comparative or multi-entity research can use 10 or more [1].
5. A fetched page is loaded as its full text. Anthropic puts an average web page (10 kB) at about 2,500 tokens, a large documentation page (100 kB) at about 25,000 tokens, and a research paper PDF (500 kB) at about 125,000 tokens [2].
6. Fetching full pages "can quickly consume tokens, especially when only specific information is needed from large documents", and the tool offers a token cap (`max_content_tokens`) that truncates content past the limit [2].
7. The remedy is to filter before the window: with dynamic filtering the model writes and runs code that keeps only relevant content, so only that reaches the context window [1][2].
8. OpenAI describes the same shape: a non-reasoning search simply "passes along the search tool's responses", deep research can tap "hundreds of sources", and the search context window is limited to 128k even when the model's own window is larger [3].
9. OpenAI's `search_context_size` setting controls how much search-result context is made available to the model, and does not set an exact token count or guarantee a number of sources [3].

## Caveats

The sources describe developer APIs. Consumer chat apps are built on the same kind of tool, but none of these sources states how many pages or tokens a given app loads per question, or whether it filters first; that step from API to app is an inference. Finding 8 quotes OpenAI's description of its non-reasoning mode; the exact behaviour differs between vendors and versions. Token figures are Anthropic's rough per-size estimates, not measurements.

[1]: <https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool> "Anthropic, Web search tool (Claude API documentation)"
[2]: <https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool> "Anthropic, Web fetch tool (Claude API documentation)"
[3]: <https://developers.openai.com/api/docs/guides/tools-web-search> "OpenAI, Web search (API documentation)"
