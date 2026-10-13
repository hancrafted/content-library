---
type: research
title: 'Why is effective AI delegation a management discipline rather than a skill of seniority, given that AI boosts novices more on simple tasks?'
description: 'Delegating real work to AI takes management disciplines (briefing, context, verification) that experience merely correlates with, and novice-boost studies measure bounded tasks, not that discipline.'
question: 'Why is effective AI delegation a staff-level management discipline, and how does that reconcile with findings that AI boosts novices more on simple tasks?'
generated:
  by: claude-code/opus-5.5
  at: 2026-10-13T00:00:00Z
stale_after: 2027-04-13T00:00:00Z
sources:
  - id: brynjolfsson-generative-ai-at-work
    resource: https://www.nber.org/papers/w31161
    title: 'Brynjolfsson, Li, Raymond, Generative AI at Work (NBER Working Paper 31161)'
  - id: noy-zhang-chatgpt-productivity
    resource: https://www.science.org/doi/10.1126/science.adh2586
    title: 'Noy, Zhang, Experimental evidence on the productivity effects of generative artificial intelligence (Science 381:187-192)'
  - id: dellacqua-working-paper
    resource: https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf
    title: "Dell'Acqua et al., Navigating the Jagged Technological Frontier, HBS Working Paper 24-013, September 2023 (SSRN 4573321)"
  - id: dellacqua-organization-science
    resource: https://www.hbs.edu/ris/Publication%20Files/dell-acqua-et-al-2026-navigating-the-jagged-technological-frontier_5c589c8c-fbb5-458f-b285-c944746cd717.pdf
    title: "Dell'Acqua et al., Navigating the Jagged Technological Frontier, Organization Science 2026, doi 10.1287/orsc.2025.21838"
  - id: otis-uneven-impact
    resource: https://www.hks.harvard.edu/centers/cid/publications/uneven-impact-generative-ai-entrepreneurial-performance
    title: 'Otis, Clarke, Delecourt, Holtz, Koning, The Uneven Impact of Generative AI on Entrepreneurial Performance (HBS Working Paper 24-042, December 2023, revised October 2025)'
  - id: daniotti-who-is-using-ai-to-code
    resource: https://arxiv.org/abs/2506.08945
    title: 'Daniotti, Wachs, Feng, Neffke, Who is using AI to code? Global diffusion and impact of generative AI (Science 391:831-835)'
  - id: becker-metr-rct
    resource: https://arxiv.org/abs/2507.09089
    title: 'Becker, Rush, Barnes, Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity'
  - id: anthropic-economic-index-learning-curves
    resource: https://www.anthropic.com/research/economic-index-march-2026-report
    title: 'Anthropic, Anthropic Economic Index report: Learning Curves (March 2026)'
  - id: anthropic-economic-index-primitives
    resource: https://www.anthropic.com/research/economic-index-primitives
    title: 'Anthropic, Economic Index: New building blocks for AI use (January 2026)'
  - id: metr-uplift-update
    resource: https://metr.org/blog/2026-02-24-uplift-update/
    title: 'METR, We are Changing our Developer Productivity Experiment Design (2026-02-24)'
---

# Why is effective AI delegation a management discipline rather than a skill of seniority, given that AI boosts novices more on simple tasks?

## Context

Asked to support the claim that capturing value from AI depends on briefing, context-giving and checking work, which are management tasks, and that this claim survives the well-known result that AI helps less experienced people most. The claim concerns what the task demands, not who happens to hold the skills.

## Answer

The two findings measure different tasks. The novice-boost studies give workers a bounded, well-specified task inside the model's competence, where AI mostly supplies the missing know-how, so the less skilled gain most. Work outside that frontier, work in a mature context the model cannot see, or work whose output must be checked shifts the effort to specifying, supplying context and judging the result, and there AI use can stall or backfire for people who skip those steps. The backfire evidence is itself disputed: METR's early-2025 slowdown for experienced developers was not reproduced with late-2025 tools, where point estimates showed a speedup that was not significant, and METR now calls the data from its new design "an unreliable signal" of current impact. Seniority is not the mechanism: the evidence shows seniority correlating with better outcomes in some settings and not in others, and the novice boost itself is disputed. The reconciling claim is that the delegation discipline, not rank, is what the task demands, and experience is one common way people acquire it.

## Findings

1. In a customer-support field study of 5,179 agents, access to an AI assistant raised issues resolved per hour by 14% on average, 34% for novice and low-skilled workers, with minimal impact on experienced and highly skilled workers [^brynjolfsson-generative-ai-at-work]. The authors attribute this to the AI capturing and spreading the behaviour patterns of the most productive agents [^brynjolfsson-generative-ai-at-work].
2. In a randomized writing experiment with 453 professionals, ChatGPT cut time by 40% and raised graded quality by 18%, and lower scorers on the first task benefited more; the authors describe ChatGPT as mostly substituting for worker effort rather than complementing skill [^noy-zhang-chatgpt-productivity]. The tasks were 20 to 30 minute writing assignments.
3. In a 758-consultant BCG experiment, the 2023 HBS working paper reports that below-average performers improved 43% and above-average performers 17% compared with their own scores, on 18 tasks chosen to lie inside GPT-4's frontier [^dellacqua-working-paper]. The 2026 published version [^dellacqua-organization-science] does not state these two figures in the text I checked; it reports that the bottom-half-skill subjects were the most significant beneficiaries, and that AI users completed 12.2% more tasks and 25.1% more quickly. On one task built to lie outside the frontier, consultants with AI were 19 percentage points less likely to be correct (control about 84.5% correct, AI groups 60% and 70.6%) [^dellacqua-working-paper][^dellacqua-organization-science]. The working paper says professionals who did worse "tended to blindly adopt its output and interrogate it less" and stresses validating and interrogating AI and continuing to exert cognitive effort and expert judgment [^dellacqua-working-paper]; the published version says consultants "tended to overrely on AI" [^dellacqua-organization-science]. The "centaur" users who divided and delegated their solution-creation activities between themselves and the AI are described in the working paper [^dellacqua-working-paper]; the published version points to a separate paper for them [^dellacqua-organization-science].
4. Dispute and counter-evidence on the novice boost. In a Kenyan field experiment with 640 entrepreneurs, the AI mentor produced no significant average effect, and high performers at baseline gained just over 15% while low performers did about 8% worse (the current revised version's figure; an earlier version's figure was not rechecked); the gap came from which advice people chose to implement, not from the questions they asked [^otis-uneven-impact]. In 30 million GitHub commits from about 160,000 developers, early-career programmers used AI more but experienced programmers captured nearly all the productivity and exploration gains, widening the skill gap [^daniotti-who-is-using-ai-to-code]. In a randomized trial of 16 experienced open-source developers on their own mature repositories, allowing AI increased completion time by 19%, while the developers believed it had saved them 20% [^becker-metr-rct]. The BCG authors themselves flag that the outside-the-frontier result rests on a single task, an inherent limitation [^dellacqua-organization-science].
5. METR developers reported that AI acts like a new contributor to the repository, lacking tacit knowledge such as data quirks and backwards-compatibility cases that is hard to hand over as context, and they spent about 9% of their time reviewing and cleaning AI output [^becker-metr-rct].
6. METR's own follow-up (24 February 2026) disputes how far the slowdown in [^becker-metr-rct] carries. With late-2025 tools, point estimates were an 18% change in task time for returning developers (confidence interval -38% to +9%) and 4% for newly recruited ones (confidence interval -15% to +9%), negative meaning less time with AI, so faster but not significant [^metr-uplift-update]. METR says "the data from our new experiment gives us an unreliable signal of the current productivity effect of AI tools", because of selection effects (it does not state a confidence level for the intervals): developers declined to work without AI, and 30 to 50% of participants withheld tasks they would not do without it [^metr-uplift-update]. It says its estimate is "likely" a "lower-bound on the true productivity effects of AI" [^metr-uplift-update].
7. Experience with the tool, not job rank, predicts better results in Anthropic's usage data: users with six months or more of tenure show a success rate about 3 to 5 percentage points higher within the same task cluster, bring more varied work, iterate more with Claude and delegate less by directive [^anthropic-economic-index-learning-curves]. Anthropic notes that self-selection, survivorship and cohort effects are not ruled out and that learning-by-doing is consistent with the data but not proven [^anthropic-economic-index-learning-curves]. Success is Claude's own assessment [^anthropic-economic-index-learning-curves].
8. Across tasks, Anthropic finds success falls only slightly with task difficulty (70% below high-school level, 66% at college level), and that users split tasks into steps and choose tasks they expect Claude to handle, which accounts for part of the long task lengths seen in practice [^anthropic-economic-index-primitives].

## Caveats

The Answer's central claim, that the discipline is what the task demands and rank is incidental, is an inference: no cited study randomizes management skill or tests a delegation-training intervention, so none shows causation. The studies also use different tools and model generations (GPT-3.5 to early-2025 models), and the 19% slowdown reflects 16 developers and early-2025 tools; its authors caution against overgeneralizing [^becker-metr-rct]. Finding 1's customer-support result and the BCG split are reported by the authors as averages by baseline skill, not by management experience. The BCG working paper and the published Organization Science version differ in wording and content: the 43% and 17% and the "adopt blindly" wording come from the 2023 working paper [^dellacqua-working-paper] and were not found in the 2026 published text [^dellacqua-organization-science], which gives 12.2% and 25.1% in its abstract instead; secondary summaries cite other percentages (31% and 11%) that this file did not find in either version. Anthropic's tenure effect uses model-graded success and is observational [^anthropic-economic-index-learning-curves]. Reading the tool as a "new colleague" and the claim that delegation succeeds or fails on context, brief and review are the file's interpretation of the developers' own comparison [^becker-metr-rct] and the BCG observations [^dellacqua-working-paper]. The METR follow-up reports selection problems, and its post states the intervals without a confidence level, so neither the early-2025 slowdown nor the late-2025 speedup is a clean estimate [^becker-metr-rct][^metr-uplift-update]. The Answer's 'stall' clause also rests on Findings 3 and 4.

[^brynjolfsson-generative-ai-at-work]: Brynjolfsson, Li, Raymond, Generative AI at Work (NBER Working Paper 31161), https://www.nber.org/papers/w31161

[^noy-zhang-chatgpt-productivity]: Noy, Zhang, Experimental evidence on the productivity effects of generative artificial intelligence (Science 381:187-192), https://www.science.org/doi/10.1126/science.adh2586

[^dellacqua-working-paper]: Dell'Acqua et al., Navigating the Jagged Technological Frontier, HBS Working Paper 24-013, September 2023 (SSRN 4573321), https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf

[^dellacqua-organization-science]: Dell'Acqua et al., Navigating the Jagged Technological Frontier, Organization Science 2026, doi 10.1287/orsc.2025.21838, https://www.hbs.edu/ris/Publication%20Files/dell-acqua-et-al-2026-navigating-the-jagged-technological-frontier_5c589c8c-fbb5-458f-b285-c944746cd717.pdf

[^otis-uneven-impact]: Otis, Clarke, Delecourt, Holtz, Koning, The Uneven Impact of Generative AI on Entrepreneurial Performance (HBS Working Paper 24-042, December 2023, revised October 2025), https://www.hks.harvard.edu/centers/cid/publications/uneven-impact-generative-ai-entrepreneurial-performance Abstract read at this Harvard Kennedy School page; the SSRN page (abstract_id=4671369) returned 403.

[^daniotti-who-is-using-ai-to-code]: Daniotti, Wachs, Feng, Neffke, Who is using AI to code? Global diffusion and impact of generative AI (Science 391:831-835), https://arxiv.org/abs/2506.08945

[^becker-metr-rct]: Becker, Rush, Barnes, Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity, https://arxiv.org/abs/2507.09089

[^anthropic-economic-index-learning-curves]: Anthropic, Anthropic Economic Index report: Learning Curves (March 2026), https://www.anthropic.com/research/economic-index-march-2026-report

[^anthropic-economic-index-primitives]: Anthropic, Economic Index: New building blocks for AI use (January 2026), https://www.anthropic.com/research/economic-index-primitives

[^metr-uplift-update]: METR, We are Changing our Developer Productivity Experiment Design (2026-02-24), https://metr.org/blog/2026-02-24-uplift-update/
