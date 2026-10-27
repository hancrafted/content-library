---
type: research
title: 'Why does asking for a source per claim help with unsupported claims in a web-search answer?'
description: 'A source per claim makes each claim checkable by a person and a later chat, but the studies do not show it makes the model state fewer unsupported claims, and cited sources are often wrong.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-27T23:22:37Z
stale_after: 2027-10-27T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2304.09848
    title: 'Liu, Zhang, Liang, Evaluating Verifiability in Generative Search Engines'
  - id: 2
    resource: https://arxiv.org/abs/2305.14627
    title: 'Gao et al., Enabling Large Language Models to Generate Text with Citations'
  - id: 3
    resource: https://arxiv.org/abs/2112.12870
    title: 'Rashkin et al., Measuring Attribution in Natural Language Generation Models'
  - id: 4
    resource: https://arxiv.org/abs/2402.02008
    title: 'Wu et al., How well do LLMs cite relevant medical references? (SourceCheckup preprint)'
  - id: 5
    resource: https://www.cjr.org/tow_center/we-compared-eight-ai-search-engines-theyre-all-bad-at-citing-news.php
    title: 'Tow Center for Digital Journalism, AI Search Has A Citation Problem'
  - id: 6
    resource: https://platform.claude.com/docs/en/build-with-claude/citations
    title: 'Anthropic, Citations'
  - id: 7
    resource: https://developers.openai.com/api/docs/guides/tools-web-search
    title: 'OpenAI, Web search'
---

# Why does asking for a source per claim help with unsupported claims in a web-search answer?

## Context

Asked to back a check in a prompt-authoring skill: research prompts ask for a source URL next to every claim (price, distance, rating). The person can then check each claim, and the next chat can tell sourced claims from unsourced ones. The prompts run in consumer chats with web search. The question is why this reduces unsupported claims.

## Answer

The evidence supports a weaker claim than the question assumes. A source next to each claim makes the claim checkable: a person or a later chat can open the link and see whether it holds, and a claim with no source is visible as such. No source we read shows that asking for sources makes a model state fewer unsupported claims. Audits of search chats that already cite sources find that many statements are not fully backed by the cited pages, that many citations do not support their sentence, and that some URLs are invented or broken. So the check is worth keeping for verifiability, but its text should not promise that sourced claims are true.

## Findings

1. Auditing four generative search engines that give inline citations, the authors found that on average only 51.5% of sentences were fully supported by citations and only 74.5% of citations supported their sentence. The answers were fluent and looked informative [1].
2. On a long-form question benchmark built to test cited answers, even the best models lacked complete citation support about 50% of the time [2].
3. A framework for judging whether model statements are attributable to identified sources exists so that humans can check a statement against its source. It measures support; it does not claim that asking for sources improves it [3].
4. A medical preprint tested five LLMs on 1,200 questions and over 40,000 statement and source pairs. Between about 50% and 90% of responses were not fully supported by the sources they gave, and about 30% of statements from GPT-4 with retrieval were unsupported [4].
5. The Tow Center tested eight AI search tools with 1,600 queries on news articles. More than 60% of answers were wrong, error rates ran from 37% to 94% by tool, and the tools seldom hedged. Gemini and Grok 3 cited invented or broken URLs in more than half of their responses [5].
6. In the Tow Center test, paid tiers answered more correctly than free ones but also had higher error rates, because they gave confident wrong answers instead of declining [5].
7. Anthropic describes its Citations feature as returning the exact passages that support each claim so that answers can be verified. Its stated gains are in citation reliability and quality: the API extracts the cited text itself, so pointers are valid, and in Anthropic's evaluations it cites more relevant quotes than prompt-only approaches [6].
8. Anthropic's prompt guidance for long documents says to ask Claude to quote the relevant parts first. The stated reason is focus on the relevant content, not fewer false claims [6].
9. OpenAI's web search returns inline citations by default, with the URL, title and location of the cited source, and requires them to be clearly visible and clickable to users. The stated purpose is showing users where information came from [7].

## Caveats

No source here runs the experiment the question implies: the same prompt with and without a request for a source per claim, counting unsupported claims. Findings 1, 2, 4 and 5 measure systems that already cite, so they show the limits of citing, not the effect of asking. The "why" is therefore not shown; the supported benefit is checkability. Anthropic's Citations (finding 7) is an API feature with provided documents; a pasted prompt in a consumer chat does not get its guarantees. Source 4 is the arXiv preprint; the Nature Communications version was not readable and may report different numbers. Source 3 was read by its abstract, and the arXiv title differs from the AIS name in the question. Studies date from 2021 to 2025, use specific models and mostly news or medical questions, not prices or ratings, and current consumer chats may do better or worse. Source 8 is on long-document tasks, not web search. Sources 6 and 7 are vendor documentation and describe intent, not measured results.

[1]: https://arxiv.org/abs/2304.09848 'Liu, Zhang, Liang, Evaluating Verifiability in Generative Search Engines'
[2]: https://arxiv.org/abs/2305.14627 'Gao et al., Enabling Large Language Models to Generate Text with Citations'
[3]: https://arxiv.org/abs/2112.12870 'Rashkin et al., Measuring Attribution in Natural Language Generation Models'
[4]: https://arxiv.org/abs/2402.02008 'Wu et al., How well do LLMs cite relevant medical references? (SourceCheckup preprint)'
[5]: https://www.cjr.org/tow_center/we-compared-eight-ai-search-engines-theyre-all-bad-at-citing-news.php 'Tow Center for Digital Journalism, AI Search Has A Citation Problem'
[6]: https://platform.claude.com/docs/en/build-with-claude/citations 'Anthropic, Citations'
[7]: https://developers.openai.com/api/docs/guides/tools-web-search 'OpenAI, Web search'
