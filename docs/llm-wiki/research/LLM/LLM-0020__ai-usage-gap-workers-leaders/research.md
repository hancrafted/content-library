---
type: research
title: 'Why is there a gap between how workers use AI and what leaders expect from it?'
description: 'Surveys show a minority of AI users work with agents and leaders are more familiar with agents and more optimistic than employees, but no source measures leaders expecting factory-scale gains.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-28T14:00:00Z
stale_after: 2027-04-28T00:00:00Z
sources:
  - id: 1
    resource: https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization
    title: 'Microsoft, Work Trend Index 2026: Agents, human agency and the opportunity for every organization'
  - id: 2
    resource: https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born
    title: 'Microsoft, Work Trend Index 2025: The year the Frontier Firm is born'
  - id: 3
    resource: https://finance.yahoo.com/news/upwork-study-finds-employee-workloads-130000327.html
    title: 'Upwork, Study Finds Employee Workloads Rising Despite Increased C-Suite Investment in AI (press release copy; upwork.com returned 403)'
  - id: 4
    resource: https://www.anthropic.com/research/anthropic-economic-index-september-2025-report
    title: 'Anthropic, Economic Index report, September 2025'
  - id: 5
    resource: https://www.gallup.com/699797/indicator-artificial-intelligence.aspx
    title: 'Gallup, AI in the workplace indicator'
  - id: 6
    resource: https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf
    title: 'MIT Project NANDA, The GenAI Divide: State of AI in Business 2025 (preliminary findings)'
  - id: 7
    resource: https://www.nber.org/papers/w34255
    title: 'Chatterji et al., How People Use ChatGPT (NBER Working Paper 34255)'
---

# Why is there a gap between how workers use AI and what leaders expect from it?

## Context

Asked to confirm or correct three lines that a teaching Explorable prints on its "Mismatch" row: a "most people are here" marker on Prompting, a "leaders expect this" marker on Factory (labelled hypothesis), and evidence on the band between. The lines are "16% of AI-using workers run agent workflows", "Know what an agent is: 40% of employees, 67% of leaders" and "96% of executives expect AI gains".

## Answer

Partly. Surveys support a gap between leaders and workers, and agent use is a minority practice, but none of the three lines is worded as its source words it. The 16% is a composite group of advanced agent users, not everyone running agent workflows [1]. The 40% and 67% measure familiarity with agents, not knowing what one is [2]. The 96% is C-suite expectation of higher productivity, from a 2024 vendor survey [3]. No source measures leaders expecting factory-scale (autonomous, unwatched) gains, so the Factory marker stays a hypothesis. No source measures the share of workers who use AI as a chat assistant versus an agent; the "most people are here" marker on Prompting is an inference from adoption data [5][6][7] and from the minority share in [1].

## Findings

1. Microsoft's 2026 report (published 5 May 2026) defines "Frontier Professionals" as people who "use agents for multi-step workflows and building multi-agent systems", "16%" of the AI users surveyed, 3,233 of 20,000. To qualify, a respondent had to report advanced agent use for complex work, routine workflow redesign, and participation in structured AI practices that scale beyond one person. The report gives no standalone share for agent-workflow use [1].
2. The 2026 survey covered 20,000 knowledge workers who use AI at work, 2,000 in each of 10 markets including Germany, run by Edelman Data x Intelligence. The page gives two end dates for fieldwork (7 April and 20 April 2026) [1].
3. Microsoft's 2025 report (23 April 2025): "67% of leaders are familiar or extremely familiar with agents, compared to just 40% of employees." The chart counts respondents "at least familiar with agents" [2].
4. The 2025 survey covered 31,000 knowledge workers in 31 markets, fielded 6 February to 24 March 2025 by Edelman Data x Intelligence [2].
5. Upwork (23 July 2024): "96% of C-suite leaders expect the use of AI tools to increase their company's overall productivity levels"; "77% of employees using AI say these tools have added to their workload". Sample 2,500: 1,250 C-suite, 625 employees, 625 freelancers, in the US, UK, Australia and Canada, fielded 16 April to 5 May 2024. The page is a paid press release from a freelance marketplace [3].
6. Gallup: 15% of US employees use AI daily, 30% a few times a week or more, 52% a few times a year or more. 47% say their organization has integrated AI, and 14% of employees in such organizations strongly agree it has transformed how work gets done. The page measures frequency, not chat versus agent, and gives no leader versus employee split or agent figures [5].
7. MIT NANDA (July 2025): "Tools like ChatGPT and Copilot are widely adopted. Over 80 percent of organizations have explored or piloted them, and nearly 40 percent report deployment. But these tools primarily enhance individual productivity, not P&L performance." Task-specific enterprise tools: 60% evaluated, 20% piloted, 5% reached production. Base: 300+ public initiatives, 52 organization interviews, 153 leader survey responses; the authors call the findings preliminary [6].
8. NBER (September 2025): by July 2025 ChatGPT was used by about 10% of the world's adults. Non-work messages grew from 53% to over 70% of use. Practical Guidance, Seeking Information and Writing make up nearly 80% of conversations. The page does not give the Asking/Doing/Expressing split [7].
9. Anthropic (15 September 2025): in Claude.ai conversations, directive (delegating) use rose from 27% in late 2024 to 39% in August 2025, and automation patterns now match or exceed augmentation (about 50%, or 45% against 49% under a different classifier). In API transcripts 77% show automation patterns against 12% augmentation. This is counter-evidence: even in a chat product, delegation is common, and API traffic is mostly automated [4].

## Caveats

- Not opened: McKinsey State of AI 2025 (the fetch timed out five times; agent figures such as 23% scaling and 62% experimenting were seen only in search summaries and are not cited here). The MIT NANDA report was read from the PDF text; the OpenAI paper was read as the NBER abstract page only, not the full paper. Upwork's own page returned 403, so source 3 is a copy of the same press release.
- No source measures leaders expecting "factory"-scale gains. Upwork's 96% is about productivity increases in general [3]. The 2025 Microsoft figures are about agent familiarity, not expected outcomes [2]. Factory stays a labelled hypothesis.
- The three surveys differ in date (2024, 2025, 2026), sponsor, population and country mix; they cannot be read as one series. Sources 1 to 3 are vendor-run (Microsoft, Upwork); source 6 is preliminary and self-described as possibly unrepresentative; source 7 is a ChatGPT consumer sample, not workers, with two OpenAI-employed authors.
- "Most workers use chat rather than agents" is an inference: [1] shows advanced agent use is 16% of AI users, and [6][7] show chat tools dominate adoption. [4] shows delegation inside chat, so "chat" and "prompting" are not cleanly separable from automation.
- The 2026 Microsoft report page, as read, gave no leader versus employee split, so the leader gap rests on 2025 only [2].

[1]: https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization 'Microsoft, Work Trend Index 2026: Agents, human agency and the opportunity for every organization'
[2]: https://www.microsoft.com/en-us/worklab/work-trend-index/2025-the-year-the-frontier-firm-is-born 'Microsoft, Work Trend Index 2025: The year the Frontier Firm is born'
[3]: https://finance.yahoo.com/news/upwork-study-finds-employee-workloads-130000327.html 'Upwork, Study Finds Employee Workloads Rising Despite Increased C-Suite Investment in AI (press release copy; upwork.com returned 403)'
[4]: https://www.anthropic.com/research/anthropic-economic-index-september-2025-report 'Anthropic, Economic Index report, September 2025'
[5]: https://www.gallup.com/699797/indicator-artificial-intelligence.aspx 'Gallup, AI in the workplace indicator'
[6]: https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf 'MIT Project NANDA, The GenAI Divide: State of AI in Business 2025 (preliminary findings)'
[7]: https://www.nber.org/papers/w34255 'Chatterji et al., How People Use ChatGPT (NBER Working Paper 34255)'
