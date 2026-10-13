---
type: research
title: 'Why does richer context and a clearer brief measurably improve AI output?'
description: 'Relevant, specific context and a fully specified brief measurably lift LLM output, but padding, noise and boilerplate overviews do not help and can hurt.'
question: 'Why does richer context and a clearer brief measurably improve AI output?'
generated:
  by: claude-code/opus-5.5
  at: 2026-10-13T00:00:00Z
stale_after: 2027-04-13T00:00:00Z
sources:
  - id: anthropic-prompting-best-practices
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices, section "Be clear and direct" (the page the older be-clear-and-direct address now redirects to)'
  - id: anthropic-effective-context-engineering
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic, Effective context engineering for AI agents'
  - id: anthropic-claude-code-best-practices
    resource: https://code.claude.com/docs/en/best-practices
    title: 'Anthropic, Best practices for Claude Code'
  - id: liu-lost-in-the-middle
    resource: https://arxiv.org/pdf/2307.03172
    title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts, TACL 2024, Table 1 and section 2.3'
  - id: hong-context-rot
    resource: https://research.trychroma.com/context-rot
    title: 'Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance'
  - id: yang-what-prompts-dont-say
    resource: https://arxiv.org/abs/2505.13360
    title: "Yang, Shi, Ma, Liu, Kästner, Wu, What Prompts Don't Say: Understanding and Managing Underspecification in LLM Prompts"
  - id: laban-lost-in-multi-turn
    resource: https://arxiv.org/abs/2505.06120
    title: 'Laban, Hayashi, Zhou, Neville, LLMs Get Lost In Multi-Turn Conversation'
  - id: shi-irrelevant-context
    resource: https://arxiv.org/abs/2302.00093
    title: 'Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context, ICML 2023'
  - id: gloaguen-agents-md
    resource: https://arxiv.org/abs/2602.11988
    title: 'Gloaguen, Mündler-Sasahara, Müller, Raychev, Vechev, Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents? (v3, 2026-09-29)'
  - id: lulla-agents-md-efficiency
    resource: https://arxiv.org/abs/2601.20404
    title: 'Lulla, Mohsenimofidi, Galster, Zhang, Baltes, Treude, On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents'
  - id: khatri-context-files-ablation
    resource: https://arxiv.org/abs/2607.27250
    title: 'Khatri, Do Context Files Help Coding Agents? A Two-Agent Ablation Study on Real Repositories'
  - id: anthropic-claude-code-memory
    resource: https://code.claude.com/docs/en/memory
    title: 'Anthropic, How Claude remembers your project (Claude Code memory)'
  - id: anthropic-how-claude-code-works
    resource: https://code.claude.com/docs/en/how-claude-code-works
    title: 'Anthropic, How Claude Code works, section "When context fills up"'
---

# Why does richer context and a clearer brief measurably improve AI output?

## Context

Asked to support the claim that the effort a person puts into briefing an AI before it starts changes the result, and to say how far that claim can be pushed. Vendor guidance says it does but offers no measurement; studies of long inputs measure recall falling as input grows, which is the opposite pressure. This file collects measured effects of adding context and clarifying the task, and the measured cases where more context did nothing or hurt.

## Answer

A model can only use what is in its context, so a brief that supplies the missing facts and the unstated requirements removes the guessing that causes wrong output. The measurement is clearest for facts: when a model is handed the one relevant document, its question-answering accuracy rises from 56.1% to 88.3% for GPT-3.5-Turbo compared with no documents, a 2023 retrieval result whose direction transfers but whose size does not [^liu-lost-in-the-middle]. The measurement is also clear for requirements: models infer unstated requirements only about 41% of the time and underspecified prompts are twice as likely to regress when the model or prompt changes [^yang-what-prompts-dont-say], and tasks given piece by piece in conversation instead of fully specified up front lose 39% of performance on average [^laban-lost-in-multi-turn]. The improvement is conditional, not automatic: irrelevant context sharply degrades reasoning [^shi-irrelevant-context], recall falls as input grows [^liu-lost-in-the-middle][^hong-context-rot], and repository context files that restate what an agent can discover on its own did not generally improve coding-agent success and raised cost by over 20% in one study, a still-revised preprint whose first version reported reduced success [^gloaguen-agents-md], while another study found an AGENTS.md associated with 28.64% lower median runtime and 16.58% fewer output tokens [^lulla-agents-md-efficiency], so the cost claim is disputed. The measured gain comes from relevant, specific, non-discoverable information, kept short, not from volume.

## Findings

1. Anthropic's guidance frames the claim without measuring it: "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows. The more precisely you explain what you want, the better the result." This is vendor guidance, not an effect size [^anthropic-prompting-best-practices].
2. Anthropic's own pruning rule already holds the tension: context is "a finite resource with diminishing marginal returns", the target is "the minimal set of information that fully outlines your expected behavior", and "minimal does not necessarily mean short" [^anthropic-effective-context-engineering].
3. Supplying the right facts measurably helps. In multi-document question answering, accuracy with no documents (closed-book) versus with only the one relevant document (oracle) was: GPT-3.5-Turbo 56.1% vs 88.3%, Claude-1.3 48.3% vs 76.1%, LongChat-13B 35.0% vs 83.4%, MPT-30B-Instruct 31.5% vs 81.9% (Table 1) [^liu-lost-in-the-middle]. These are 2023 models and a retrieval task, so the direction transfers, the size does not.
4. The same study shows the limit. Accuracy depends on where the relevant document sits, and for GPT-3.5-Turbo "in the worst case, performance in 20- and 30-document settings is lower than performance without any input documents (i.e., closed-book performance; 56.1%)". Adding documents helped only while the relevant one stayed usable [^liu-lost-in-the-middle].
5. Underspecified prompts are a measured source of error. LLMs guess a missing requirement correctly about 41.1% of the time; underspecified prompts are "2x as likely to regress across model or prompt changes", with accuracy drops above 20% in some cases [^yang-what-prompts-dont-say]. Listing every requirement does not fully fix it, because models follow instructions imperfectly and requirements can conflict, which is why the authors recommend discovering and monitoring requirements rather than writing a longer prompt [^yang-what-prompts-dont-say].
6. Clarity up front beats clarity piecemeal. Across 6 generation tasks and more than 200,000 simulated conversations, every tested model did worse when the task arrived underspecified over several turns than when fully specified in one turn; the average drop was 39%, mostly an increase in unreliability rather than lost ability. Models "make assumptions early, attempt final answers too soon, and then lean heavily on those attempts" [^laban-lost-in-multi-turn].
7. Irrelevant context hurts. On grade-school math problems with unrelated sentences added (GSM-IC), "the model performance is dramatically decreased when irrelevant information is included". An explicit instruction to ignore irrelevant information was one partial remedy [^shi-irrelevant-context].
8. Recall degrades as input grows, for all models tested. Chroma tested 18 LLMs and found "their performance grows increasingly unreliable as input length grows" even on simple tasks [^hong-context-rot]. Anthropic: "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases", with "more gentle degradation" in some models but present in all [^anthropic-effective-context-engineering]. Claude Code docs: "Claude's context window fills up fast, and performance degrades as it fills" [^anthropic-claude-code-best-practices].
9. Real-world briefing files give a mixed measured picture. Across SWE-bench and a new set of issues from repositories with developer-written context files, "providing context files does not generally improve task success rates" and raised inference cost by over 20% on average; "repository overviews, although popular and recommended by model providers, are not helpful"; but "context files are useful for specifying non-standard coding practices". Agents followed the instructions, which led to more testing and exploration [^gloaguen-agents-md].
10. In the other direction, a study of 10 repositories and 124 pull requests found an AGENTS.md file was associated with 28.64% lower median runtime and 16.58% fewer output tokens, with comparable task completion. This measures efficiency, not correctness, and is framed as an association [^lulla-agents-md-efficiency].
11. A controlled ablation of 288 runs on 17 tasks with Claude Code and Codex found no measurable effect of context strategy on correctness (effects bounded to roughly 10 to 15 percentage points), and attributed failures to implementation skill rather than missing repository knowledge [^khatri-context-files-ablation].
12. Mechanism this answer builds on: each Claude Code session "begins with a fresh context window", and CLAUDE.md or AGENTS.md is loaded as text that Claude treats "as context, not enforced configuration" [^anthropic-claude-code-memory]. Bloated files cause Claude to ignore the actual instructions, so a line stays only if removing it would cause mistakes [^anthropic-claude-code-best-practices].
13. Instructions given only in chat do not reliably survive compaction ("detailed instructions from early in the conversation may be lost"; the docs advise putting persistent rules in CLAUDE.md), and project-root CLAUDE.md is re-read from disk after compaction [^anthropic-claude-code-memory][^anthropic-how-claude-code-works].

## Caveats

- The 56.1% to 88.3% figures are retrieval accuracy on 2023 models. They show that supplying relevant information helps and that it can be wasted; they do not size the gain for current models or for open-ended, non-retrieval work.
- Chroma's report is a technical report, not peer reviewed. The studies [^yang-what-prompts-dont-say] and [^laban-lost-in-multi-turn] measure underspecified instructions on benchmark tasks, and the second uses simulated users; neither measures a human writing a day-one brief.
- The coding-agent studies disagree and are recent, partly revised preprints. The v1 of Gloaguen et al. reported that context files tended to reduce success; the current abstract says "does not generally improve". Lulla et al. measure efficiency, not correctness, and report an association. Khatri's sample is small (17 tasks, 3 repositories). Net: for coding agents, a measured correctness gain from a repository context file is not established, while a gain from non-discoverable specifics is plausible and reported by [^gloaguen-agents-md].
- Strong evidence for "a clearer brief improves output" in human-written briefs for everyday knowledge work was not found; extending the findings to it is an inference.
- Findings 12 and 13 were checked against the sources [^anthropic-claude-code-memory], [^anthropic-how-claude-code-works] and [^anthropic-claude-code-best-practices] on 2026-10-13; the compaction sentence is quoted from [^anthropic-how-claude-code-works]. The Anthropic quotes in Findings 1, 2 and 8 were re-fetched on 2026-10-12 from their own pages.
- The Anthropic prompting page [^anthropic-prompting-best-practices]: the older be-clear-and-direct address redirected on 2026-10-12 to the Prompting best practices page; the quote was confirmed there.

[^anthropic-prompting-best-practices]: Anthropic, Prompting best practices, section "Be clear and direct" (the page the older be-clear-and-direct address now redirects to), https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices

[^anthropic-effective-context-engineering]: Anthropic, Effective context engineering for AI agents, https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

[^anthropic-claude-code-best-practices]: Anthropic, Best practices for Claude Code, https://code.claude.com/docs/en/best-practices

[^liu-lost-in-the-middle]: Liu et al., Lost in the Middle: How Language Models Use Long Contexts, TACL 2024, Table 1 and section 2.3, https://arxiv.org/pdf/2307.03172

[^hong-context-rot]: Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance, https://research.trychroma.com/context-rot

[^yang-what-prompts-dont-say]: Yang, Shi, Ma, Liu, Kästner, Wu, What Prompts Don't Say: Understanding and Managing Underspecification in LLM Prompts, https://arxiv.org/abs/2505.13360

[^laban-lost-in-multi-turn]: Laban, Hayashi, Zhou, Neville, LLMs Get Lost In Multi-Turn Conversation, https://arxiv.org/abs/2505.06120

[^shi-irrelevant-context]: Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context, ICML 2023, https://arxiv.org/abs/2302.00093

[^gloaguen-agents-md]: Gloaguen, Mündler-Sasahara, Müller, Raychev, Vechev, Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents? (v3, 2026-09-29), https://arxiv.org/abs/2602.11988

[^lulla-agents-md-efficiency]: Lulla, Mohsenimofidi, Galster, Zhang, Baltes, Treude, On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents, https://arxiv.org/abs/2601.20404

[^khatri-context-files-ablation]: Khatri, Do Context Files Help Coding Agents? A Two-Agent Ablation Study on Real Repositories, https://arxiv.org/abs/2607.27250

[^anthropic-claude-code-memory]: Anthropic, How Claude remembers your project (Claude Code memory), https://code.claude.com/docs/en/memory

[^anthropic-how-claude-code-works]: Anthropic, How Claude Code works, section "When context fills up", https://code.claude.com/docs/en/how-claude-code-works
