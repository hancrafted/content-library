---
type: research
title: 'Why do people working with AI keep executing the work themselves instead of managing it?'
description: 'No study measures executing versus managing; usage data show many users skip briefing and checking, and users six months in iterate more and delegate less, so "most" is unsupported, "many" is.'
generated:
  by: claude-code/opus-5.5
  at: 2026-10-19T00:00:00Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://academy.claude.com/tutorials/the-ai-fluency-index
    title: 'Anthropic, The AI Fluency Index (February 2026)'
  - id: 2
    resource: https://www.anthropic.com/research/anthropic-economic-index-september-2025-report
    title: 'Anthropic, Anthropic Economic Index report: Uneven geographic and enterprise AI adoption (September 2025)'
  - id: 3
    resource: https://anthropic.com/research/anthropic-economic-index-january-2026-report
    title: 'Anthropic, Anthropic Economic Index report (January 2026)'
  - id: 4
    resource: https://www.anthropic.com/research/economic-index-march-2026-report
    title: 'Anthropic, Anthropic Economic Index report: Learning Curves (March 2026)'
  - id: 5
    resource: https://www.microsoft.com/en-us/research/uploads/prod/2025/01/lee_2025_ai_critical_thinking_survey.pdf
    title: 'Lee et al., The Impact of Generative AI on Critical Thinking: Self-Reported Reductions in Cognitive Effort and Confidence Effects From a Survey of Knowledge Workers (CHI 2025)'
---

# Why do people working with AI keep executing the work themselves instead of managing it?

## Context

Asked to support the claim that most people working with AI still behave as if they do the work rather than manage it. The claim has two parts: that people stay in the doer's seat, and that they are the majority. The question is scoped to what usage data and worker surveys show about how people direct and check AI.

## Answer

No source measures "executing versus managing" directly, so "most" is not supported. The evidence shows a large share of users skipping management behaviours: in one Claude.ai sample only about half state their goal, 30% tell the AI how to work with them, and under 16% question its reasoning or check its facts. Workers also describe their effort shifting from execution to supervising, yet confidence in the AI is associated with less checking. Supportable wording is "many people skip the management steps" or "most conversations lack some of them", not "most act as if they do the work". Users who signed up at least six months earlier iterate more and delegate less, which fits hands-on working rather than hands-off management, so the direction of travel is unclear.

## Findings

1. In 9,830 Claude.ai conversations from one week in January 2026, 51.1% included goal clarification, 41.1% examples of good output, 30% told Claude how to interact, 15.8% questioned its reasoning, and 8.7% checked facts and claims, the least common behaviour [1].
2. The same study found iteration and refinement in 85.7% of conversations, and iterative conversations showed more of the other behaviours (2.67 versus 1.33 on average) [1]. Most users therefore work with the AI turn by turn, which the data cannot tell apart from doing the work themselves.
3. Artifact conversations (code, documents, tools) showed more description (goal clarification +14.7 points) but less evaluation (fact-checking -3.7 points, questioning reasoning -3.1 points) [1].
4. Anthropic's sample "likely skew[s] towards early adopters who are already comfortable with AI", covers one week and one platform, classifies behaviours as present or absent, may miss evaluation done outside the chat, and reports only correlations [1].
5. Hand-off is common too: in August 2025 about 49% of Claude.ai conversations were classed as automation (directive, where the user gives a task and Claude completes it with minimal back-and-forth, or feedback loop) against 47% augmentation, with directive up from 27% to 39% in eight months; 77% of first-party API transcripts showed automation [2]. Delegating whole tasks is the opposite of executing them oneself, so a majority "execute" claim does not hold for this usage.
6. That shift partly reversed by November 2025: augmented conversations rose to 52% and automated fell to 45%, with the increase mostly from task iteration; Anthropic still reads the underlying trend as toward more automation [3].
7. Users who signed up at least six months earlier are more likely to iterate and much less likely to delegate through directive patterns, with a success rate about 3 points higher within the same task. Anthropic says this contradicts its earlier hypothesis that experienced users automate more [4].
8. In a survey of 319 weekly GenAI users on Prolific with 936 examples, workers described effort shifting from task execution to task stewardship, and from gathering information to verifying it [5]. Higher confidence in GenAI was associated with less critical thinking, and workers gave reasons for not checking: trust and reliance on the AI (83 of 319), tasks seen as trivial (55), and barriers to inspecting the answer such as missing domain knowledge (58) [5].

## Caveats

The Answer's reading that these behaviours amount to "executing instead of managing" is an inference: management is not an observed category in any source. Finding 1 treats stating goals, setting interaction terms and checking as management behaviours, a mapping the sources do not make. All figures except [5] come from Claude users and were classified by a model, not by people; they cannot be generalised to other tools or to people who do not use AI. The Economic Index classifier changed between reports, so shares are not strictly comparable [2][3]. The survey [5] is self-reported, recruited online from English speakers, and its authors note participants may have conflated less effort with less critical thinking. Directive use, which signals hand-off, is not the same as good management: it may reflect trust that was earned, or not.

[1]: <https://academy.claude.com/tutorials/the-ai-fluency-index> "Anthropic, The AI Fluency Index (February 2026)"
[2]: <https://www.anthropic.com/research/anthropic-economic-index-september-2025-report> "Anthropic, Anthropic Economic Index report: Uneven geographic and enterprise AI adoption (September 2025)"
[3]: <https://anthropic.com/research/anthropic-economic-index-january-2026-report> "Anthropic, Anthropic Economic Index report (January 2026)"
[4]: <https://www.anthropic.com/research/economic-index-march-2026-report> "Anthropic, Anthropic Economic Index report: Learning Curves (March 2026)"
[5]: <https://www.microsoft.com/en-us/research/uploads/prod/2025/01/lee_2025_ai_critical_thinking_survey.pdf> "Lee et al., The Impact of Generative AI on Critical Thinking: Self-Reported Reductions in Cognitive Effort and Confidence Effects From a Survey of Knowledge Workers (CHI 2025)"
