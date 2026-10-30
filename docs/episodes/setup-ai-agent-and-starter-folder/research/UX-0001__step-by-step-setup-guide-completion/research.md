---
type: research
title: 'Why do first-timers finish a multi-step setup guide when it shows one
  step per screen, minimal instructions and visible progress?'
description: 'Visible progress and a head start raise completion through
  goal-gradient motivation, while small steps and minimal task-focused
  instructions keep working-memory load low for novices.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-29T16:20:56Z
stale_after: 2027-10-29T00:00:00Z
sources:
  - id: 1
    resource: https://www.w3.org/WAI/tutorials/forms/multi-page/
    title: 'W3C Web Accessibility Initiative, Forms Tutorial: Multi-page Forms'
  - id: 2
    resource: https://doi.org/10.1086/500480
    title: 'Nunes and Drèze, The Endowed Progress Effect: How Artificial Advancement
      Increases Effort'
  - id: 3
    resource: https://doi.org/10.1509/jmkr.43.1.39
    title: 'Kivetz, Urminsky and Zheng, The Goal-Gradient Hypothesis Resurrected:
      Purchase Acceleration, Illusionary Goal Progress, and Customer Retention'
  - id: 4
    resource: https://doi.org/10.1006/imms.1993.1081
    title: 'Lazonder and van der Meij, The minimal manual: is less really more?'
  - id: 5
    resource: https://doi.org/10.1207/S15326985EP3801_4
    title: 'Kalyuga, Ayres, Chandler and Sweller, The Expertise Reversal Effect'
  - id: 6
    resource: https://doi.org/10.1207/s15516709cog1202_4
    title: 'Sweller, Cognitive Load During Problem Solving: Effects on Learning'
---

# Why do first-timers finish a multi-step setup guide when it shows one step per screen, minimal instructions and visible progress?

## Context

Asked to support a design claim about multi-step instructions for novices: that splitting a task into small steps, trimming each to the minimum and showing progress raises the share of people who reach the end. The evidence comes from learning science and behavioural research, since no study tests a terminal setup guide itself.

## Answer

Three mechanisms work together. Small steps with minimal, task-focused instructions keep novices within working-memory limits, so each step stays doable. Visible progress, especially progress that starts with a head start, raises effort and completion because people speed up as the goal gets closer. A stated step count and position, as the W3C recommends for multi-page forms, supplies that progress signal. The evidence for each mechanism is strong; that all three together lift completion of a setup guide is an inference.

## Findings

1. Working memory is severely limited, and processing that does not build understanding uses capacity that learning needs [6].
2. Users of a minimal manual, which trims explanation and centres on real tasks, learned faster and better than users of a standard manual in a randomised study of 64 students, with no interaction with prior computer experience [4].
3. People accelerate as they near a goal: café customers bought coffee more often the closer they were to a free coffee, and online raters rated more songs per visit as the reward neared [3].
4. A head start on progress raises completion: car-wash loyalty cards needing 8 stamps, 10 with two pre-stamped, were redeemed by 34% of customers against 19% for blank 10-stamp cards after nine months, with identical real effort required [2].
5. The same endowed-progress effect appeared in a 12-stamp card with 2 bonus stamps, whose holders finished the 10 required purchases faster than holders of a plain 10-stamp card [3].
6. The W3C advises dividing long forms into a series of smaller logical steps, saying on the first step how many steps follow, and telling the user on each step how far along they are, for example "Step 2 of 4" [1].

## Caveats

Disputed and conditional claims:

- Minimalism versus guidance. The minimal manual result [4] compares manuals for a word processor, and its sample is students. Against it, the expertise reversal literature shows that instructional support helps novices and the same support hurts experts [5]. Detailed guidance can therefore serve true beginners better than a bare minimum; the minimal manual is task-focused, not information-free. Minimal instructions therefore still need error-recovery material for true beginners.
- The endowed-progress effect depends on a believable reason for the head start and on how progress is counted [2]. Findings 3 to 5 come from rewards (coffee, car washes, song ratings), not instructional tasks, so the transfer to a setup guide is an inference. The sources also show progress speeding purchases up near the goal, not removing early drop-off.
- Finding 1 rests on a theory paper with problem-solving experiments [6], not a test of step-by-step guides. Linking it to one step per screen is an inference.
- No source here measures completion rates of setup guides for people who have never opened a terminal.

[1]: <https://www.w3.org/WAI/tutorials/forms/multi-page/> "W3C Web Accessibility Initiative, Forms Tutorial: Multi-page Forms"
[2]: <https://doi.org/10.1086/500480> "Nunes and Drèze, The Endowed Progress Effect: How Artificial Advancement Increases Effort"
[3]: <https://doi.org/10.1509/jmkr.43.1.39> "Kivetz, Urminsky and Zheng, The Goal-Gradient Hypothesis Resurrected: Purchase Acceleration, Illusionary Goal Progress, and Customer Retention"
[4]: <https://doi.org/10.1006/imms.1993.1081> "Lazonder and van der Meij, The minimal manual: is less really more?"
[5]: <https://doi.org/10.1207/S15326985EP3801_4> "Kalyuga, Ayres, Chandler and Sweller, The Expertise Reversal Effect"
[6]: <https://doi.org/10.1207/s15516709cog1202_4> "Sweller, Cognitive Load During Problem Solving: Effects on Learning"
