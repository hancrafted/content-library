---
type: research
title: 'Why does a skill''s audience and scope decide where its context lives and how much care it needs?'
description: 'Vendors tie skill location to audience and reach, and evals favour keeping project specifics out of reusable skills, but no published framework offers an audience-by-scope matrix.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T00:00:00Z
stale_after: 2027-05-12T00:00:00Z
sources:
  - id: 1
    resource: https://code.claude.com/docs/en/skills
    title: 'Anthropic, Extend Claude with skills (Claude Code documentation)'
  - id: 2
    resource: https://learn.chatgpt.com/docs/build-skills
    title: 'OpenAI, Build skills (Codex documentation)'
  - id: 3
    resource: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
    title: 'GitHub, About agent skills'
  - id: 4
    resource: https://agentskills.io/client-implementation/adding-skills-support
    title: 'Agent Skills, How to add skills support to your agent'
  - id: 5
    resource: https://agentskills.io/skill-creation/best-practices
    title: 'Agent Skills, Best practices for skill creators'
  - id: 6
    resource: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
    title: 'Anthropic, Skill authoring best practices'
  - id: 7
    resource: https://arxiv.org/abs/2603.15401
    title: 'Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering?'
  - id: 8
    resource: https://arxiv.org/abs/2602.12670
    title: 'Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks'
  - id: 9
    resource: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
    title: 'Vercel, AGENTS.md outperforms skills in our agent evals'
  - id: 10
    resource: https://arxiv.org/abs/2604.16911
    title: 'Saha and Hemanth, Skilldex: A Package Manager and Registry for Agent Skill Packages with Hierarchical Scope-Based Distribution'
  - id: 11
    resource: https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase2
    title: 'Microsoft, Implement a zoned governance strategy (Copilot Studio)'
  - id: 12
    resource: https://arxiv.org/abs/2603.14805
    title: 'Bakal, Knowledge Activation: AI Skills as the Institutional Knowledge Primitive for Agentic Software Development'
---

# Why does a skill's audience and scope decide where its context lives and how much care it needs?

## Context

Asked to support a rule of thumb that places a skill in one of four squares, by audience (only you, or shared) and scope (one project, or many), and reads off where project details belong (inside the skill or beside it) and how much ownership and testing the skill needs. The question is whether vendors, evals and published frameworks back each part of that rule, and whether any framework offers the matrix itself.

## Answer

Vendors already tie where a skill is stored to who gets it and how far it reaches: personal folders reach every project of one user, repository folders reach everyone working in that repository, and plugins or admin locations reach whole teams. Evals and authoring guidance support keeping project specifics out of a reusable skill, because hard-coded paths, templates and surplus context made skills fail, and project facts are best read from files the skill points to. No published framework combines the two axes into a 2×2 with care levels per square; the nearest are one-axis tier schemes (a three-tier scope system for skill packages, zoned governance for agents). The matrix is therefore a rule of thumb assembled from vendor locations, eval findings and tiered-governance practice, not a tested model.

## Findings

1. Claude Code ties location to reach. A skill saved under the home directory loads "in every project", one committed to a repository is shared "with everyone who works there", and a plugin or managed settings reach "a whole team" [1]. Its location table lists enterprise, personal (all your projects on this machine), project (this repository, committed so the team gets it), nested (a subdirectory) and plugin (wherever the plugin is enabled, namespaced as `/plugin-name:skill-name`) [1].
2. On a name clash Claude Code ranks enterprise over personal over project, so a personal `deploy` beats the project's `deploy`; plugin skills never clash because they are namespaced [1]. Scope therefore decides which copy wins as well as who sees it.
3. Codex names the same scopes by reach: a repository folder at the working directory is for "skills only relevant to a microservice or a module", the repository root serves any subfolder, the user folder is for skills "that apply to any repository the user may work in", plus admin and bundled system locations [2]. Codex does not merge same-named skills and says plugins are the way to share widely or bundle skills with a connector, while direct folders suit "local authoring and repo-scoped workflows" [2].
4. GitHub Copilot distinguishes project skills (in `.github/skills`, `.claude/skills` or `.agents/skills`) from personal skills in the home directory "shared across projects" (`~/.copilot/skills` or `~/.agents/skills`), and warns that supported locations depend on the surface, so a personal skill may not exist in a cloud agent [3].
5. The agentskills.io implementation guide says most local agents scan at least a project level ("Skills specific to a project or repository") and a user level ("available across all projects"), notes that organisation-wide and bundled scopes exist, and calls "project-level skills override user-level skills" the universal collision convention [4]. The format specification does not fix where directories live, but `.agents/skills/` has become a cross-client convention [4]. It also warns that project skills come from a repository that may be untrusted and suggests gating them on a trust check [4].
6. Reading the vendor tables as two axes shows what they cover: location encodes audience and reach together. Personal means one user across projects, project means a repository and its team, plugin and admin mean many teams [1][2][3][4]. None of the pages offers a location for "only me, only this project", and none states how much review or testing each location needs.
7. For keeping project specifics out of the reusable skill, the authoring standard says a skill "should teach the agent how to approach a class of problems, not what to produce for a specific instance", while still allowing specific details such as output templates, and its example reads the schema from `references/schema.yaml` instead of writing joins into the skill [5]. Claude Code supplies `${CLAUDE_PROJECT_DIR}` so a skill can reference project-local files "independent of where the skill is installed" [1].
8. Cost and performance trade-offs of putting more inside a skill: once loaded, a skill's content "stays in context across turns, so every line is a recurring token cost" [1], and every token "competes for the agent's attention" [5]. The guidance is to add only what the agent lacks, such as project conventions, because overly comprehensive skills "can hurt more than they help" [5][6]. The same standard names the opposite risk: skills scoped too narrowly force several to load together, skills scoped too broadly "become hard to activate precisely" [5].
9. A benchmark of 98 public software engineering skills, each run with and without the skill against a real repository, found that 92 had no statistically significant effect, and attributes harm to a "mismatch between the holistic scope of a skill and the focused requirements of individual tasks" [7]. In its worked example a generic workflow template made the agent write files to `.github/workflows/` when the task required `ci/`; the authors conclude skills should "favor abstract guidance patterns over concrete, opinionated templates with hard-coded paths and values" [7]. This is evidence that project facts hard-coded into a general skill can override the task, not a test of the 2×2.
10. The same benchmark reports that 40 of 98 skills change sign between two harnesses running the same model, and tells users to evaluate a skill "with the model, agent, and repositories in which it will be deployed" [7]. A skill's value therefore depends on where it runs, which is the case for evals on a skill shared beyond its author's setup.
11. SkillsBench reports that curated skills raised the average pass rate from 33.9% to 50.5% across 87 tasks and 18 configurations, and that "focused Skills with at most three modules outperform larger or exhaustive bundles" [8]. Anthropic's guide asks authors to write evaluations first, test against a baseline without the skill, and test with each model they plan to use [6].
12. Vercel's evals found skills were never invoked in 56% of cases and that a compressed docs index in `AGENTS.md` reached a 100% pass rate against 53% for skills without instructions; it concludes that "for general framework knowledge, passive context currently outperforms on-demand retrieval" and that skills suit "vertical, action-specific workflows that users explicitly trigger" [9]. This supports keeping always-needed project facts in project context rather than in a skill the agent may not open.
13. On tiers, one paper proposes a package manager whose skills install at a "three-tier hierarchical scope system" and bundles related skills with shared vocabulary and reference files [10]. Its abstract reports no performance evaluation and does not name the tiers [10]. This is a distribution design, not evidence that tiers change outcomes.
14. Microsoft's zoned governance for Copilot Studio agents ties care to audience: personal productivity agents stay private with sharing disabled, agents built for other teams need approved environments, sharing policies, lifecycle pipelines and admin approval to publish, and large enterprise agents are reserved for professional developers and can carry service-level agreements [11]. This supports "more reach, more care", on the audience axis only and for agents, not skills [11].
15. A conceptual paper argues that the limiting factor for agents "is not model capability but knowledge architecture" and proposes governance-aware skill units; its evidence is a self-reported survey of 67 engineers at one company, and it does not separate skills from project context files [12].

## Caveats

No source presents or tests an audience-by-scope matrix, so the four squares, the placement of details (inside versus beside) and the care levels per square are an inference from findings 1 to 14, not a published finding. The vendor pages show where skills are stored and who sees them; they do not state ownership, versioning or evaluation requirements per location, and the care column rests on findings 10, 11 and 14, which are about evals generally, skills shared across harnesses, and agents. The skill benchmarks measure software tasks on fixed repositories; neither compares project-specific with general skills directly, and the benchmark finding on hard-coded paths is one worked example. Vercel's result concerns one framework's documentation and one eval suite. Documentation pages and product locations change; all pages were read on the generation date. Microsoft's zones come from a product for building agents, and the three-tier scope paper is a tool description without outcome data.

[1]: <https://code.claude.com/docs/en/skills> "Anthropic, Extend Claude with skills (Claude Code documentation)"
[2]: <https://learn.chatgpt.com/docs/build-skills> "OpenAI, Build skills (Codex documentation)"
[3]: <https://docs.github.com/en/copilot/concepts/agents/about-agent-skills> "GitHub, About agent skills"
[4]: <https://agentskills.io/client-implementation/adding-skills-support> "Agent Skills, How to add skills support to your agent"
[5]: <https://agentskills.io/skill-creation/best-practices> "Agent Skills, Best practices for skill creators"
[6]: <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices> "Anthropic, Skill authoring best practices"
[7]: <https://arxiv.org/abs/2603.15401> "Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering?"
[8]: <https://arxiv.org/abs/2602.12670> "Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks"
[9]: <https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals> "Vercel, AGENTS.md outperforms skills in our agent evals"
[10]: <https://arxiv.org/abs/2604.16911> "Saha and Hemanth, Skilldex: A Package Manager and Registry for Agent Skill Packages with Hierarchical Scope-Based Distribution"
[11]: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase2> "Microsoft, Implement a zoned governance strategy (Copilot Studio)"
[12]: <https://arxiv.org/abs/2603.14805> "Bakal, Knowledge Activation: AI Skills as the Institutional Knowledge Primitive for Agentic Software Development"
