---
type: research
title: 'Why do non-technical people, and even some software engineers, hesitate to open a terminal, up to avoiding it altogether?'
description: 'Hesitation stems from computer anxiety and low self-efficacy plus a command line with no visible options and easy mistakes; no study measures terminal fear itself.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-29T00:00:00Z
stale_after: 2027-10-29T00:00:00Z
sources:
  - id: 1
    resource: https://doi.org/10.1016/j.chb.2013.05.012
    title: 'Powell, Computer anxiety: Comparison of research from the 1990s and 2000s'
  - id: 2
    resource: https://aisel.aisnet.org/misq/vol19/iss2/4/
    title: 'Compeau and Higgins, Computer Self-Efficacy: Development of a Measure and Initial Test'
  - id: 3
    resource: https://arxiv.org/abs/1905.13582
    title: 'Voronkov, Martucci and Lindskog, System Administrators Prefer Command Line Interfaces, Don''t They? An Exploratory Study of Firewall Interfaces'
  - id: 4
    resource: https://dspace.mit.edu/handle/1721.1/106271
    title: 'Perez De Rosso and Jackson, Purposes, Concepts, Misfits, and a Redesign of Git'
  - id: 5
    resource: https://www.nngroup.com/articles/ten-usability-heuristics/
    title: 'Nielsen, 10 Usability Heuristics for User Interface Design'
  - id: 6
    resource: https://arxiv.org/abs/2209.07365
    title: 'Coleman, Griswold and Mitchell, Do Cloud Developers Prefer CLIs or Web Consoles? CLIs Mostly, Though It Varies by Task'
---

# Why do non-technical people, and even some software engineers, hesitate to open a terminal, up to avoiding it altogether?

## Context

Asked to support the claim that a first-time user's reluctance to open a terminal is a common, explainable reaction and not a personal failing. The question covers two layers: general anxiety about computers, and what a command line itself does to a newcomer.

## Answer

Hesitation has two documented roots. First, computer anxiety, the tendency to be uneasy or fearful about using computers, is widespread, is lower in people with more experience and higher computer self-efficacy, and is reduced by a relaxed first experience. Second, a command line gives a newcomer little to recognise, no way to click around and explore, and easy typing errors, which administrators themselves call scary for beginners. Engineers are not immune: even experienced users find Git's command line confusing, and many administrators prefer a graphical interface. No peer-reviewed study measures fear of the terminal itself, and none shows that fear of breaking things drives outright avoidance; those two links are inference.

## Findings

1. Computer anxiety is defined as the tendency to be uneasy, apprehensive or fearful about current or future computer use, and a review of 276 articles found it a heavily studied topic since the early 1980s [1].
2. About 80% of the 89 reviewed studies on experience found more experience went with less computer anxiety; a smaller number found no relationship. A positive, relaxed first experience was associated with lower anxiety [1].
3. Computer self-efficacy, a person's judgement of their capability to use a computer, is negatively related to computer anxiety in nearly all 28 reviewed studies; only two found no relationship [1].
4. In a survey of Canadian managers and professionals, computer self-efficacy significantly influenced expectations of outcomes, emotional reactions to computers (affect and anxiety) and actual computer use [2].
5. In a survey of 300 system administrators, the most frequent command-line limitation was a long learning curve, named 19 times; one respondent wrote that a command line "may be scary/overwhelming for a beginner/untrained user" [3].
6. The same respondents said a command line is "less intuitive" and that "you cannot click your way around it in an attempt to figure it out"; another wrote it is "much easier to cause catastrophic failure quickly and effectively" [3].
7. Only 32% of those administrators preferred a command line for managing firewalls, against 60% who preferred a graphical interface [3].
8. A design analysis of Git calls it powerful but complicated and explains well-known difficulties as misfits in its design, not user error; the authors checked this against questions users post on Stack Overflow [4].
9. A widely used usability standard asks interfaces to make elements, actions and options visible so users need not recall them, to prevent errors in the first place, and to give plain-language error messages; a bare prompt offers none of these by default [5].
10. Counter-evidence: in a survey of 60 cloud developers, the command line was the most favoured modality overall, especially for create, read, update and delete tasks, and all 4 observed participants chose it [6].

## Caveats

Findings 1 to 4 concern anxiety about computers in general. The review reports mixed results for performance: about half of 35 studies found no link between anxiety and performance [1]. No cited study measures anxiety about a terminal specifically, so applying them to the terminal is an inference.

Finding 6 is a survey quote about error risk, not a measured rate of mistakes. The statement that fear of breaking things drives avoidance is an inference from findings 5 and 6.

Finding 8 supports "engineers struggle with a command line tool", not "engineers avoid the terminal". The strongest counter-evidence is finding 10: developers who work daily in cloud tooling mostly prefer the command line, so avoidance among engineers varies by experience and task. That study is a small arXiv preprint (60 survey respondents, 4 observed), and the administrator survey in finding 7 is a self-selected online sample.

The Compeau and Higgins abstract was read through a secondary listing because the publisher page showed only the citation.

[1]: <https://doi.org/10.1016/j.chb.2013.05.012> "Powell, Computer anxiety: Comparison of research from the 1990s and 2000s"
[2]: <https://aisel.aisnet.org/misq/vol19/iss2/4/> "Compeau and Higgins, Computer Self-Efficacy: Development of a Measure and Initial Test"
[3]: <https://arxiv.org/abs/1905.13582> "Voronkov, Martucci and Lindskog, System Administrators Prefer Command Line Interfaces, Don't They? An Exploratory Study of Firewall Interfaces"
[4]: <https://dspace.mit.edu/handle/1721.1/106271> "Perez De Rosso and Jackson, Purposes, Concepts, Misfits, and a Redesign of Git"
[5]: <https://www.nngroup.com/articles/ten-usability-heuristics/> "Nielsen, 10 Usability Heuristics for User Interface Design"
[6]: <https://arxiv.org/abs/2209.07365> "Coleman, Griswold and Mitchell, Do Cloud Developers Prefer CLIs or Web Consoles? CLIs Mostly, Though It Varies by Task"
