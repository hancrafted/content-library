---
type: research
description: 'Individuals miss the promised AI boost because gains depend on task fit, context and checking: measured effects are mixed and smaller than the hype, and self-reports overstate them.'
question: 'Why do individuals fail to reach the promised AI productivity boost?'
researched_on: 2026-10-13T00:00:00Z
stale_after: 2027-04-13T00:00:00Z
---

# Why do individuals fail to reach the promised AI productivity boost?

## Context

Asked to support the claim that an individual's own results with AI often fall short of vendor and social-media promises of large multiples, and to explain where the shortfall comes from. The evidence is about named products and model generations, so it ages quickly.

## Answer

Controlled studies show gains that are real but uneven and far below "20x": about a quarter more tasks completed for software developers in three field experiments, and a measured 19% slowdown for experienced developers on their own mature codebases in one early-2025 trial. The shortfall has identifiable individual causes: the work moves into prompting, waiting, reviewing and cleaning up output; the model lacks the tacit context the person holds; and on tasks outside the model's competence, AI users do worse, with wrong answers that still look convincing. People also misjudge their own gains: developers forecast and later recalled a roughly 20% speedup that did not occur. The slowdown result is disputed, and its authors mark it out of date (the study post carries the banner "These results are out of date") and believe developers are more sped up now, so the defensible claim is "gains depend on task, context and checking", not "AI slows people down".

## Findings

1. In a randomized trial, 16 experienced open-source developers completed 246 real tasks on repositories they knew well, each task randomly allowed or forbidden AI (mainly Cursor with Claude 3.5/3.7 Sonnet). With AI, tasks took 19% longer [1].
2. The same developers forecast a 24% speedup beforehand and, afterwards, believed AI had saved them 20%. Self-perception was wrong in direction [1].
3. The authors list factors likely contributing to the slowdown, among them over-optimism about AI usefulness, low reliability (developers accepted fewer than 44% of generations and about 9% of their time went to reviewing and cleaning AI output) and implicit repository context, meaning important tacit knowledge the AI did not use [1].
4. Dispute, part 1: the authors themselves state the study does not show that AI fails to speed up most developers, that other fields are unaffected, or that better prompting or scaffolding could not yield a speedup. The sample was 16 people, and developers who expected large gains may have declined to take part [2].
5. Dispute, part 2, the strongest counter-evidence: three field experiments at Microsoft, Accenture and a Fortune 100 firm with 4,867 developers found a 26.08% increase (SE 10.3%) in completed tasks for those given GitHub Copilot, with less experienced developers adopting more and gaining more. Each single experiment was noisy [3]. A lab experiment cited there found a 58% reduction in task time, and the field estimate is substantially smaller than that [3].
6. Dispute, part 3: METR's February 2026 follow-up (late-2025 tools, 57 developers, 800+ tasks) estimated about 18% less time per task for returning developers (change in time, CI -38% to +9%) and about 4% less for new ones (change in time, CI -15% to +9%); both intervals include zero. METR reports selection problems: developers declined to join because they did not want to work without AI, and some withheld tasks they did not want to do without AI. It calls the new data "an unreliable signal of the current productivity effect of AI tools" and "only very weak evidence" for the size of the speedup, and believes it "likely that developers are more sped up from AI tools now" than in early 2025 [4]. The original post carries the banner "These results are out of date" and says the historical results "no longer reflect the current impact of AI models on open-source developer productivity" [2].
7. Task fit decides the sign. In a preregistered experiment with 758 BCG consultants using GPT-4, on tasks inside the model's frontier AI users completed 12.2% more tasks, 25.1% faster, at more than 40% higher quality than the control group. On a task selected to lie outside the frontier, AI users were on average 19 percentage points less likely to produce a correct solution (the two AI conditions combined, against control) [5].
8. In that outside-the-frontier task, the group given a prompt-engineering overview did worst (about 60% correct versus about 84.5% for the control group; the other AI group, GPT only, scored about 70%), and the AI users' wrong answers read as coherent, which makes errors harder to catch [5].
9. At population level, a Danish study linking surveys of 25,000 workers to administrative records found precise null effects on earnings and recorded hours, ruling out effects larger than 2% two years after ChatGPT's launch. Employers restructured work, adding tasks in content generation, AI oversight and AI integration [6].

## Sources

1. Becker, Rush, Barnes, Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity — https://arxiv.org/abs/2507.09089 — accessed 2026-10-12
2. METR, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity (study announcement with limitations) — https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ — accessed 2026-10-13
3. Cui, Demirer, Jaffe, Musolff, Peng, Salz, The Effects of Generative AI on High-Skilled Work: Evidence from Three Field Experiments with Software Developers — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566 — accessed 2026-10-12
4. METR, update on its AI developer productivity study (February 2026) — https://metr.org/blog/2026-02-24-uplift-update/ — accessed 2026-10-13
5. Dell'Acqua, McFowland, Mollick, Lifshitz-Assaf, Kellogg, Rajendran, Krayer, Candelon, Lakhani, Navigating the Jagged Technological Frontier — https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf — accessed 2026-10-13
6. Humlum, Vestergaard, Large Language Models, Small Labor Market Effects (NBER Working Paper 33777) — https://www.nber.org/papers/w33777 — accessed 2026-10-12

## Caveats

- Finding 1 to 3 rest on 16 developers in one setting and early-2025 tools; the numbers in Finding 3 come from the paper's factor table. Which causes dominate is the authors' judgement, not an isolated effect.
- Finding 7 and 8's figures (12.2%, 25.1%, more than 40%, 19 points, 60%, 70%, 84.5%) were re-checked on 2026-10-13 against the paper's abstract and results text. Finding 5 was confirmed from the paper's abstract or search-result excerpts, not read in full; the 58% lab figure is quoted as cited inside [3], not from its own source (Peng et al. 2023). Finding 9 comes from the NBER abstract page and a search snippet for the 2% bound; its version history (1% bound in an earlier version) was not checked against the paper.
- Finding 9 measures the labor market, not individual output; it bears on this question only as a sign that gains do not simply appear.
- The Answer's reading that the shortfall comes from relocated work (prompting, review, context) is an inference from [1] and [4]; no Source tests it directly. "Task fit" in the BCG study is a task the authors designed to fail, so its 19-point figure shows a mechanism, not a typical rate.
- The BCG study used GPT-4; results for current models may differ.
