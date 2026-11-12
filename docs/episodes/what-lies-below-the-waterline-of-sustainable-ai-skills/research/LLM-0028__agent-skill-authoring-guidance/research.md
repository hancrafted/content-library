---
type: research
title: 'Why do the agentskills.io standard and Anthropic''s authoring guidance recommend writing skills the way they do?'
description: 'Only a skill''s description is always loaded, so it must say when to use it, and partial file reads explain contents lists and one-level links; "not for" lines are not in the sources.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T00:00:00Z
stale_after: 2027-05-12T00:00:00Z
sources:
  - id: 1
    resource: https://agentskills.io/specification
    title: 'Agent Skills, Specification'
  - id: 2
    resource: https://agentskills.io/skill-creation/best-practices
    title: 'Agent Skills, Best practices for skill creators'
  - id: 3
    resource: https://agentskills.io/skill-creation/optimizing-descriptions
    title: 'Agent Skills, Optimizing skill descriptions'
  - id: 4
    resource: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
    title: 'Anthropic, Skill authoring best practices'
  - id: 5
    resource: https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md
    title: 'Anthropic, skill-creator SKILL.md'
  - id: 6
    resource: https://arxiv.org/abs/2602.12430
    title: 'Xu and Yan, Agent Skills for Large Language Models: Architecture, Acquisition, Security, and the Path Forward'
---

# Why do the agentskills.io standard and Anthropic's authoring guidance recommend writing skills the way they do?

## Context

Asked to support claims about how to write a skill's description, how to structure its reference files, and how to create a skill from a run that worked. Each recommendation is checked here against the wording of the standard, Anthropic's guide and the Agent Skills paper, and each claim the sources do not make is flagged.

## Answer

The recommendations follow from how agents load skills: only each skill's name and description sit in context at startup, so the description alone decides when the skill is used, and everything else is read on demand. Long reference files get a contents list and links stay one level deep because the agent may preview files with partial reads and then miss what is deeper. A skill is best created by completing a real task with an agent and extracting the pattern. Three popular claims are not in the sources: an explicit "not for" line in the description, the "one sentence or it is two skills" test, and "three positive and three negative" trigger tests.

## Findings

1. Agents load a skill in three steps: the name and description at startup for all skills (about 100 tokens), the full SKILL.md body when the skill is activated, and files in `scripts/`, `references/` or `assets/` only when required [1].
2. Because only name and description are loaded at startup, "the description carries the entire burden of triggering. If the description doesn't convey when the skill is useful, the agent won't know to reach for it" [3].
3. The standard says a description "Should describe both what the skill does and when to use it" and include keywords that help agents identify relevant tasks [1]. Anthropic says the same and adds specific triggers and contexts, because Claude chooses among potentially 100+ skills by it [4].
4. The description guidance is positive, not a "not for" line: "Use imperative phrasing", "Focus on user intent, not implementation", and "Err on the side of being pushy. Explicitly list contexts where the skill applies" [3]. Anthropic's skill-creator tells its author to make descriptions "a little bit 'pushy'" because Claude tends to undertrigger [5]. None of [1] to [6] recommends writing a "not for" or "when NOT to use" clause in the description.
5. Over-triggering is addressed through testing, not description wording: the most valuable negative test queries are "near-misses — queries that share keywords or concepts with your skill but actually need something different", which "test whether the description is precise, not just broad" [3]. A "not for" line is therefore the author's own reading of that advice, not a quoted recommendation.
6. The trigger eval set in [3] is "about 20 queries: 8-10 that should trigger and 8-10 that shouldn't", each run about 3 times. The number three in Anthropic's guide is different: "Build three scenarios that test these gaps", for evaluating a skill's output against a no-skill baseline, not trigger tests [3][4].
7. Reference files over 100 lines get a contents list: "For reference files longer than 100 lines, include a table of contents at the top. This ensures Claude can see the full scope of available information even when previewing with partial reads" [4].
8. References stay one level deep because "Claude might partially read files when they're referenced from other referenced files... might use commands such as head -100 to preview content rather than reading entire files, resulting in incomplete information. Keep references one level deep from SKILL.md" [4]. The standard states the rule without the reason: "Keep file references one level deep from SKILL.md. Avoid deeply nested reference chains" [1].
9. Long skills move detail into references: "Keep your main SKILL.md under 500 lines. Move detailed reference material to separate files" [1], with a recommended body under 5,000 tokens [2]. The guide adds that the key is telling the agent when to load each file, for example "Read references/api-errors.md if the API returns a non-200 status code" [2]. Anthropic's guide gives the same advice for workflows: "If workflows become large or complicated with many steps, consider pushing them into separate files" [4].
10. On scope, the standard says a skill should "encapsulate a coherent unit of work that composes well with other skills"; too narrow forces several skills to load, "Skills scoped too broadly become hard to activate precisely" [2]. The "if you can't describe it in one sentence, it is two skills" test appears in none of the fetched pages, nor in the Agent Skills paper [1][2][4][6]. The nearest wording is the database-querying-plus-administration example in [2].
11. The standard recommends creating a skill from a real run: "Complete a real task in conversation with an agent, providing context, corrections, and preferences along the way. Then extract the reusable pattern into a skill", paying attention to steps that worked and corrections made. It warns that a skill an LLM writes from general knowledge alone yields "vague, generic procedures" [2].
12. Anthropic's skill-creator does this on request: "The current conversation might already contain a workflow the user wants to capture (e.g., they say 'turn this into a skill'). If so, extract answers from the conversation history first", then interviews the user to fill gaps [5].
13. The Agent Skills paper describes the same three-level loading ("Level 1 serves as a table of contents") but gives no authoring rules about "not for" lines, contents lists, reference depth or a one-sentence test [6].

## Caveats

The recommendations are documentation guidance; none of the sources measures whether a contents list, one-level links or a "not for" line improves results. The reason for the 100-line threshold and `head -100` previews is Anthropic's own account of Claude's behaviour and may differ in other agents. Documentation pages change; both sites were read on the generation date. Whether to add a "not for" line is a reasonable inference from near-miss testing [3], not a source recommendation, and the skill-creator advice to be "pushy" pulls toward broader triggering [5].

[1]: <https://agentskills.io/specification> "Agent Skills, Specification"
[2]: <https://agentskills.io/skill-creation/best-practices> "Agent Skills, Best practices for skill creators"
[3]: <https://agentskills.io/skill-creation/optimizing-descriptions> "Agent Skills, Optimizing skill descriptions"
[4]: <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices> "Anthropic, Skill authoring best practices"
[5]: <https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md> "Anthropic, skill-creator SKILL.md"
[6]: <https://arxiv.org/abs/2602.12430> "Xu and Yan, Agent Skills for Large Language Models: Architecture, Acquisition, Security, and the Path Forward"
