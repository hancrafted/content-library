---
type: research
title: "Why can removing a skill, ADR or context file from an agent's input leave its results unchanged or even better?"
description: 'Removing context changes nothing when it is redundant, unused or not what the task fails on, and helps when it costs attention; only non-discoverable, task-fit procedure measurably lifts results.'
generated:
  by: github-copilot/cli
  at: 2026-10-30T22:49:17Z
stale_after: 2027-04-30T00:00:00Z
sources:
  - id: 1
    resource: docs/llm-wiki/research/AIE/AIE-0004__context-and-brief-improve-ai-output/research.md
    title: 'LLM wiki, Why does richer context and a clearer brief measurably improve AI output?'
  - id: 2
    resource: docs/llm-wiki/research/AIE/AIE-0011__fresh-context-beats-long-chat/research.md
    title: 'LLM wiki, Why does a fresh, focused context outperform a long, accumulated chat?'
  - id: 3
    resource: https://arxiv.org/abs/2602.11988v3
    title: 'Gloaguen, Mündler-Sasahara, Müller, Raychev, Vechev, Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents? (v3, 2026-09-29)'
  - id: 4
    resource: https://arxiv.org/abs/2607.27250
    title: 'Khatri, Do Context Files Help Coding Agents? A Two-Agent Ablation Study on Real Repositories'
  - id: 5
    resource: https://arxiv.org/abs/2602.12670v4
    title: 'Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks (v4, 2026-06-14)'
  - id: 6
    resource: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
    title: 'Gao (Vercel), AGENTS.md outperforms skills in our agent evals'
  - id: 7
    resource: https://arxiv.org/abs/2507.11538
    title: 'Jaroslawicz, Whiting, Shah, Maamari, How Many Instructions Can LLMs Follow at Once? (IFScale)'
  - id: 8
    resource: https://arxiv.org/abs/2510.05381
    title: 'Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval, Findings of EMNLP 2025'
  - id: 9
    resource: https://arxiv.org/abs/2502.05167
    title: 'Modarressi et al., NoLiMa: Long-Context Evaluation Beyond Literal Matching, ICML 2025'
  - id: 10
    resource: https://www.trychroma.com/research/context-rot
    title: 'Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance'
  - id: 11
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic, Effective context engineering for AI agents'
  - id: 12
    resource: https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills
    title: 'Anthropic, Equipping agents for the real world with Agent Skills'
  - id: 13
    resource: https://code.claude.com/docs/en/memory
    title: 'Anthropic, How Claude remembers your project (Claude Code memory)'
  - id: 14
    resource: https://code.claude.com/docs/en/skills
    title: 'Anthropic, Extend Claude with skills (Claude Code skills)'
  - id: 15
    resource: https://arxiv.org/abs/2601.20404
    title: 'Lulla, Mohsenimofidi, Galster, Zhang, Baltes, Treude, On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents'
---

# Why can removing a skill, ADR or context file from an agent's input leave its results unchanged or even better?

## Context

Asked to support the claim that context given to a coding agent (an AGENTS.md or CLAUDE.md, a skill, an architecture decision record) has to earn its tokens, and that only an ablation shows whether it does. AIE-0004 established that relevant context helps and padding can hurt, and AIE-0011 that a long context degrades results [1][2]; this file asks the narrower question of why taking a piece of standing context away so often leaves an agent's measured results unchanged or better, and where it does not.

## Answer

Removing a piece of context leaves results unchanged when that piece did no work: it repeats what the agent can discover in the repository or already knows [3], it never gets loaded [6], or the task fails for a reason it does not address [4]. Removal improves results when the piece cost more than it gave: every added token lowers accuracy even when nothing in it distracts [8][10], adherence falls and instructions get dropped as their number grows [7][13], and an exhaustive or ill-fitting skill can displace a better default and score below having no skill [5]. Context measurably helps when it carries procedure or facts the agent cannot infer and that fit the task: curated, compact skills raised pass rates by 16.6 points on average [5], and a docs index for APIs newer than the model's training lifted one eval suite from 53% to 100% [6]. So whether a skill, ADR or context file earns its tokens is an empirical question per piece and per task, which is what ablation answers.

## Findings

1. Context files are often redundant with what the repository already says. In the AGENTS.md study, LLM-generated context files reduced the resolution rate in 5 of 8 settings while adding 2.45 to 3.92 steps per task and raising cost by 20% and 23%; none of the None-versus-file differences in resolution was significant (p = 0.87, 0.37, 0.21) [3].
2. The same study then removed the repository's own documentation (Markdown files, example code, `docs/`) and kept the generated context file: now the file "consistently improve[d] performance by 2.7% on average". The authors conclude generated context files "are mostly redundant with existing documentation", and that this may explain anecdotes of agents doing better after adding one in poorly documented repositories [3].
3. Agents follow context-file instructions, which is part of the cost: "instructions in context files are well followed", leading to "increased exploration, testing, and reasoning". Repository overviews did not shorten the way to the relevant file, and the authors recommend that human-written files hold only what is "not already present in the README (e.g., specific conventions or non-functional requirements)" [3].
4. When the failure is not about missing knowledge, context cannot fix it. In 288 runs across Claude Code and Codex on 17 tasks, context strategy did not measurably move correctness (bounded to at most 10 to 15 points); agents failed on "feature design, pattern selection, exact wiring", and a manipulation probe showed "the real AGENTS.md never converts a near-miss to a pass" [4].
5. The same paper explains why ablation studies disagree: which tasks are borderline differs by agent (Spearman rho = 0.75), so studies that draw tasks from one agent's "informative band" measure different things [4].
6. A context file can save effort without changing correctness: with an AGENTS.md present, median runtime fell 28.64% and output tokens 16.58% across 124 pull requests, at comparable task completion, an association rather than a controlled correctness result [15].
7. A skill that is not triggered is the same as no skill. In Vercel's Next.js 16 evals, the skill was never invoked in 56% of cases, and the pass rate with it equalled the no-docs baseline (53% vs 53%); on tests it scored lower (58% vs 63%), which the authors read as an unused skill adding "noise or distraction" [6].
8. Telling the agent to use the skill raised the pass rate to 79%, but the wording mattered: "You MUST invoke the skill" anchored the agent on the docs and missed project context, while "explore project first, then invoke skill" did better. A compressed 8 KB docs index placed in AGENTS.md reached 100% on Build, Lint and Test, and compressing it from 40 KB kept the 100% [6].
9. Curated skills help on average but not everywhere. Across 87 tasks and 18 model-harness configurations, curated skills raised the pass rate from 33.9% to 50.5% (+16.6 points; configurations ranged +4.1 to +25.7), yet 13 of 87 tasks showed negative deltas, where the skill prescribes a pipeline that "displaces a stronger default strategy" or is too heavy for routine execution [5].
10. More skill content buys less. One skill gained +18.0 points and two to three +19.0, but four or more only +10.1; compact and standard-length skills gained +19.0 and +21.5, detailed ones +14.5 and "comprehensive documentation" +0.7. The authors' advice: "optimize for verifier-facing detail an agent cannot infer, not for completeness" [5].
11. Context the agent writes for itself does not carry the gain. Skills authored by the agent before solving landed below the no-skills baseline on all three tested harnesses (−8.1, −11.3 and −11.5 points), while curated skills added +18.2 to +24.8 on the same configurations [5].
12. Instruction count alone lowers compliance. In IFScale, 20 frontier models given up to 500 simultaneous instructions reached at most 68% accuracy at 500; models are biased toward earlier instructions, and as density rises they "overwhelmingly err toward omission", dropping instructions entirely rather than half-following them [7].
13. Input length alone lowers accuracy, even with nothing distracting in it. Across 5 models on math, question answering and coding, performance fell 13.9% to 85% as input grew within the claimed context length, even when the extra tokens were whitespace or were masked so the model attended only to the relevant ones [8].
14. Recall degrades faster when the task and the relevant text share few words: on NoLiMa, 11 of 13 models fell below half their short-context score at 32K tokens, and GPT-4o dropped from 99.3% to 69.7% [9]. Chroma found the same direction across 18 models, plus that topically similar distractors hurt more than unrelated ones, and that a logically coherent haystack hurt more than a shuffled one [10].
15. Vendor guidance draws the same line without measuring it. Anthropic: "the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome"; it warns against "a laundry list of edge cases" in a prompt and against tool sets with "ambiguous decision points" [11]. Claude Code's docs: target under 200 lines per CLAUDE.md, since "longer files consume more context and reduce adherence", and contradicting instructions make Claude "pick one arbitrarily" [13].
16. The vendors' structural answer is to load on demand, not to delete. Skills preload only their name and description and load the body when relevant (progressive disclosure) [12]; path-scoped rules load only when matching files are opened [13]; and once a skill loads its body "stays in context across turns, so every line is a recurring token cost" [14]. Anthropic's first authoring rule for skills is "Start with evaluation": find where the agent struggles on representative tasks before writing one [12].

## Caveats

- No study found ablates architecture decision records (ADRs) specifically. Treating them as context files, path-scoped rules or skills, depending on how they are loaded, is an inference.
- The coding-agent studies are recent preprints with small or specific samples: Khatri has 17 tasks in 3 repositories [4]; SkillsBench tasks are expertise-heavy and paired with skills written for them [5]; Gloaguen et al. use Python repositories and SWE-bench-style issue fixing [3]. None measures multi-step pipelines or a repository whose conventions differ sharply from the model's priors.
- Vercel's evals are a vendor blog post on its own framework, with no sample size reported; the 100% is for APIs absent from training data, the case where context is least redundant [6].
- IFScale uses keyword-inclusion instructions in report writing, not coding rules; Du et al., NoLiMa and Chroma measure retrieval and reasoning tasks, not agent runs. That their degradation transfers to standing agent context is an inference [7][8][9][10].
- SkillsBench notes skills also add length, so part of their gain could be "more context" rather than procedure; the self-generated condition argues against that but mixes content quality with discovery effects [5].
- Effects shift with each model and harness release; the self-generated skill results name Opus 4.7, GPT-5.5 and Gemini 3.1 Pro, and the docs cited describe Claude Code as of 2026-10-30.

[1]: docs/llm-wiki/research/AIE/AIE-0004__context-and-brief-improve-ai-output/research.md 'LLM wiki, Why does richer context and a clearer brief measurably improve AI output?'
[2]: docs/llm-wiki/research/AIE/AIE-0011__fresh-context-beats-long-chat/research.md 'LLM wiki, Why does a fresh, focused context outperform a long, accumulated chat?'
[3]: https://arxiv.org/abs/2602.11988v3 'Gloaguen, Mündler-Sasahara, Müller, Raychev, Vechev, Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents? (v3, 2026-09-29)'
[4]: https://arxiv.org/abs/2607.27250 'Khatri, Do Context Files Help Coding Agents? A Two-Agent Ablation Study on Real Repositories'
[5]: https://arxiv.org/abs/2602.12670v4 'Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks (v4, 2026-06-14)'
[6]: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals 'Gao (Vercel), AGENTS.md outperforms skills in our agent evals'
[7]: https://arxiv.org/abs/2507.11538 'Jaroslawicz, Whiting, Shah, Maamari, How Many Instructions Can LLMs Follow at Once? (IFScale)'
[8]: https://arxiv.org/abs/2510.05381 'Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval, Findings of EMNLP 2025'
[9]: https://arxiv.org/abs/2502.05167 'Modarressi et al., NoLiMa: Long-Context Evaluation Beyond Literal Matching, ICML 2025'
[10]: https://www.trychroma.com/research/context-rot 'Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance'
[11]: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents 'Anthropic, Effective context engineering for AI agents'
[12]: https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills 'Anthropic, Equipping agents for the real world with Agent Skills'
[13]: https://code.claude.com/docs/en/memory 'Anthropic, How Claude remembers your project (Claude Code memory)'
[14]: https://code.claude.com/docs/en/skills 'Anthropic, Extend Claude with skills (Claude Code skills)'
[15]: https://arxiv.org/abs/2601.20404 'Lulla, Mohsenimofidi, Galster, Zhang, Baltes, Treude, On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents'
