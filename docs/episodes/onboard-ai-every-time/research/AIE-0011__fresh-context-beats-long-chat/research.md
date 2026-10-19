---
type: research
title: 'Why does a fresh, focused context outperform a long, accumulated chat?'
description: 'A fresh, focused context outperforms a long chat because accuracy
  falls as input grows and a model that took a wrong turn leans on its own
  earlier attempts and does not recover.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T14:09:38Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2505.06120
    title: 'Laban, Hayashi, Zhou, Neville, LLMs Get Lost In Multi-Turn Conversation'
  - id: 2
    resource: https://www.trychroma.com/research/context-rot
    title: 'Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts
      LLM Performance'
  - id: 3
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic, Effective context engineering for AI agents'
  - id: 4
    resource: https://code.claude.com/docs/en/best-practices
    title: 'Anthropic, Best practices for Claude Code'
---

# Why does a fresh, focused context outperform a long, accumulated chat?

## Context

Asked to support the claim that restarting with a clean, well-specified prompt beats continuing a long conversation. The claim has two parts: what a long context costs a model, and what a restart recovers. The question is scoped to the model's context, not to how a person remembers a conversation.

## Answer

A long chat hurts for two measured reasons. Model accuracy falls as the input grows, even on simple tasks [2][3], and in multi-turn conversations models make early assumptions, answer too soon and lean on those earlier answers, so a wrong turn is not recovered [1]. A fresh context removes both: it holds only the relevant material, and one consolidated instruction replaces the scattered turns. The authors of the multi-turn study recommend exactly this restart, and Anthropic's Claude Code guidance gives the same advice, which is vendor practice rather than a measurement [1][4]. How much a restart recovers is shown only in part: consolidating the instructions mid-conversation recovered 15-20% of the lost performance in one test, not all of it [1].

## Findings

1. Across the top LLMs tested and six generation tasks, performance was worse in multi-turn conversation than in the usual single-turn, fully-specified setting, "with an average drop of 39%", made up of "a minor loss in aptitude and a significant increase in unreliability" [1].
2. The mechanism the authors name: "LLMs often make assumptions in early turns and prematurely attempt to generate final solutions, on which they overly rely"; "when LLMs take a wrong turn in a conversation, they get lost and do not recover" [1].
3. Lowering the temperature did not fix it: with both the simulated user and the assistant at temperature 0, multi-turn unreliability stayed around 30% [1].
4. The authors advise users to restart: "starting a new conversation that repeats the same information might yield significantly better outcomes", ideally after asking the model to "consolidate everything I've told you so far" and pasting the result into the new chat; "consolidating instruction requirements into a single instruction is an effective strategy". They call these stopgaps, not a principled fix [1].
5. In the authors' recap and snowball tests, repeating all earlier requirements near the end of the conversation recovered part of the gap: for GPT-4o, Full 93.0, Sharded 59.1, Recap 76.6, Snowball 65.3. Snowball, the realistic variant, mitigated the Full-to-Sharded drop by 15-20%. Neither matched the one-turn Full (93.0) or Concat (90.9) scores [1].
6. Length alone degrades results. Chroma tested 18 LLMs, including GPT-4.1, Claude 4, Gemini 2.5 and Qwen3, and found "model performance consistently degrades with increasing input length" across all experiments [2].
7. Irrelevant material hurts: "Even a single distractor reduces performance relative to the baseline (needle only)", and four distractors made it worse [2].
8. Focus beats volume on the same question. On LongMemEval, prompts of about 300 tokens holding only the relevant material scored "significantly higher" than full prompts of about 113k tokens, for all models tested [2].
9. Anthropic explains the cost in attention terms: models have an "attention budget", every token attends to every other ("n² pairwise relationships for n tokens"), and "the model's ability to accurately recall information from that context decreases" as the window grows [3]. Its remedy for long tasks includes sub-agents that "handle focused tasks with clean context windows" [3].
10. Claude Code's guidance applies this directly: "Claude's context window fills up fast, and performance degrades as it fills"; run `/clear` between unrelated tasks; after two failed corrections, "`/clear` and start fresh with a more specific prompt", because "a clean session with a better prompt almost always outperforms a long session with accumulated corrections" [4].
11. The same guidance applies the restart to review and execution: have a second session review code "since Claude won't be biased toward code it just wrote", and after interviewing for a spec, "start a fresh session to execute it", since the new session "has clean context focused entirely on implementation" [4].

## Caveats

- The multi-turn study simulates users and splits fully-specified tasks into shards revealed turn by turn; it measures that setup, not a person's real chat, and its models are 2025 models. A fresh start is the authors' recommendation, and their tests measure consolidation inside the conversation, not an actual new chat; "restarts help" is an inference from them.
- The context-rot report is a technical report, not peer reviewed. Its LongMemEval gap was widest for Claude models, mostly because they declined to answer when unsure rather than answering wrongly [2].
- The Claude Code claim that a clean session "almost always" outperforms a long one is vendor guidance without a measurement [4]. The same page says that sometimes "you should let context accumulate because you're deep in one complex problem and the history is valuable": a fresh start earns its place for separate pieces and for derailed chats, not for every continuation.
- A fresh context only helps if the new prompt carries what mattered; the restart costs the effort of writing the consolidated brief.

[1]: <https://arxiv.org/abs/2505.06120> "Laban, Hayashi, Zhou, Neville, LLMs Get Lost In Multi-Turn Conversation"
[2]: <https://www.trychroma.com/research/context-rot> "Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance"
[3]: <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents> "Anthropic, Effective context engineering for AI agents"
[4]: <https://code.claude.com/docs/en/best-practices> "Anthropic, Best practices for Claude Code"
