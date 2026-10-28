---
type: research
title: 'Why do measured AI productivity gains fall short of the ceilings claimed for prompting, agents, workflows and a factory?'
description: 'Randomised studies measure about 1.1 to 1.6x for chat-style prompting and 0.8 to 1.2x for coding agents; no study measures a workflow or a factory.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-28T14:00:00Z
stale_after: 2027-04-28T00:00:00Z
sources:
  - id: 1
    resource: https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf
    title: 'Noy and Zhang, Experimental Evidence on the Productivity Effects of Generative AI (working paper, March 2023; the Science page returned 403)'
  - id: 2
    resource: https://www.nber.org/papers/w31161
    title: 'Brynjolfsson, Li and Raymond, Generative AI at Work (NBER 31161; QJE 2025)'
  - id: 3
    resource: https://bfi.uchicago.edu/wp-content/uploads/2025/04/BFI_WP_2025-56-1.pdf
    title: 'Humlum and Vestergaard, Large Language Models, Small Labor Market Effects (BFI WP 2025-56)'
  - id: 4
    resource: https://economics.mit.edu/sites/default/files/inline-files/draft_copilot_experiments.pdf
    title: 'Cui et al., The Effects of Generative AI on High-Skilled Work: Evidence from Three Field Experiments with Software Developers (Feb 2025)'
  - id: 5
    resource: https://arxiv.org/abs/2302.06590
    title: 'Peng et al., The Impact of AI on Developer Productivity: Evidence from GitHub Copilot'
  - id: 6
    resource: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
    title: 'METR, Measuring the impact of early-2025 AI on experienced open-source developer productivity (10 Jul 2025)'
  - id: 7
    resource: https://metr.org/blog/2026-02-24-uplift-update/
    title: 'METR, Update: changing the developer productivity study design (24 Feb 2026)'
  - id: 8
    resource: https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic
    title: 'Anthropic, How AI is transforming work at Anthropic (2 Dec 2025)'
  - id: 9
    resource: https://dora.dev/insights/balancing-ai-tensions/
    title: 'DORA, Balancing AI tensions'
  - id: 10
    resource: https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/
    title: 'Shapiro, The Five Levels: from Spicy Autocomplete to the Dark Factory'
  - id: 11
    resource: https://factory.strongdm.ai/
    title: 'StrongDM, The Software Factory'
---

# Why do measured AI productivity gains fall short of the ceilings claimed for prompting, agents, workflows and a factory?

## Context

A teaching Explorable shows a hypothesis per level (prompting 1.5 to 2x, agents 2 to 3x, workflows 5 to 10x, factory 10x and more) next to what studies measured, against the popular "20x" promise. This file checks the "measured" lines against the sources. Levels follow LLM-0018: prompting is chat with a model, an agent runs tools in a loop, a workflow chains agent steps with a human in or on the loop, a factory has agents run the whole line.

## Answer

Randomised and field studies of chat-style and autocomplete use measure about 1.1 to 1.6x on tasks suited to AI, and about 1.03x (2.8% of hours saved) averaged over whole occupations. The single largest figure, 2.3x, comes from one small trial of one toy task. Randomised trials of experienced developers using agentic tools give point estimates of 0.84x (early 2025) and 1.04 to 1.22x (late 2025), with confidence intervals that include no change. No study measures a workflow or a factory; the only numbers are vendor and practitioner claims, and the two primary pages read publish none. Nothing read supports 5x or more at any level.

## Findings

1. Noy and Zhang (444 college-educated professionals, mid-level writing tasks, randomised): time taken fell by 10 minutes (37%) from a 27-minute control mean; quality rose 0.4 SD. 37% less time is 1/0.63, about 1.6x [1].
2. Brynjolfsson, Li and Raymond (5,179 customer-support agents, staggered rollout): issues resolved per hour rose about 14% on average (1.14x) and about 34% for novices (1.34x), with minimal impact for the most skilled [2].
3. Cui et al. (three field RCTs at Microsoft, Accenture and a Fortune 100 firm, 4,867 developers, Copilot code completion): completed tasks rose 26.08% (SE 10.3%), 1.26x, with larger gains for less experienced developers [4].
4. Peng et al. (95 professional developers, one task: an HTTP server in JavaScript): mean time 71.17 minutes with Copilot against 160.89 for control, "a 55.8% reduction in completion time", which is 2.3x. It is one small, well-defined task, and the abstract's "55.8% faster" is a time reduction, not a speed ratio [5].
5. Humlum and Vestergaard (Denmark, 25,000 workers, 11 exposed occupations, 2023 and 2024 surveys linked to payroll records): users report average time savings of 2.8% of work hours; no significant effect on earnings or recorded hours, with confidence intervals ruling out effects above 1% [3].
6. METR (July 2025): 16 experienced open-source developers, 246 issues randomly assigned to AI allowed or not, mostly Cursor Pro with Claude 3.5 and 3.7 Sonnet including agent mode. With AI allowed, issues took 19% longer (0.84x). Developers forecast 24% faster beforehand and still believed AI had made them 20% faster afterwards [6].
7. METR (Feb 2026): late-2025 estimates are 18% less time for 10 returning developers (95% CI -38% to +9%, about 1.22x) and 4% less for 47 new recruits (CI -15% to +9%); the early-2025 estimate was +19% (CI +2% to +39%). METR calls the new data "only very weak evidence", says the raw numbers are probably a lower bound because enthusiastic developers declined to take part and 30 to 50% of surveyed developers withheld tasks they would not do without AI, and is redesigning the study [7].
8. Anthropic (132 surveyed staff, 200,000 transcripts, data from Aug 2025): self-reported gain of about 50%, up from about 20% a year earlier; 14% report more than 100%; merged pull requests per engineer per day rose 67% after Claude Code adoption. The authors say the survey should be taken "with a grain of salt"; it is self-report, not a trial, from a lab with early model access [8].
9. DORA (Google engineers, 1,110 open-ended responses, Q3 2025, and the 2025 DORA report): more than 80% perceive higher productivity; greater AI adoption is associated with higher delivery throughput and with more delivery instability, as writing time is re-spent on auditing and verification. These are associations, not causal estimates [9].
10. Shapiro's five levels give only qualitative descriptions ("you're seeing speedups", "more productive than you've ever been") and no measured multiple per level; the page does not mention METR [10].
11. StrongDM's factory page publishes no speedup or before and after data; it gives a spend target of $1,000 in tokens per human engineer per day and narrative claims [11].

## Caveats

Opened and read in full or in the relevant parts: sources 1 to 11. Source 1 was read from the MIT-hosted working paper (March 2023), because the Science page returned 403; the published Science numbers may differ slightly. Source 3, 4 and 5 were read from the PDFs as text; source 5's first fetch of the abstract page gave only the 55.8% headline, the minutes come from the PDF.

Not opened: Dell'Acqua et al. (HBS working paper 24-013). The HBS page and the SSRN page returned 403, and only a search summary was seen (758 BCG consultants; about 12% more tasks, about 25% faster and over 40% higher quality inside the AI frontier; a drop of about 19 percentage points in correct answers on a task outside the frontier). It is deliberately not in the sources list; read the paper before citing any of those figures.

Level mapping is a judgement: Cui and Peng test Copilot code completion, and Noy and Zhang, Brynjolfsson and Humlum test chat or chat-style assistants, so all count as prompting; only METR tests agentic tools (Cursor agent mode among chat and autocomplete). Anthropic's numbers (finding 8) involve agents but are self-reported and are not used for the "measured" line. The ranges mix outcome definitions (time, tasks per period, issues per hour), so a multiple is an approximation; time reductions were converted with 1/(1-r). No source states a productivity multiple for a workflow or a factory, and "human in or on the loop" is not studied as a factor. Absence of a study is not evidence of a small effect. The 1.5 to 2x, 2 to 3x, 5 to 10x and 10x hypotheses and the "20x" promise are the author's; no source read supports or refutes the 5x and higher figures.

[1]: https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf 'Noy and Zhang, Experimental Evidence on the Productivity Effects of Generative AI'
[2]: https://www.nber.org/papers/w31161 'Brynjolfsson, Li and Raymond, Generative AI at Work'
[3]: https://bfi.uchicago.edu/wp-content/uploads/2025/04/BFI_WP_2025-56-1.pdf 'Humlum and Vestergaard, Large Language Models, Small Labor Market Effects'
[4]: https://economics.mit.edu/sites/default/files/inline-files/draft_copilot_experiments.pdf 'Cui et al., Three Field Experiments with Software Developers'
[5]: https://arxiv.org/abs/2302.06590 'Peng et al., The Impact of AI on Developer Productivity: Evidence from GitHub Copilot'
[6]: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ 'METR, early-2025 AI and experienced open-source developer productivity'
[7]: https://metr.org/blog/2026-02-24-uplift-update/ 'METR, update: changing the developer productivity study design'
[8]: https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic 'Anthropic, How AI is transforming work at Anthropic'
[9]: https://dora.dev/insights/balancing-ai-tensions/ 'DORA, Balancing AI tensions'
[10]: https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/ 'Shapiro, The Five Levels'
[11]: https://factory.strongdm.ai/ 'StrongDM, The Software Factory'
