---
type: research
title: 'Why does AI let individuals take on more complex tasks than before?'
description: 'AI completes longer tasks on its own and speeds up professional
  work inside its capability frontier, but only where the task fits the model
  and the person splits and checks the work.'
confidence: contested
informs: [ai-adoption, agentic-ai]
generated:
  by: claude-code/sonnet-4.6
  at: 2026-10-19T18:26:40Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2503.14499
    title: 'Kwa et al., Measuring AI Ability to Complete Long Tasks (METR)'
  - id: 2
    resource: https://www.anthropic.com/research/economic-index-primitives
    title: 'Anthropic, Economic Index: New building blocks for AI use (January 2026)'
  - id: 3
    resource: https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf
    title: "Dell'Acqua et al., Navigating the Jagged Technological Frontier, HBS
      Working Paper 24-013 (SSRN 4573321)"
  - id: 4
    resource: https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf
    title: 'Noy, Zhang, Experimental Evidence on the Productivity Effects of
      Generative Artificial Intelligence'
  - id: 5
    resource: https://arxiv.org/abs/2507.09089
    title: 'Becker, Rush, Barnes, Rein, Measuring the Impact of Early-2025 AI on
      Experienced Open-Source Developer Productivity'
---

# Why does AI let individuals take on more complex tasks than before?

## Context

Asked to support the claim that AI widens the range of tasks one person can take on, so the work shifts from doing every step to directing a capable system. The question concerns what AI makes feasible for an individual, not how much faster routine work gets.

## Answer

AI now performs, on its own, tasks that take a human expert tens of minutes to hours, and that length has been growing quickly. On realistic professional tasks inside the model's capability frontier, people using AI finished more tasks, faster and at higher quality, and in writing tasks the work moved from rough drafting towards idea generation and editing. The gain is conditional: it holds for tasks inside the model's capability frontier, and users get more from it by breaking tasks into steps and checking the output. The evidence that this makes people faster on every kind of work is disputed.

## Findings

1. METR measures AI capability as the length of task, in human expert time, that a model completes with 50% success. For frontier models in early 2025 this was around 50 minutes, and the authors report it has doubled roughly every seven months since 2019, perhaps faster in 2024 [1].
2. METR notes the forecast holds only if the results generalize to real-world software tasks, and it flags limits to the results' external validity [1].
3. Anthropic's usage data shows the estimated speedup rising with task complexity: about 9x for high-school-level tasks and about 12x for college-level tasks on Claude.ai, while success falls only from 70% to 66%. Anthropic notes the speedup scales more sharply with complexity than success drops [2].
4. Anthropic reports that users can break complex tasks into smaller steps, creating a feedback loop in which Claude corrects course, and that users also select tasks they are more confident will work, which inflates the observed success [2].
5. In a pre-registered experiment with 758 BCG consultants on 18 realistic tasks inside GPT-4's capability frontier, consultants using AI completed 12.2% more tasks, 25.1% more quickly, with more than 40% higher quality than the control group [3].
6. The same study shows the benefit is uneven: on one task chosen to lie outside the frontier, consultants using AI were 19 percentage points less likely to give a correct solution. The authors call the boundary a "jagged technological frontier", where tasks of similar apparent difficulty fall on either side [3].
7. In the BCG study, successful users included "Centaurs", who divide and delegate their solution-creation activities between themselves and the AI [3].
8. In a pre-registered experiment with 444 professionals on 20 to 30 minute writing tasks, ChatGPT cut time by 0.8 standard deviations and raised quality by 0.4. It restructured the work towards idea generation and editing and away from rough drafting [4].

## Caveats

The counter-evidence is a randomized trial of 16 experienced developers on their own mature repositories, where allowing AI increased completion time by 19% although the developers believed it had saved them about 20% [5]. It used early-2025 tools and a small sample, so it limits the claim rather than refuting it. The BCG and writing studies use bounded tasks of at most a few hours, and the BCG outside-the-frontier result rests on one task, so none of the Findings shows that a person can run a month-long project with AI. Anthropic's speedup and success figures are model-estimated and observational. Reading the longer tasks of Finding 1 together with the shift towards idea generation and editing in Finding 8 as one person directing a capable system is an inference; no cited study measures that shift directly, and none compares one person with AI to a team of specialists. The studies name products (GPT-4, ChatGPT, Claude) that age quickly.

[1]: <https://arxiv.org/abs/2503.14499> "Kwa et al., Measuring AI Ability to Complete Long Tasks (METR)"
[2]: <https://www.anthropic.com/research/economic-index-primitives> "Anthropic, Economic Index: New building blocks for AI use (January 2026)"
[3]: <https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf> "Dell'Acqua et al., Navigating the Jagged Technological Frontier, HBS Working Paper 24-013 (SSRN 4573321)"
[4]: <https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf> "Noy, Zhang, Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence"
[5]: <https://arxiv.org/abs/2507.09089> "Becker, Rush, Barnes, Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity"
