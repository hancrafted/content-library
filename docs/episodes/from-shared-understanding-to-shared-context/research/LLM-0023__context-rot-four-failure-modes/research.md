---
type: research
title: 'Why does more context make a language model worse, and which failure modes and fixes does the research name?'
description: 'More context makes models worse because length and clutter degrade output; Breunig names four failure modes, poisoning, distraction, confusion and clash, each with a fix.'
generated:
  by: claude-code/sonnet-5.5
  at: 1970-01-01T00:00:00Z
stale_after: 2027-11-11T00:00:00Z
sources:
  - id: 1
    resource: docs/llm-wiki/research/LLM/LLM-0022__context-rot-from-muddy-context/research.md
    title: 'content-library research, Why does a language model''s output get worse when its context holds distractors, contradictions or unclear instructions?'
  - id: 2
    resource: docs/episodes/ai-attention-span/research/LLM-0007__context-rot-as-window-fills/research.md
    title: 'content-library research, Why does a language model''s output quality drop as its context window fills?'
  - id: 3
    resource: https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html
    title: 'Drew Breunig, How Long Contexts Fail'
  - id: 4
    resource: https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html
    title: 'Drew Breunig, How to Fix Your Context'
  - id: 5
    resource: https://www.youtube.com/watch?v=BwXremQ-i6I
    title: 'IBM Technology, Context Engineering for AI Agents: 4 Failure Modes to Avoid'
  - id: 6
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic, Effective context engineering for AI agents'
---

# Why does more context make a language model worse, and which failure modes and fixes does the research name?

## Context

Asked to support the claim that a model's output degrades when its context grows or fills with the wrong material, and that each kind of degradation has a matching repair. The claim is about the kinds of context failure and their fixes, not about one model or one benchmark.

## Answer

More context makes output worse for two reasons: length itself degrades results, and clutter in the window does further damage [2][1]. The four-way taxonomy of that clutter, context poisoning, distraction, confusion and clash, was named by Drew Breunig in June 2025 [3], and the IBM Technology video presents the same four, each paired with one fix: validate, compact, curate, prune [5]. Poisoning is an error that gets saved and reused, distraction is a long history that steers the model, confusion is superfluous material such as surplus tools, and clash is conflicting material in the window [3]. The pairing of each mode with exactly one fix is the video's framing; Breunig's own fixes are a different, six-item list, and the sources agree that the fixes overlap rather than map one to one [4][6].

## Findings

1. Output quality falls as the window fills, and length alone causes part of it, even with perfect retrieval; this is the "context rot" the four failure modes build on [2].
2. Irrelevant, contradictory and underspecified material lowers accuracy beyond length: distractors, content that clashes with what is right, and piecemeal instructions each degrade output, and plausible-but-off-topic passages hurt where random ones can help [1].
3. The taxonomy predates the IBM video: Breunig's "How Long Contexts Fail" (22 June 2025) names context poisoning, distraction, confusion and clash [3].
4. Poisoning: a hallucination or other error enters the context and keeps being referenced. Breunig cites the Gemini 2.5 technical report, where false game-state information in an agent's goals and summaries was slow to undo [3].
5. Distraction: the context grows so long that the model leans on it and neglects what it learned in training. Breunig reports a Gemini agent past about 100k tokens repeating past actions instead of planning, and a Databricks study in which Llama 3.1 405b's correctness fell from around 32k tokens [3].
6. Confusion: superfluous material produces a weaker response. On the Berkeley Function-Calling Leaderboard every model does worse with more than one tool, and a quantized Llama 3.1 8b failed with 46 tools but succeeded with 19 [3].
7. Clash: new information conflicts with what is already in the context, which Breunig calls a more serious form of confusion. In a Microsoft and Salesforce study of piecemeal ("sharded") prompts, scores fell 39% on average and o3 fell from 98.1 to 64.1, because early wrong answers stayed in the context [3]; the 39% average also appears in the multi-turn study summarised in [1].
8. The IBM Technology video pairs the modes with fixes: poisoning with validate (check a conclusion against real tests before saving it), distraction with compact (condense history into summaries or external files), confusion with curate (keep only the tools the job needs), and clash with prune (remove outdated material or start a fresh window) [5].
9. Breunig's companion post lists six fixes: RAG, tool loadout ("selecting only relevant tool definitions"), context quarantine, context pruning ("removing irrelevant or otherwise unneeded information"), context summarization and context offloading [4]. His tool-loadout figures: picking under 30 tools improved selection accuracy up to threefold, and a tool recommender raised Llama 3.1 8b by 44% on the Berkeley leaderboard [4].
10. Anthropic describes compaction as "summarizing its contents, and reinitiating a new context window with the summary", warns that "overly aggressive compaction can result in the loss of subtle but critical context", and recommends sub-agents with clean windows that return a condensed summary [6]. Starting a fresh window is the common thread behind compact and prune.

## Caveats

- The YouTube page could not be read: its text, channel and date were not retrievable, and no transcript was available. Finding 8, and the claim that the video presents Breunig's four modes, rest on a secondary summary on daily.dev (https://daily.dev/posts/context-engineering-for-ai-agents-4-failure-modes-to-avoid-zreztqdfs) that names IBM Technology as the channel. A human should confirm against the video before Slide 12 states the pairing as IBM's.
- Breunig's taxonomy is a practitioner blog post, not a peer-reviewed result. The studies it cites measure retrieval, tool selection or multi-turn tasks; reading them as four separate failure modes is his framing, and a given failure can fit more than one mode.
- Breunig's descriptions of the Gemini 2.5 Pokémon agent come from his post; the Gemini report itself was not read here.
- The one-fix-per-mode pairing is a teaching simplification. Compaction can launder a bad fact into a clean summary, so it does not repair poisoning; this is inference from the definitions [3][4][6], not a measured result.
- Counter-evidence to "more irrelevant text is always worse": random documents helped in one retrieval setting [1].
- Findings concern models of 2024 and 2025; effect sizes differ by model and task.

[1]: <docs/llm-wiki/research/LLM/LLM-0022__context-rot-from-muddy-context/research.md> "content-library research, Why does a language model's output get worse when its context holds distractors, contradictions or unclear instructions?"
[2]: <docs/episodes/ai-attention-span/research/LLM-0007__context-rot-as-window-fills/research.md> "content-library research, Why does a language model's output quality drop as its context window fills?"
[3]: <https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html> "Drew Breunig, How Long Contexts Fail"
[4]: <https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html> "Drew Breunig, How to Fix Your Context"
[5]: <https://www.youtube.com/watch?v=BwXremQ-i6I> "IBM Technology, Context Engineering for AI Agents: 4 Failure Modes to Avoid"
[6]: <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents> "Anthropic, Effective context engineering for AI agents"
