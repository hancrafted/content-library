---
type: research
description: 'Relevant, specific context and a fully specified brief measurably lift LLM output, but padding, noise and boilerplate overviews do not help and can hurt.'
question: 'Why does richer context and a clearer brief measurably improve AI output?'
researched_on: 2026-10-12T00:00:00Z
stale_after: 2027-04-12T00:00:00Z
---

# Why does richer context and a clearer brief measurably improve AI output?

## Context

Asked to support the claim that the effort a person puts into briefing an AI before it starts changes the result, and to say how far that claim can be pushed. Vendor guidance says it does but offers no measurement; studies of long inputs measure recall falling as input grows, which is the opposite pressure. This file collects measured effects of adding context and clarifying the task, and the measured cases where more context did nothing or hurt.

## Answer

A model can only use what is in its context, so a brief that supplies the missing facts and the unstated requirements removes the guessing that causes wrong output. The measurement is clearest for facts: when a model is handed the one relevant document, its question-answering accuracy rises from 56.1% to 88.3% for GPT-3.5-Turbo compared with no documents [4]. The measurement is also clear for requirements: models infer unstated requirements only about 41% of the time and underspecified prompts are twice as likely to regress when the model or prompt changes [6], and tasks given piece by piece in conversation instead of fully specified up front lose 39% of performance on average [7]. The improvement is conditional, not automatic: irrelevant context sharply degrades reasoning [8], recall falls as input grows [4][5], and repository context files that restate what an agent can discover on its own did not generally improve coding-agent success and raised cost by over 20% in one study, a still-revised preprint whose first version reported reduced success [9], while another study found an AGENTS.md associated with 28.64% lower median runtime and 16.58% fewer output tokens [10], so the cost claim is disputed. The measured gain comes from relevant, specific, non-discoverable information, kept short, not from volume.

## Findings

1. Anthropic's guidance frames the claim without measuring it: "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows. The more precisely you explain what you want, the better the result." This is vendor guidance, not an effect size [1].
2. Anthropic's own pruning rule already holds the tension: context is "a finite resource with diminishing marginal returns", the target is "the minimal set of information that fully outlines your expected behavior", and "minimal does not necessarily mean short" [2].
3. Supplying the right facts measurably helps. In multi-document question answering, accuracy with no documents (closed-book) versus with only the one relevant document (oracle) was: GPT-3.5-Turbo 56.1% vs 88.3%, Claude-1.3 48.3% vs 76.1%, LongChat-13B 35.0% vs 83.4%, MPT-30B-Instruct 31.5% vs 81.9% (Table 1) [4]. These are 2023 models and a retrieval task, so the direction transfers, the size does not.
4. The same study shows the limit. Accuracy depends on where the relevant document sits, and for GPT-3.5-Turbo "in the worst case, performance in 20- and 30-document settings is lower than performance without any input documents (i.e., closed-book performance; 56.1%)". Adding documents helped only while the relevant one stayed usable [4].
5. Underspecified prompts are a measured source of error. LLMs guess a missing requirement correctly about 41.1% of the time; underspecified prompts are "2x as likely to regress across model or prompt changes", with accuracy drops above 20% in some cases [6]. Listing every requirement does not fully fix it, because models follow instructions imperfectly and requirements can conflict, which is why the authors recommend discovering and monitoring requirements rather than writing a longer prompt [6].
6. Clarity up front beats clarity piecemeal. Across 6 generation tasks and more than 200,000 simulated conversations, every tested model did worse when the task arrived underspecified over several turns than when fully specified in one turn; the average drop was 39%, mostly an increase in unreliability rather than lost ability. Models "make assumptions early, attempt final answers too soon, and then lean heavily on those attempts" [7].
7. Irrelevant context hurts. On grade-school math problems with unrelated sentences added (GSM-IC), "the model performance is dramatically decreased when irrelevant information is included". An explicit instruction to ignore irrelevant information was one partial remedy [8].
8. Recall degrades as input grows, for all models tested. Chroma tested 18 LLMs and found "their performance grows increasingly unreliable as input length grows" even on simple tasks [5]. Anthropic: "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases", with "more gentle degradation" in some models but present in all [2]. Claude Code docs: "Claude's context window fills up fast, and performance degrades as it fills" [3].
9. Real-world briefing files give a mixed measured picture. Across SWE-bench and a new set of issues from repositories with developer-written context files, "providing context files does not generally improve task success rates" and raised inference cost by over 20% on average; "repository overviews, although popular and recommended by model providers, are not helpful"; but "context files are useful for specifying non-standard coding practices". Agents followed the instructions, which led to more testing and exploration [9].
10. In the other direction, a study of 10 repositories and 124 pull requests found an AGENTS.md file was associated with 28.64% lower median runtime and 16.58% fewer output tokens, with comparable task completion. This measures efficiency, not correctness, and is framed as an association [10].
11. A controlled ablation of 288 runs on 17 tasks with Claude Code and Codex found no measurable effect of context strategy on correctness (effects bounded to roughly 10 to 15 percentage points), and attributed failures to implementation skill rather than missing repository knowledge [11].
12. Mechanism that earlier files established and this answer builds on: a fresh session "begins with a fresh context window", the model never saw your private project, and CLAUDE.md or AGENTS.md is loaded as text and treated "as context, not enforced configuration"; bloated files lead Claude to ignore the actual instructions, so a line stays only if removing it would cause mistakes [12][13].
13. Instructions given only in chat do not reliably survive compaction ("instructions from early in the conversation can get lost"), so the durable brief lives in a file re-read from disk [13].

## Sources

1. Anthropic, Prompting best practices, section "Be clear and direct" (the page the older be-clear-and-direct address now redirects to) — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices — accessed 2026-10-12
2. Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — accessed 2026-10-12
3. Anthropic, Best practices for Claude Code — https://code.claude.com/docs/en/best-practices — accessed 2026-10-12
4. Liu et al., Lost in the Middle: How Language Models Use Long Contexts, TACL 2024, Table 1 and section 2.3 — https://arxiv.org/pdf/2307.03172 — accessed 2026-10-12
5. Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance — https://research.trychroma.com/context-rot — accessed 2026-10-12
6. Yang, Shi, Ma, Liu, Kästner, Wu, What Prompts Don't Say: Understanding and Managing Underspecification in LLM Prompts — https://arxiv.org/abs/2505.13360 — accessed 2026-10-12
7. Laban, Hayashi, Zhou, Neville, LLMs Get Lost In Multi-Turn Conversation — https://arxiv.org/abs/2505.06120 — accessed 2026-10-12
8. Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context, ICML 2023 — https://arxiv.org/abs/2302.00093 — accessed 2026-10-12
9. Gloaguen, Mündler-Sasahara, Müller, Raychev, Vechev, Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents? (v3, 2026-09-29) — https://arxiv.org/abs/2602.11988 — accessed 2026-10-12
10. Lulla, Mohsenimofidi, Galster, Zhang, Baltes, Treude, On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents — https://arxiv.org/abs/2601.20404 — accessed 2026-10-12
11. Khatri, Do Context Files Help Coding Agents? A Two-Agent Ablation Study on Real Repositories — https://arxiv.org/abs/2607.27250 — accessed 2026-10-12
12. Earlier research file, Onboarding an AI agent like an amnesiac freelancer (Findings 1 to 5, researched 2026-10-08) — docs/research/ai-onboarding-freelancer.md — accessed 2026-10-12
13. Earlier research file, Why an AI coding agent behaves like an amnesiac (1.3, 1.4, 2.1 to 2.5, 3.1, 3.2, 4.3; researched 2026-10-08) — docs/research/ai-amnesia-mechanics.md — accessed 2026-10-12

## Caveats

- The 56.1% to 88.3% figures are retrieval accuracy on 2023 models. They show that supplying relevant information helps and that it can be wasted; they do not size the gain for current models or for open-ended work such as planning an event.
- Chroma's report is a technical report, not peer reviewed. Studies 6 and 7 measure underspecified instructions on benchmark tasks, and 7 uses simulated users; neither measures a human writing a day-one brief.
- The coding-agent studies disagree and are recent, partly revised preprints. The v1 of Gloaguen et al. reported that context files tended to reduce success; the current abstract says "does not generally improve". Lulla et al. measure efficiency, not correctness, and report an association. Khatri's sample is small (17 tasks, 3 repositories). Net: for coding agents, a measured correctness gain from a repository context file is not established, while a gain from non-discoverable specifics is plausible and reported by [9].
- Strong evidence for "a clearer brief improves output" in human-written briefs for everyday knowledge work was not found; extending the findings to it is an inference.
- Findings 12 to 13 are carried from the earlier files, quoted as they were fetched on 2026-10-08, and were not re-fetched. The Anthropic quotes in Findings 1, 2 and 8 were re-fetched on 2026-10-12 from their own pages.
- Source 1: the be-clear-and-direct address named in the earlier file redirected on 2026-10-12 to the Prompting best practices page; the quote was confirmed there.
