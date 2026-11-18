---
type: research
title: 'Why does telling a delegate the purpose and end state, not the steps, let
  them act on their own, and where does that stop working?'
description: 'Mission command and Marquet let those nearest the work act within a stated purpose, and OpenAI advises goals for reasoning models, but Anthropic also asks for explicit instructions.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-18T00:58:00+01:00
stale_after: 2027-05-18T00:00:00+01:00
sources:
  - id: 1
    resource: https://brightspotcdn.byui.edu/e6/50/278fcd0e464796162f3fb9d0ef70/adp-6-0-mission-command.pdf
    title: 'US Army, ADP 6-0 Mission Command (17 May 2012), copy hosted by Brigham Young University-Idaho'
  - id: 2
    resource: https://www.army.mil/article/106872/Understanding_mission_command/
    title: 'Sharpe and Creviston, Understanding mission command (army.mil, 30 April 2015)'
  - id: 3
    resource: https://www.penguinrandomhouse.com/books/314163/turn-the-ship-around-by-l-david-marquet/
    title: 'Marquet, Turn the Ship Around! (publisher page)'
  - id: 4
    resource: https://developers.openai.com/api/docs/guides/prompt-engineering
    title: 'OpenAI, Prompt engineering'
  - id: 5
    resource: https://developers.openai.com/api/docs/guides/reasoning-best-practices
    title: 'OpenAI, Reasoning best practices'
  - id: 6
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices'
  - id: 7
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents'
---

# Why does telling a delegate the purpose and end state, not the steps, let them act on their own, and where does that stop working?

## Context

Asked to support "Autonomy through intent", the third principle of an agentic workflow: the delegator states what the work is for and what done looks like, and the delegate decides how. The question covers the principle's lineage in military doctrine (mission command, commander's intent) and in Marquet's intent-based leadership, and what AI vendors' guidance says about goals versus step-by-step instructions. Vendor guidance is read from the vendors' own documentation.

## Answer

The principle has a documented lineage and partial vendor support, with two limits. In US Army doctrine, mission orders "emphasize to subordinates the results to be attained, not how they are to achieve them", and the freedom this gives is "disciplined initiative" bounded by the commander's intent, resting on mutual trust that "must be earned" [1]. Marquet's version moves the other way: the crew states "I intend to…" and the captain approves [3], and the publisher's page has readers pairing control with competence and clarity. OpenAI tells builders a reasoning model is like a senior co-worker who can be given a goal, while a GPT model needs explicit instructions [4]; Anthropic advises general instructions over prescriptive steps for thinking, yet also asks for clear, explicit instructions and for the motivation behind them [6]. Autonomy for agents carries higher cost and compounding errors, and needs testing and guardrails [7].

## Findings

1. ADP 6-0 defines mission command as "the exercise of authority and direction by the commander using mission orders to enable disciplined initiative within the commander's intent" [1].
2. The commander's intent is "a clear and concise expression of the purpose of the operation and the desired military end state", and it "defines the limits within which subordinates may exercise initiative" [1].
3. Mission orders "emphasize to subordinates the results to be attained, not how they are to achieve them" and give "the maximum freedom of action in determining how best to accomplish missions"; commanders still supervise but "do not micromanage" [1].
4. Disciplined initiative is "action in the absence of orders, when existing orders no longer fit the situation, or when unforeseen opportunities or threats arise" [1].
5. The doctrine names mutual trust as the first principle: "Trust takes time and must be earned" [1]. The principles also include accepting prudent risk [2].
6. An army.mil article by two retired officers traces mission command to the Prussian reforms after the defeat at Jena and Auerstedt in 1806, and to a 1837 field service regulation that an officer unable to execute an order "should seek to act in line with the intention behind it" [2]. The article is a retrospective and itself cites other works.
7. The publisher's page for Marquet's book describes a shift "from take-control authority to give-control empowerment" through practices such as "I intend to..." [3]. Its endorsements describe the "three legs (control, competence, clarity)" of his Leader-Leader model; that wording is a reader's, not Marquet's text.
8. OpenAI: "A reasoning model is like a senior co-worker. You can give them a goal to achieve and trust them to work out the details. A GPT model is like a junior coworker. They'll perform best with explicit instructions" [4]. Reasoning models, it adds, can understand the user's intent from a simple prompt and often ask clarifying questions before guessing [5].
9. Anthropic: "Prefer general instructions over prescriptive steps. A prompt such as 'think thoroughly' often produces better reasoning than a hand-written step-by-step plan" [6]. The same guide says Claude "responds well to clear, explicit instructions" and that giving "context or motivation behind your instructions" helps it deliver more targeted responses [6].
10. Anthropic's agent guidance says agents suit open-ended problems where steps cannot be predicted, that "you must have some level of trust in its decision-making", and that autonomy means "higher costs, and the potential for compounding errors", so it recommends extensive sandbox testing and guardrails [7].

## Caveats

- The intent in mission command is stated by the superior and travels down; in Marquet's "I intend to" the subordinate states it and it travels up. The principle's wording does not say which, so "intent" carries both senses.
- Doctrine says initiative is bounded by intent and rests on earned trust; neither source says intent creates autonomy. The doctrine's own term is initiative "within" intent.
- ADP 6-0 is read in the 2012 edition, in a copy hosted by a university; later editions were not read. Marquet's book itself was not read; Finding 7 rests on the publisher's page alone.
- The OpenAI guidance names o-series and GPT-4.1 models, and Anthropic's guide covers named Claude models: both are vendor advice at a point in time, not measurements that goals beat steps. The vendors differ in emphasis.
- No source found here measures goal-first delegation against step-first delegation for agents.

[1]: https://brightspotcdn.byui.edu/e6/50/278fcd0e464796162f3fb9d0ef70/adp-6-0-mission-command.pdf 'US Army, ADP 6-0 Mission Command (17 May 2012), copy hosted by Brigham Young University-Idaho'
[2]: https://www.army.mil/article/106872/Understanding_mission_command/ 'Sharpe and Creviston, Understanding mission command (army.mil, 30 April 2015)'
[3]: https://www.penguinrandomhouse.com/books/314163/turn-the-ship-around-by-l-david-marquet/ 'Marquet, Turn the Ship Around! (publisher page)'
[4]: https://developers.openai.com/api/docs/guides/prompt-engineering 'OpenAI, Prompt engineering'
[5]: https://developers.openai.com/api/docs/guides/reasoning-best-practices 'OpenAI, Reasoning best practices'
[6]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices 'Anthropic, Prompting best practices'
[7]: https://www.anthropic.com/engineering/building-effective-agents 'Anthropic, Building effective agents'
