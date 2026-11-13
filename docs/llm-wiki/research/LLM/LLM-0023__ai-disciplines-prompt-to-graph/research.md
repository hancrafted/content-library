---
type: research
title: 'Why do prompt, context, harness, loop and graph engineering matter at different AI capability Levels?'
description: 'Prompt and context engineering are older practice, harness, loop and graph engineering are 2026 names; loop and graph have thin primary evidence and graph is contested as a discipline.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-11T00:00:00Z
stale_after: 2027-02-11T00:00:00+01:00
sources:
  - id: 1
    resource: https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/
    title: 'Weng, Prompt Engineering (15 Mar 2023)'
  - id: 2
    resource: https://x.com/karpathy/status/1937902205765607626
    title: 'Karpathy on X, +1 for context engineering (25 Jun 2025); post text read via the fxtwitter API mirror of the X post'
  - id: 3
    resource: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
    title: 'Anthropic, Effective context engineering for AI agents (29 Sep 2025)'
  - id: 4
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents (19 Dec 2024)'
  - id: 5
    resource: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
    title: 'Young, Anthropic, Effective harnesses for long-running agents (26 Nov 2025)'
  - id: 6
    resource: https://mitchellh.com/writing/my-ai-adoption-journey
    title: 'Hashimoto, My AI Adoption Journey (5 Feb 2026)'
  - id: 7
    resource: https://openai.com/index/harness-engineering/
    title: 'Lopopolo, OpenAI, Harness engineering: leveraging Codex in an agent-first world (11 Feb 2026); the openai.com page returns 403 to direct fetches, read from a Wayback Machine copy of the original page'
  - id: 8
    resource: https://www.engineering.fyi/article/harness-engineering-leveraging-codex-in-an-agent-first-world
    title: 'Engineering.fyi summary mirror of source 7'
  - id: 9
    resource: https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html
    title: 'Böckeler, Harness Engineering for Coding Agent Users, martinfowler.com (2 Apr 2026; replaces memo of 17 Feb 2026)'
  - id: 10
    resource: https://ghuntley.com/ralph/
    title: 'Huntley, Ralph Wiggum as a software engineer (14 Jul 2025)'
  - id: 11
    resource: https://addyosmani.com/blog/loop-engineering/
    title: 'Osmani, Loop Engineering (7 Jun 2026)'
  - id: 12
    resource: https://www.ibm.com/think/topics/loop-engineering
    title: 'Belcic and Stryker, IBM Think, What Is Loop Engineering? (17 Jul 2026)'
  - id: 13
    resource: https://arxiv.org/abs/2608.21884
    title: 'Lulla et al., Loop Engineering: Building Blocks, Adoption, and Impact (arXiv v1 22 Aug 2026, v3 22 Oct 2026); abstract and PDF read'
  - id: 14
    resource: https://newsletter.pragmaticengineer.com/p/what-is-loop-engineering
    title: 'Orosz, Pragmatic Engineer, What is loop engineering? (14 Jul 2026); page not opened, content via search summary'
  - id: 15
    resource: https://www.langchain.com/blog/3-years-of-graph-engineering-with-langgraph
    title: 'Runkle and Chase, LangChain, 3 Years of Graph Engineering with LangGraph (22 Jul 2026)'
  - id: 16
    resource: https://www.turingpost.com/p/is-graph-engineering-real-why-everyone-is-talking-about-it
    title: 'Se, Turing Post, FOD#159 Is Graph Engineering Real? (20 Jul 2026)'
  - id: 17
    resource: https://arxiv.org/abs/2608.21156
    title: 'Feng et al., Graph Engineering in the Era of LLM Agents (arXiv v1 21 Aug 2026, v2 26 Aug 2026); abstract and PDF read'
  - id: 18
    resource: https://x.com/HamelHusain/status/2078348097697263855
    title: 'Husain on X, Loop Engineering Is Dead. Enter Graph Engineering (18 Jul 2026); X Article read via the fxtwitter API mirror'
  - id: 19
    resource: https://x.com/tobi/status/1935533422589399127
    title: 'Lütke on X, context engineering over prompt engineering (18 Jun 2025 US time, 19 Jun 03:01 UTC); read via the fxtwitter API mirror'
  - id: 20
    resource: https://x.com/steipete/status/2063697162748260627
    title: 'Steinberger on X, designing loops that prompt your agents (7 Jun 2026); read via the fxtwitter API mirror'
  - id: 21
    resource: https://x.com/steipete/status/2078277297791189132
    title: 'Steinberger on X, loops or graphs (18 Jul 2026); read via the fxtwitter API mirror'
---

# Why do prompt, context, harness, loop and graph engineering matter at different AI capability Levels?

## Context

Input to the AI capability Explorable (`.scratch/ai-capability/handoff.md`), whose four Levels are Prompting (2022-23), Agents (2024-25), Workflows (2024-26) and Factory (2026 on). The Explorable now calls the row these five disciplines sit on "AI disciplines" (earlier drafts said "engineering"). The question: how are the five "engineering" disciplines defined in public today, who coined them and when, and do the proposed Level spans hold. Today is 2026-11-11. All terms except prompt engineering are less than 18 months old, and loop and graph engineering less than six. Fetches by a summarising reader return short quotes only; quotes below are under the reader's 125-character limit unless taken from a downloaded page or PDF. Items marked **UNVERIFIED** were not opened at the primary; items marked "verified" were re-opened on 2026-11-11.

## Answer

Prompt: One-sentence definition: Methods to communicate with an LLM to steer its behaviour without updating weights.; Best source: Weng [1]; Date: 2023-03-15.

Context: One-sentence definition: Curating and maintaining the optimal set of tokens during LLM inference.; Best source: Anthropic [3]; Date: 2025-09-29 (term: Lütke 2025-06-18, Karpathy [2] 2025-06-25).

Harness: One-sentence definition: Everything in an agent except the model; engineering it so the agent never repeats a mistake.; Best source: Hashimoto [6], Böckeler [9]; Date: 2026-02-05; 2026-04-02.

Loop: One-sentence definition: Replacing yourself as the person who prompts the agent: you design the system that does it.; Best source: Osmani [11]; Date: 2026-06-07.

Graph: One-sentence definition: Designing agent work as explicit nodes, edges and state, where a node can be a whole agent run.; Best source: Feng et al. [17] (survey); Turing Post [16], LangChain [15] (practitioner); Date: 2026-08-21; 2026-07-20.

The five stack as a progression in the surveys [13][17]: each adds a layer around the one before. Prompt shapes a call, context shapes the window, harness shapes the single agent's environment, loop shapes the agent over time, graph shapes several agents and their state.

Evidence on the spans: Prompt (Prompting start to Factory end) is confirmed. Context (Prompting mid) is defensible as practice but the term and discipline arrive in the Agents Level (June 2025). Harness (Agents start) is a practice that predates the name; the name arrives Feb 2026, inside the Factory Level. Loop (Agents mid) fits the practice (Huntley, Jul 2025) but the term is June 2026. Graph (Workflows start) fits the practice (Anthropic workflows, Dec 2024) and is the most contested as a discipline: LangChain calls it a relabel [15]. Loop and graph are hype-cycle terms; their "discipline" status rests on a few weeks of posts and two August 2026 arXiv papers.

## Findings

1. Prompt engineering, also called in-context prompting, is "methods for how to communicate with LLM to steer its behavior for desired outcomes without updating the model weights" (quote, paraphrase-trimmed) [1], 15 March 2023.
2. Anthropic treats it as writing and organising instructions, especially system prompts, and as the thing context engineering progresses from [3].
3. Level: Prompting from the start (2022-23). It stays relevant at every later Level, since every layer ends in a prompt. Both 2026 survey papers list it first in the progression [13][17]. Span Prompting start to Factory end: confirmed.
4. Origin of the term: Tobi Lütke posted "I really like the term “context engineering” over prompt engineering." and "the art of providing all the context for the task to be plausibly solvable by the LLM" [19]; the post's timestamp is 19 June 2025 03:01 UTC, which is 18 June in US time zones (draft said 18 June). Karpathy backed it on 25 June 2025: "+1 for \"context engineering\" over \"prompt engineering\"." and called it "the delicate art and science of filling the context window with just the right information for the next step" [2]. Both posts verified at the primary text (via an API mirror of X). One secondary source credits Walden Yan (Cognition, 12 June 2025) with an earlier articulation: **UNVERIFIED**.
5. Anthropic definition, 29 September 2025: "context engineering refers to the set of strategies for curating and maintaining the optimal set of tokens" during inference, and "we view context engineering as the natural progression of prompt engineering" (quotes, trimmed) [3]. It names the shift from one-shot tasks to multi-turn, long-horizon agents as the cause.
6. Use cases in [3]: system prompts at the right altitude, minimal tool sets, just-in-time retrieval (Claude Code loads instruction files up front and uses glob and grep on demand), compaction, structured note-taking, sub-agents.
7. Level: matters in practice from Prompting mid (few-shot examples and retrieval fill the window from 2023; this is inference, not cited). The named discipline starts with Agents (mid 2025), because Anthropic ties it to multi-turn agent work [3]. Span Prompting mid to Factory end: acceptable if the Explorable says "the practice predates the name"; challenge: first public use of the term is mid-Agents, not Prompting.
8. Hashimoto, 5 February 2026, step 5 of "My AI Adoption Journey": "I've grown to calling this 'harness engineering'" (quote, trimmed). He defines it as the practice that, whenever an agent errs, "you take the time to engineer a solution such that the agent never makes that mistake again", through an AGENTS.md line or a programmed tool such as a screenshot script. He says he does not know of a broad industry-accepted term and would adopt one [6]. This is the earliest use I opened.
9. A secondary source credits Dex Horthy's post on X of 4 November 2025 as an earlier use: **UNVERIFIED**.
10. OpenAI (Ryan Lopopolo, 11 February 2026), verified from a Wayback copy of the original page: the team built "a product with 0 lines of manually-written code"; "roughly 1,500 pull requests have been opened and merged with a small team of just three engineers driving Codex"; the repository holds "on the order of a million lines of code" after five months; "We estimate that we built this in about 1/10th the time it would have taken to write the code by hand." The engineer's job becomes to "design environments, specify intent, and build feedback loops" (draft had the gerund form, corrected); "the fix was almost never “try harder.”" (draft had "is", corrected); "we treat it as the table of contents" with "A short AGENTS.md (roughly 100 lines)" [7]. The post does not claim to coin the term. [8] is a summary mirror and is no longer needed.
11. Böckeler (Thoughtworks), memo 17 February 2026, replaced by an article on 2 April 2026: "The term harness has emerged as a shorthand to mean everything in an AI agent except the model itself", "Agent = Model + Harness", and "Engineering a user harness for a coding agent is a specific form of context engineering" (quotes). Parts: guides (feedforward) and sensors (feedback), each computational or inferential; targets: maintainability, architecture fitness, behaviour (the last "largely unsolved") [9]. Search results show Fowler's Fragments of 13 July 2026 saying nobody at the early-2026 retreat had heard of it and by July it had its own session: **UNVERIFIED, page not opened**.
12. Pre-name practice: Anthropic's long-running-agent post of 26 November 2025 calls the Claude Agent SDK "a powerful, general-purpose agent harness", and adds an initializer agent, a progress file, a git history and a JSON feature list so work carries across context windows [5].
13. Level: the practice matters wherever an agent runs, that is from Agents. The name dates from Feb 2026. Span Agents start to Factory end: practice confirmed from the late-2025 evidence [5]; claim for 2024 start has no source here (UNVERIFIED). The OpenAI case is a Factory-Level exemplar: agents write all code and humans build the environment [8].
14. Origin: the arXiv study says "In June 2026, practitioners began to describe a new level called loop engineering" and, in the full text, that the term "was coined in early June 2026" [13]. Steinberger's post of 7 June 2026, 18:58 UTC, verified: "Here’s your monthly reminder that you shouldn’t be prompting coding agents anymore. You should be designing loops that prompt your agents." It showed 8.7 million views when read (draft said 2.2 million from a search summary, corrected) [20]. Osmani's essay of 7 June 2026 (opened) quotes it and adds Boris Cherny, head of Claude Code at Anthropic: "I don’t prompt Claude anymore. I have loops running that prompt Claude and figuring out what to do. My job is to write loops" [11]. Cherny's remark is quoted second-hand from [11]; its primary was not found: **UNVERIFIED at the primary**. Credit is disputed in secondary sources between Steinberger and Osmani. Best reading: Steinberger and Cherny coined the idea, Osmani named and structured it.
15. Definition, Osmani [11]: "Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead." A loop is "a recursive goal where you define a purpose and the AI iterates until complete." It "sits one floor above the harness": "the harness but it runs on a timer, it spawns little helpers, and it feeds itself" (quotes).
16. Building blocks [11]: automations (schedules), worktrees, skills, plugins and connectors, sub-agents (maker and verifier split), plus state on disk ("The agent forgets, the repo doesnt"). Academic list [13]: schedule or event triggers, machine-checkable stop conditions, state files, verifier sub-agents, token budgets, human escalation points.
17. Definitions elsewhere: IBM, 17 July 2026: "the practice of designing agentic workflows, or loops, that iteratively guide AI agents" toward user goals with little human involvement; underpins Claude Code, Codex and IBM Bob; prompting remains better for single interactions (quotes trimmed) [12]. The graph survey's formal definition, verified in the PDF: "the engineering of a bounded, stateful, and feedback-driven process that coordinates agent operation until the goal achievement is supported by sufficient evidence or continued execution is no longer justified" [17].
18. Use cases [11]: OpenAI-internal automations for daily issue triage, CI-failure summaries, commit briefings and recent-bug hunting; `/goal` loops until "all tests in test/auth pass and lint is clean", with a separate model judging; a morning loop of triage, one worktree per item with maker and reviewer, PR plus ticket plus Slack, and a human inbox for leftovers. Huntley's Ralph: "In its purest form, Ralph is a Bash loop" (`while :; do cat PROMPT.md | claude-code ; done`), used to bootstrap greenfield projects, with the CURSED language and a contract claimed delivered for about $297 (claims are the author's, **UNVERIFIED**) [10].
19. Timeline of tooling, verified in the full text of [13]: Claude Code added a recurring `/loop` command in March 2026, Codex introduced goal objects with machine-checkable completion conditions in April, and Claude Code, Hermes and other harnesses followed with `/goal` commands in May 2026.
20. Evidence of benefit is weak. The mining study analysed 36,710 repositories and, after review of 256 inspected ones, confirmed autonomous agent loops in 217 of them (0.59% of all analysed), almost none committing the recommended state files; the literature review found "no systematic evidence of the claimed benefits" [13]. Orosz (14 July 2026) says he is "not (yet?) buying that it's a new paradigm", that critics call loops "a renamed cron job", and that `/loop` and `/goal` as built-ins make it "as good as obsolete" for ordinary software teams while staying important at the infrastructure level; **via search summary, UNVERIFIED** [14].
21. Level: the pattern exists as soon as an agent runs in a loop. Anthropic already defines agents as "LLMs using tools based on environmental feedback in a loop" and gives evaluator-optimizer loops with iteration limits in Dec 2024 [4]. Autonomous, unattended loops start with Ralph, July 2025 (mid-Agents) [10]. The term and the tooling are 2026. Span Agents mid to Factory end: supported by [10] and [4]; the discipline is a Factory-Level idea in its mature form (unattended, scheduled, verified) [11].
22. Origin, verified at the posts: on 18 July 2026 at 00:34 UTC Steinberger asked "Are we still talking loops or did we shift to graphs yet?" (draft wording "have we moved on" corrected; 3.1 million views when read) [21]. At 05:09 UTC (about four and a half hours later) Hamel Husain published an X Article titled "Loop Engineering Is Dead. Enter Graph Engineering" whose body is a single GIF with a "." caption text (692 thousand views when read); the "Stop it" caption in the draft could not be confirmed from text, and his follow-up tweet says "I promise its not what you think it is" [18]. Turing Post treats both as at least half joking [16]. LangChain says the phrase "surfaced this weekend, kicked off by this tweet", linking Steinberger's post [15].
23. The term was then formalised in a 35-author survey, Feng et al., arXiv 2608.21156, v1 21 August 2026, v2 26 August [17]. Verified in the abstract and PDF: graph engineering is "an emerging paradigm for next-generation agent systems" that "constructs explicit, dynamic, evolving graph structures representing tasks, agents, and system states", resting on Task Organization, Agent Coordination and Runtime State Management. Its claim: prompt, context, harness and loop engineering optimise individual interactions or one agent; graph engineering targets "System Intelligence". The PDF states "Agent = Loop(LLM + Harness)" (verified). A survey by 35 authors weeks after a joke is itself a sign of hype; the paper's rigour was not assessed.
24. Practitioner definition, Turing Post, 20 July 2026: "a graph has nodes, edges, and state"; nodes are an agent, model call, ordinary code or human decision; edges decide branches, retries, approvals and stop conditions; "A loop is already a graph" (quotes) [16]. Use it when you need parallel branches, independent verification, different tools or models per step, human approval of consequential actions, or durable state; otherwise "keep it linear" [16].
25. LangChain (Sydney Runkle and Harrison Chase, 22 July 2026), an interested party since it sells LangGraph: "Graph engineering isn't a new idea. It's the latest name for a well established approach to building reliable agents", "You can think of this as a state machine", "Loop engineering isn't an alternative to graphs, so much as a simple version of them". Possible novelty: "a node can be a full agent run — you're orchestrating agents, not just LLM calls". Use cases: support bots that triage before replying, a knowledge-base agent routing to GitHub, Notion and Slack sub-agents in classify, search, synthesise stages, a docs agent turning a Slack request into a PR, map-reduce with `Send`. Counter-example: open-ended deep research is better served by an agent harness; GPT Researcher switched [15].
26. The title says "3 Years of Graph Engineering" [15]; Turing Post says "LangChain launched LangGraph in January 2024" [16]. Three years before July 2026 would be mid-2023, so the two do not agree; the launch date was not checked against a primary: **UNVERIFIED**.
27. Pre-name practice: Anthropic's December 2024 workflows are "orchestrated through predefined code paths" (routing, parallelisation, orchestrator-workers, evaluator-optimizer); the post never uses the word graph [4]. That is the Workflows Level in practice.
28. Overload warning [16]: "graph" can mean a control graph, a knowledge graph (GraphRAG), an execution trace or a graph of improvement loops. Viral performance claims (18 percent accuracy, 85 percent cost) came from one narrow GraphRAG study on industrial diagrams. Anthropic has announced no discipline called graph engineering [16].
29. Level: Workflows (2024 on) in practice, multi-agent graphs in Factory (a node is a whole agent, which fits an AI-run lifecycle). Span Workflows start to Factory end: supported by [4] and [15]. Caution for the Explorable: label graph engineering as "named 2026, practised since 2024" and flag that its status as a distinct discipline is contested [15][16].
30. Proposed spans against evidence, by when the practice is public versus when the name is:
31. Prompt: Proposed span: Prompting start to Factory end; Practice public: 2022-23 [1]; Name public: 2022-23; Verdict: Confirmed
32. Context: Proposed span: Prompting mid to Factory end; Practice public: 2023 (inference); Name public: Jun 2025 [2][3]; Verdict: Practice yes, name late; keep with a note
33. Harness: Proposed span: Agents start to Factory end; Practice public: Nov 2025 evidence [5]; 2024 unsourced; Name public: Feb 2026 [6][9]; Verdict: Challenge: only late-2025 evidence found; Agents mid is better supported
34. Loop: Proposed span: Agents mid to Factory end; Practice public: Dec 2024 as agent loop [4]; unattended Jul 2025 [10]; Name public: Jun 2026 [11]; Verdict: Confirmed for mid-2025
35. Graph: Proposed span: Workflows start to Factory end; Practice public: Dec 2024 workflows [4]; Name public: Jul to Aug 2026 [16][17]; Verdict: Confirmed as practice; contested as discipline
36. Note the proposed order of arrival also conflicts with the ordering in the surveys [13][17] only in that those papers treat the five as a sequence of eras; they do not map to the Levels.

## Caveats

Verified on 2026-11-11 at the primary or a copy of it: OpenAI harness post (Wayback copy), Karpathy, Lütke, Steinberger (both), Husain post, Osmani, both arXiv papers (abstract and PDF), LangChain and Turing Post pages.

Still unverified:

- Boris Cherny's "My job is to write loops" remark: quoted only through Osmani [11].
- Fowler's Fragments of July 2026 and Orosz's article (not opened; search summary). Husain's GIF caption text.
- Dex Horthy's 4 November 2025 priority claim for "harness engineering"; Walden Yan's 12 June 2025 context-engineering post.
- LangGraph launch date (January 2024 per Turing Post, "three years" per LangChain).
- Any 2024 evidence for harness engineering as a practice; any evidence of benefit from loop or graph engineering beyond the mining study in [13].

[1]: https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/ 'Weng, Prompt Engineering (15 Mar 2023)'
[2]: https://x.com/karpathy/status/1937902205765607626 'Karpathy on X, +1 for context engineering (25 Jun 2025); post text read via the fxtwitter API mirror of the X post'
[3]: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents 'Anthropic, Effective context engineering for AI agents (29 Sep 2025)'
[4]: https://www.anthropic.com/engineering/building-effective-agents 'Anthropic, Building effective agents (19 Dec 2024)'
[5]: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents 'Young, Anthropic, Effective harnesses for long-running agents (26 Nov 2025)'
[6]: https://mitchellh.com/writing/my-ai-adoption-journey 'Hashimoto, My AI Adoption Journey (5 Feb 2026)'
[7]: https://openai.com/index/harness-engineering/ 'Lopopolo, OpenAI, Harness engineering: leveraging Codex in an agent-first world (11 Feb 2026); the openai.com page returns 403 to direct fetches, read from a Wayback Machine copy of the original page'
[8]: https://www.engineering.fyi/article/harness-engineering-leveraging-codex-in-an-agent-first-world 'Engineering.fyi summary mirror of source 7'
[9]: https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html 'Böckeler, Harness Engineering for Coding Agent Users, martinfowler.com (2 Apr 2026; replaces memo of 17 Feb 2026)'
[10]: https://ghuntley.com/ralph/ 'Huntley, Ralph Wiggum as a software engineer (14 Jul 2025)'
[11]: https://addyosmani.com/blog/loop-engineering/ 'Osmani, Loop Engineering (7 Jun 2026)'
[12]: https://www.ibm.com/think/topics/loop-engineering 'Belcic and Stryker, IBM Think, What Is Loop Engineering? (17 Jul 2026)'
[13]: https://arxiv.org/abs/2608.21884 'Lulla et al., Loop Engineering: Building Blocks, Adoption, and Impact (arXiv v1 22 Aug 2026, v3 22 Oct 2026); abstract and PDF read'
[14]: https://newsletter.pragmaticengineer.com/p/what-is-loop-engineering 'Orosz, Pragmatic Engineer, What is loop engineering? (14 Jul 2026); page not opened, content via search summary'
[15]: https://www.langchain.com/blog/3-years-of-graph-engineering-with-langgraph 'Runkle and Chase, LangChain, 3 Years of Graph Engineering with LangGraph (22 Jul 2026)'
[16]: https://www.turingpost.com/p/is-graph-engineering-real-why-everyone-is-talking-about-it 'Se, Turing Post, FOD#159 Is Graph Engineering Real? (20 Jul 2026)'
[17]: https://arxiv.org/abs/2608.21156 'Feng et al., Graph Engineering in the Era of LLM Agents (arXiv v1 21 Aug 2026, v2 26 Aug 2026); abstract and PDF read'
[18]: https://x.com/HamelHusain/status/2078348097697263855 'Husain on X, Loop Engineering Is Dead. Enter Graph Engineering (18 Jul 2026); X Article read via the fxtwitter API mirror'
[19]: https://x.com/tobi/status/1935533422589399127 'Lütke on X, context engineering over prompt engineering (18 Jun 2025 US time, 19 Jun 03:01 UTC); read via the fxtwitter API mirror'
[20]: https://x.com/steipete/status/2063697162748260627 'Steinberger on X, designing loops that prompt your agents (7 Jun 2026); read via the fxtwitter API mirror'
[21]: https://x.com/steipete/status/2078277297791189132 'Steinberger on X, loops or graphs (18 Jul 2026); read via the fxtwitter API mirror'
