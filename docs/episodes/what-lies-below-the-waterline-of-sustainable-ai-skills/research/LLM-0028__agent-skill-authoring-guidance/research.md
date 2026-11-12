---
type: research
title: 'Why do the agentskills.io standard and Anthropic''s authoring guidance recommend writing skills the way they do?'
description: 'Only a skill''s description is always loaded, so it must say when to use it; Google, not the standard or Anthropic, also recommends a "Do NOT use for" line, and none of the advice is measured.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T17:31:58Z
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
  - id: 7
    resource: https://www.kaggle.com/whitepaper-agent-skills
    title: 'Singhal, Hernandez Larios, Dus, Nigam and Kolan (Google), Agent Skills, Day 3 whitepaper of the 5-Day AI Agents Intensive'
---

# Why do the agentskills.io standard and Anthropic's authoring guidance recommend writing skills the way they do?

## Context

Asked to support claims about how to write a skill's description, how to structure its reference files, and how to create a skill from a run that worked. Each recommendation is checked here against the wording of the standard, Anthropic's guide, the Agent Skills paper and Google's Day 3 whitepaper, and the places where these vendors disagree are flagged.

## Answer

The recommendations follow from how agents load skills: only each skill's name and description sit in context at startup, so the description alone decides when the skill is used, and everything else is read on demand. Long reference files get a contents list and links stay one level deep because the agent may preview files with partial reads and then miss what is deeper. A skill is best created by completing a real task with an agent and extracting the pattern. The three popular claims are in one source only, Google's Day 3 whitepaper [7]: a "Do NOT use for" line in the description, "3 positive and 3 negative triggers", and "One skill, one job". The agentskills.io standard and Anthropic's guide make none of them. The standard [3] and Anthropic's skill-creator [5] both ask for about 20 trigger queries with near-misses as the negatives, and both ask for "pushy" descriptions. All of this is vendor guidance, and no source measures it.

## Findings

1. Agents load a skill in three steps: the name and description at startup for all skills (about 100 tokens), the full SKILL.md body when the skill is activated, and files in `scripts/`, `references/` or `assets/` only when required [1].
2. Because only name and description are loaded at startup, "the description carries the entire burden of triggering. If the description doesn't convey when the skill is useful, the agent won't know to reach for it" [3].
3. The standard says a description "Should describe both what the skill does and when to use it" and include keywords that help agents identify relevant tasks [1]. Anthropic says the same and adds specific triggers and contexts, because Claude chooses among potentially 100+ skills by it [4].
4. The description guidance is positive, not a "not for" line: "Use imperative phrasing", "Focus on user intent, not implementation", and "Err on the side of being pushy. Explicitly list contexts where the skill applies" [3]. Anthropic's skill-creator tells its author to make descriptions "a little bit 'pushy'" because Claude tends to undertrigger [5]. None of [1] to [6] recommends writing a "not for" or "when NOT to use" clause in the description; Google's Day 3 whitepaper does (finding 14) [7].
5. Over-triggering is addressed through testing, not description wording: the most valuable negative test queries are "near-misses — queries that share keywords or concepts with your skill but actually need something different", which "test whether the description is precise, not just broad" [3]. So in [3] over-triggering is a testing concern, and a "not for" line is not what it recommends.
6. The trigger eval set in [3] is "about 20 queries: 8-10 that should trigger and 8-10 that shouldn't", each run about 3 times. The number three in Anthropic's guide is different: "Build three scenarios that test these gaps", for evaluating a skill's output against a no-skill baseline, not trigger tests [3][4]. Anthropic's skill-creator [5] gives the same 20-query trigger set: "Create 20 eval queries", 8-10 should-trigger and 8-10 should-not-trigger, where the most valuable negatives are near-misses that share keywords but need something different [5].
7. Reference files over 100 lines get a contents list: "For reference files longer than 100 lines, include a table of contents at the top. This ensures Claude can see the full scope of available information even when previewing with partial reads" [4].
8. References stay one level deep because "Claude might partially read files when they're referenced from other referenced files... might use commands such as head -100 to preview content rather than reading entire files, resulting in incomplete information. Keep references one level deep from SKILL.md" [4]. The standard states the rule without the reason: "Keep file references one level deep from SKILL.md. Avoid deeply nested reference chains" [1].
9. Long skills move detail into references: "Keep your main SKILL.md under 500 lines. Move detailed reference material to separate files" [1], with a recommended body under 5,000 tokens [2]. The guide adds that the key is telling the agent when to load each file, for example "Read references/api-errors.md if the API returns a non-200 status code" [2]. Anthropic's guide gives the same advice for workflows: "If workflows become large or complicated with many steps, consider pushing them into separate files" [4].
10. On scope, the standard says a skill should "encapsulate a coherent unit of work that composes well with other skills"; too narrow forces several skills to load, "Skills scoped too broadly become hard to activate precisely" [2]. The "if you cannot describe it in one sentence, it is two skills" test appears in none of [1][2][4][6]; the nearest wording is the database-querying-plus-administration example in [2]. It does appear in [7] (finding 16).
11. The standard recommends creating a skill from a real run: "Complete a real task in conversation with an agent, providing context, corrections, and preferences along the way. Then extract the reusable pattern into a skill", paying attention to steps that worked and corrections made. It warns that a skill an LLM writes from general knowledge alone yields "vague, generic procedures" [2].
12. Anthropic's skill-creator does this on request: "The current conversation might already contain a workflow the user wants to capture (e.g., they say 'turn this into a skill'). If so, extract answers from the conversation history first", then interviews the user to fill gaps [5].
13. The Agent Skills paper describes the same three-level loading ("Level 1 serves as a table of contents") but gives no authoring rules about "not for" lines, contents lists, reference depth or a one-sentence test [6].

14. Google's Day 3 whitepaper recommends a "not for" clause in the description. Its description template reads "Do NOT use for [anti-trigger 1] or [anti-trigger 2]", its example reads "Do NOT use for employee shift scheduling or financial accounting", its description checklist says "Include **when NOT to use** to prevent over-triggering", and its anatomy section says to "explicitly state what it is not for" [7]. It sits beside "be pushy if the model under-triggers" in the same bullet list, so the whitepaper asks for both. The standard's and Anthropic's descriptions advice contain no such clause (finding 4) [3][4][5]. The whitepaper gives no measurement that the clause prevents over-triggering.
15. Trigger testing is sized differently by each source. [7] says "to hit the industry-standard 90% trigger accuracy rate" a description must pass four checks, the first being "Testable specificity: You must write 3 positive and 3 negative triggers", with no source for the "industry-standard" rate. The same whitepaper also says to write "three eval cases (two positive, one negative) before drafting the body", lists "You can't write three test cases for it" as a smell, and asks for "Positive AND negative test cases. Target 90% trigger accuracy" [7]. So [7] gives six trigger cases in one place and three cases, two positive and one negative, in another. The agentskills.io guide asks for about 20 queries, 8-10 that should trigger and 8-10 that should not, each run about 3 times, with near-misses as the negatives [3] (finding 6). Neither number comes with a measured basis.
16. Google's Day 3 whitepaper states the scope test in its five rules: "One skill, one job. If you cannot describe what the skill does in one sentence, it is two skills. Decompose before writing." A second list repeats it as "One skill, one job. If the description needs "and" between unrelated capabilities, split it." [7] The standard says a skill should encapsulate "a coherent unit of work" and warns that too-broad skills are hard to activate [2] (finding 10), which is the same direction without the one-sentence test.
17. The whitepaper's anatomy calls the description "your routing algorithm. It is the only thing the model sees to decide whether to load the Agent Skill" and says "Spend more time here than anywhere else" [7]. This matches the standard's account that the description carries the entire burden of triggering [3] (finding 2). It recommends "State what it does, front-load trigger keywords, be pushy if the model under-triggers", also in line with [3][5].
18. For long material the whitepaper says references "that is only relevant once the skill is running (domain principles, definitions, edge case handling) lives in references/ and loads on demand", and "if the SKILL.md is starting to get long, the next paragraph probably belongs in references/ and not in the body" [7]. Its numeric limit differs in unit from the standard's: "Over 5,000 words. Probably two skills, or reference material that should live in references/" and "Write SKILL.md bodies over 5,000 words" as a don't [7], against "under 500 lines" and about 5,000 tokens in [1][2]. Five thousand words is more than five thousand tokens, so Google's limit is looser.
19. The whitepaper also gives its creation route: have the most experienced practitioner narrate three workflows, run the most repeated one without a skill, then draft SKILL.md from the transcript, and "Resist the urge to let an LLM generate fifty skills on day one" [7]. This agrees with the standard's advice to extract a skill from a real run (finding 11) [2].

## Caveats

The recommendations are documentation guidance; none of the sources measures whether a contents list, one-level links, a "not for" line, a count of trigger queries or a one-sentence scope test improves results. The Day 3 whitepaper [7] is Google's guidance, a high-trust source for what Google recommends, not evidence that its templates work; its "industry-standard 90% trigger accuracy" is uncited, and its own trigger-test counts disagree (finding 15). Its authors are spelled "Dus" in the local copy and "Das" on the Kaggle page; the text quoted here comes from the converted local copy at `docs/llm-wiki/raw/google-5-day-agents-vibecoding/Day 3 - Agent Skills/Day 3 - Agent Skills.md`, dated 2026, and the Kaggle page was not re-read. The reason for the 100-line threshold and `head -100` previews is Anthropic's own account of Claude's behaviour and may differ in other agents. Documentation pages change; the web pages were read on the generation date. Where the vendors differ, the "not for" line is Google's recommendation [7] and the "pushy" advice is shared by Google, the standard and Anthropic [3][5][7]; adding a "not for" line is a choice between sources, with near-miss testing [3] as the standard's own route to precision.

[1]: <https://agentskills.io/specification> "Agent Skills, Specification"
[2]: <https://agentskills.io/skill-creation/best-practices> "Agent Skills, Best practices for skill creators"
[3]: <https://agentskills.io/skill-creation/optimizing-descriptions> "Agent Skills, Optimizing skill descriptions"
[4]: <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices> "Anthropic, Skill authoring best practices"
[5]: <https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md> "Anthropic, skill-creator SKILL.md"
[6]: <https://arxiv.org/abs/2602.12430> "Xu and Yan, Agent Skills for Large Language Models: Architecture, Acquisition, Security, and the Path Forward"
[7]: <https://www.kaggle.com/whitepaper-agent-skills> "Singhal, Hernandez Larios, Dus, Nigam and Kolan (Google), Agent Skills, Day 3 whitepaper of the 5-Day AI Agents Intensive"
