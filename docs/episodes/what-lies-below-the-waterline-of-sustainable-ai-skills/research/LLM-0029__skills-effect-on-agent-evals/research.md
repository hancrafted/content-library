---
type: research
title: 'Why do agent skills help or hurt agent results, and what do the Vercel evals and newer benchmarks show?'
description: 'Skills help when invoked and focused; they do nothing unused and hurt when bloated, mismatched or self-written. Vercel measured a tie with no skill, not a loss.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T00:00:00Z
stale_after: 2027-05-12T00:00:00Z
sources:
  - id: 1
    resource: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
    title: 'Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals'
  - id: 2
    resource: https://arxiv.org/abs/2602.12670
    title: 'Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks'
  - id: 3
    resource: https://arxiv.org/abs/2603.15401
    title: 'Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering?'
---

# Why do agent skills help or hurt agent results, and what do the Vercel evals and newer benchmarks show?

## Context

Asked to support claims that a skill is only as good as the agent's decision to use it, that a short always-loaded index can beat skills left to be found, and that a skill can do worse than none. The claims rest on one vendor eval, so the question checks each number against its source and adds independent benchmarks from 2026.

## Answer

A skill helps when the agent actually invokes it and it carries focused procedure the agent would otherwise lack. It does nothing when the agent never opens it, and it hurts when it is bloated, mismatched to the project, or written by the agent itself. Vercel's January 2026 eval found skills unused in 56% of cases and a skill tying the no-skill baseline at 53%; the "skill scored below no skill" figure is not Vercel's headline, and the clean below-baseline result comes from SkillsBench for self-generated skills. Vercel's eval is a single vendor test with no named model, so treat it as an illustration, not a general law.

## Findings

1. Vercel's suite targeted Next.js 16 APIs that are not in model training data. The post names no model, agent, number of eval cases or number of retries [1].
2. The 56% figure is worded "In 56% of eval cases, the skill was never invoked." It measures non-invocation of the documentation skill in the default skill configuration, not a share of all skills in general [1].
3. Pass rates in Vercel's post: baseline with no docs 53%; skill by default 53% (+0 points); skill with explicit instructions 79% (+26); `AGENTS.md` docs index 100% (+47). The explicit instructions raised the trigger rate to 95% or more [1].
4. The index was a compressed docs index of about 8KB, cut from about 40KB with the 100% pass rate held. "Short" is Vercel's compression, and it is a docs index, not a procedure [1].
5. The skill did not score below no skill on the headline pass rate: both were 53%. Only the sub-scores dip: lint 89% against 95%, test 58% against 63%, build equal at 84%. Vercel reads this as a hint, "that an unused skill in the environment may introduce noise or distraction" [1].
6. Vercel's own "working theory" for the index winning is that there is no decision point and that skills load only when invoked, while `AGENTS.md` content is in the system prompt on every turn [1].
7. Wording was fragile. "You MUST invoke the skill" made the agent read docs first and miss project context; "Explore project first, then invoke skill" gave better results. Vercel states "Same skill. Same docs. Different outcomes based on subtle wording changes." [1]
8. Vercel does not claim skills are worse in general: skills suit "vertical, action-specific workflows that users explicitly trigger," and the post says the two approaches complement each other. Vercel ran the evals itself and promotes a tool built on the result [1].
9. SkillsBench (87 tasks, 8 domains, 18 model-harness configurations, version 4 of June 2026) finds curated skills raise the average pass rate from 33.9% to 50.5% (+16.6 points), with per-configuration gains from +4.1 to +25.7 points [2].
10. The same paper finds focused skills with at most three modules beat larger or exhaustive bundles. Tasks with one skill gain +18.0 points, two or three skills +19.0, four or more only +10.1; detailed skills gain +14.5 against +19.0 and +21.5 for compact and standard ones; comprehensive documentation gains +0.7 [2].
11. SkillsBench's clear case of a skill scoring below no skill: skills written by the agent itself land below the no-skill baseline on all three configurations tested, by 8.1 to 11.5 points. Its audit attributes this to packs the solver never discovers, authoring effort that displaces solving, and confidently wrong content. The authors note the deficit mixes content quality with discovery and interference effects [2].
12. SkillsBench also reports 13 of 87 tasks with a negative skill effect, where the skill prescribes a heavyweight pipeline, displaces a stronger default strategy, or points the agent at a solver it cannot debug [2].
13. SWE-Skills-Bench pairs 98 public software-engineering skills with real repositories pinned at a fixed commit, 3,920 paired runs. 92 of 98 skills show no statistically significant effect, and the average pass ratio moves only from 76.6% to 76.9% (version 2 abstract) [3].
14. In the same study the few helpful skills supply procedures the agent would otherwise omit (up to +17.7 points), while harmful ones anchor the agent on their own templates and override the task's explicit instructions (losses up to -17.0 points) [3].

## Caveats

- Vercel's numbers come from one vendor's own eval on one framework's new APIs, without a named model or case count; there is no independent replication. The "unused skill adds noise" idea is Vercel's hypothesis, not a measured result.
- SkillsBench's self-generated condition covers only three configurations and is task-local (skills are written after the task is revealed), so it does not show that a skill a human distils from a good run hurts.
- The preprints were revised: SkillsBench numbers differ between versions, and SWE-Skills-Bench version 2 reports different figures (98 skills, 76.6% to 76.9%) than version 1 (49 skills, 565 tasks, 89.8% to 91.0%, as reported by a search summary, not read in the source). Cite the version stated here.
- The mechanisms in findings 6 and 11 to 14 are the authors' attribution from audits or theory, not controlled isolations. Neither benchmark measures a person's skill for a non-coding task.
- Slide wording to check: "left unused 56% of the time" is accurate only for the default Next.js docs skill in Vercel's eval. "A skill scored below having no skill" is accurate for SkillsBench's self-generated skills and SWE-Skills-Bench's harmful skills, not for Vercel's headline result, where it tied the baseline.

[1]: <https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals> "Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals"
[2]: <https://arxiv.org/abs/2602.12670> "Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks"
[3]: <https://arxiv.org/abs/2603.15401> "Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering?"
