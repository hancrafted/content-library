---
type: research
title: 'Why do workers, AI users and leaders sit at different AI capability Levels?'
description: 'Per-Level adoption numbers for Prompting, Agents, Workflows and Factory with the population stated for each, plus one direct source for leaders expecting autonomous operation.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-11T12:00:00Z
stale_after: 2027-05-11T00:00:00Z
sources:
  - id: 1
    resource: https://www.gallup.com/699797/indicator-artificial-intelligence.aspx
    title: 'Gallup, AI in the workplace indicator (data as of May 2026)'
  - id: 2
    resource: https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/
    title: 'Pew Research Center, Americans and AI 2026 (17 June 2026)'
  - id: 3
    resource: https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization
    title: 'Microsoft, Work Trend Index 2026 (5 May 2026)'
  - id: 4
    resource: https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/
    title: 'Stack Overflow, 2025 Developer Survey press release (29 July 2025)'
  - id: 5
    resource: https://stackoverflow.blog/2026/10/01/a-look-back-before-we-look-forward-a-developer-survey-retrospective/
    title: 'Stack Overflow blog, Developer Survey retrospective (1 October 2026)'
  - id: 6
    resource: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
    title: 'McKinsey, The State of AI 2026 (25 August 2026); NOT opened, read as search excerpts of this page'
  - id: 7
    resource: https://www.bitkom.org/Presse/Presseinformation/Erstmals-nutzt-Mehrheit-Unternehmen-KI
    title: 'Bitkom, Erstmals nutzt die Mehrheit der Unternehmen KI (14 September 2026)'
  - id: 8
    resource: https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises
    title: 'Eurostat, Use of artificial intelligence in enterprises (data extracted December 2025)'
  - id: 9
    resource: https://www.anthropic.com/research/economic-index-june-2026-report
    title: 'Anthropic, Economic Index report: Cadences (26 June 2026)'
  - id: 10
    resource: https://www.gartner.com/en/newsroom/press-releases/2026-04-23-gartner-survey-reveals-80-percent-of-ceos-say-artificial-intelligence-will-force-operational-capability-overhauls
    title: 'Gartner, Survey Reveals 80% of CEOs Say AI Will Force Operational Capability Overhauls (23 April 2026); gartner.com returns 403 to direct fetches, read from a Wayback Machine copy of the release (verified) and the IT-Online copy'
  - id: 11
    resource: https://it-online.co.za/2026/04/24/ai-is-going-to-force-operational-capability-overhauls/
    title: 'IT-Online, AI is going to force operational capability overhauls (24 April 2026), republishing the Gartner release'
  - id: 12
    resource: https://www.grantthornton.com/services/advisory-services/artificial-intelligence/2026-ai-impact-survey
    title: 'Grant Thornton, 2026 AI Impact Survey'
  - id: 13
    resource: https://blog.jetbrains.com/research/2026/08/how-much-code-do-developers-really-let-agents-write/
    title: 'JetBrains Research, How Much Code Do Developers Really Let Agents Write? (August 2026); opened and read on 2026-11-11; the other JetBrains post with the weekly and daily agent-use shares was not reachable'
  - id: 14
    resource: https://www.anthropic.com/research/economic-index-march-2026-report
    title: 'Anthropic, Economic Index report, March 2026 (February 2026 data)'
---

# Why do workers, AI users and leaders sit at different AI capability Levels?

## Context

Extends LLM-0020 (usage gap) and LLM-0019 (ceilings). A teaching Explorable has an "Adoption" row over four Levels: Prompting (chat), Agents (model using tools in a loop), Workflows (multi-agent or multi-step automated), Factory (AI-run lifecycle). Each number needs its population, and the row has a "Leaders expect this" marker on Factory.

## Answer

No survey measures the four Levels on one population. The numbers below come from different populations and must not share one axis without labels.

Best number per Level:

Prompting: Best number: 30% use AI a few times a week or more; 52% a few times a year or more; Population: All US employees (not only AI users); Source: [1], May 2026.

Prompting (chat only): Best number: 38% use AI chatbots for tasks at work; Population: Employed US adults; Source: [2], Feb 2026.

Agents: Best number: 59% use AI agents; Population: Stack Overflow pulse respondents (developers, smaller sample); Source: [5], April 2026.

Agents (organizations): Best number: 40% scale agents in one or more functions at $1B+ revenue firms; 22% at smaller firms; Population: Survey respondents' organizations, globally; Source: [6], 2026.

Workflows: Best number: 16% are "Frontier Professionals"; Population: AI users in 10 markets, knowledge workers; Source: [3], April 2026.

Factory: Best number: No worker or developer share found. Proxy: 5% of business leaders allow agents to execute high-stakes decisions without human review; Population: Business leaders (organizations), 950; Source: [12], Feb-Mar 2026.

Leaders: one direct source. Gartner [10][11], verified at the press release: 27% of CEOs and senior business executives "expect their organizations to operate primarily without human intervention" (n=469). The release does not put a date on that sentence; the end-of-2028 horizon is stated in the preceding sentence, for the 13% who expect to stay at task-limited automation, and the "Conversely" that follows implies it for the 27%. Say "by 2028" only as an implied horizon. This is expectation of autonomous operation of the business, not of AI-run software lifecycles, and Gartner's definition is broader than "Factory".

## Findings

1. Gallup [1], data "As of May 2026": "15% of U.S. employees use AI daily in their role", "30% use it a few times a week or more", "52% use it a few times a year or more". Population: US adults 18+ working full or part time, Gallup Panel, weighted to CPS. This is all employees, not AI users. It measures frequency, not chat versus agent; the page does not mention chatbots or agents. The page's own dates conflict (published January 2026, updated April 2026, data labelled May 2026).
2. Pew [2], published 17 June 2026: "38% of employed adults report using chatbots for tasks at work." Sample: "We surveyed 5,119 U.S. adults from Feb. 17 to 23, 2026." Population: employed US adults (the 38% is of employed adults). Overall adults: 49% use chatbots, 24% daily. The page never mentions agents. This is the cleanest chat-only worker number.
3. Pew older questions, from search summary only and NOT opened: Feb 2025 report (fall 2024 data) "most workers (69%) do not use AI chatbots at work"; a September 2025 survey of 5,010 workers had 21% saying some of their work is done with AI, up from 16%. Unverified.
4. Stack Overflow 2025 [4], 29 July 2025: "AI agents are not being used by the majority of developers, with only 31% using them currently, 17% planning to"; "38% of respondents not planning to use AI agents". Base: "over 49,000 responses from 177 countries". Population: all survey respondents (developers, includes students and learners). Search summaries split the 31% into 14.1% daily, 9% weekly, 7.8% monthly or less (not opened).
5. Stack Overflow 2026 [5], blog dated 1 October 2026: "We held a smaller pulse survey in April 2026 asking about agents again ... this time we see agent use as almost doubled (59%) and Claude Code increasing in usage (from 41% to 55%)." Also: "usage was driven by those that were daily users and those that were in more executive roles." The post gives no sample size for the pulse and does not say whether the population matches 2025. Treat 31% to 59% as a direction, not a trend line. The Claude Code figures are among agent users (inference; the page does not state the base).
6. JetBrains Developer Ecosystem 2026 [13], the August post opened and verified: "In May–July 2026, we asked over 15,000 professional developers worldwide" what share of last month's work code was fully agent-generated, AI-assisted or manual. Averages: ~47% fully agent-written, ~38% AI-assisted, ~27% manual (bucket midpoints, so they can sum above 100%). "The group that relies almost entirely on coding agents (over 80% agent-generated code) remains a minority of around 22%." Segments: agentic coders ~31% (84% of their code agent-generated), AI-assisted coders ~47%, manual coders ~23%. By region, 32%-35% in East Asia against about 16% in Europe and the UK generate over 80% with agents. The survey is reweighted to the global developer population and JetBrains sells AI tools. Not on this page and still UNVERIFIED (from search summaries of a second JetBrains post): 90% of professional developers using coding agents weekly and 68% daily, and an earlier January 2026 pulse with 25% using autonomous agents regularly. The gap between 25% and 90% still shows how much the definition of "agent" drives the number.
7. McKinsey State of AI 2026 [6], published 25 August 2026, 1,719 respondents in 97 countries (not opened; the page timed out four times, content read as excerpts of mckinsey.com returned by search): "For large organizations, the share scaling agents in one or more functions increased from 27 percent to 40 percent, while adoption among smaller organizations remained essentially flat, at 22 percent (Exhibit 2)." "Large" means over $1B revenue. Coding agents: "About two in ten are scaling them (31 percent at larger enterprises)." A secondary summary adds 64% of large firms scaling chatbots (39% smaller), 25% other agents (13%); that was not on the mckinsey.com excerpt, UNVERIFIED. Population: respondents' organizations, not workers.
8. Bitkom [7], Berlin, 14 September 2026, 603 companies with 20+ employees in Germany, phoned in calendar weeks 28 to 33 of 2026: "Erstmals setzt mit 57 Prozent der Großteil der Unternehmen KI ein." On agents: "11 Prozent setzen solche Agenten schon ein, 29 Prozent planen den Einsatz und 31 Prozent diskutieren ihn." Also "KI-Agenten stehen heute etwa dort, wo Künstliche Intelligenz insgesamt vor drei Jahren stand." Population: companies, not workers; Germany. Best Germany number for Agents: 11% of companies.
9. Eurostat [8]: "In 2025, 19.95% of EU enterprises used AI technologies." Page does not name Germany; the figure of about 26% for Germany (10+ employees, 2025) is from a search summary of dataset isoc_eb_ai, UNVERIFIED. Eurostat's AI definition lists text mining, computer vision, speech recognition and similar technologies; it has no agent category. Companies, not workers. Not comparable with Bitkom (different size band, definition and method).
10. Microsoft telemetry [3]: active agents in Microsoft 365 "has grown 15x year over year" (18x in large enterprises), unique agents active in a rolling 28 days on the Copilot Agents platform and SharePoint. A count of agents, not of people.
11. Anthropic June 2026 [9] reports no share of people using agents. It says Claude Code sessions are more autonomous than chat or Cowork ("the average difference in autonomy is 0.37 points") and "the median blog-producing Claude Code session contains a single human prompt". Data: chat and Cowork conversations sampled 10 April to 10 June 2026. Linked survey sample about 9,700 respondents, who are Claude users, with computer and math jobs roughly 30% of them. Not a population of workers.
12. Anthropic March 2026 [14] (February 2026 data) gives no percentages in the text for Claude Code's API share or automation versus augmentation; the figures are in image tables. The January 2026 report figures (Claude.ai augmentation 52%, automation 45%, November 2025 data) come from a search summary, UNVERIFIED. For the Explorable, do not quote Anthropic for the Agents Level.
13. Microsoft [3] (published 5 May 2026): Frontier Professionals "use agents for multi-step workflows and building multi-agent systems", "16% of AI users surveyed (3,233 of 20,000)", 10 markets including Germany, run by Edelman Data x Intelligence. This is a composite that needs advanced agent use, routine workflow redesign and structured practice beyond one person; it is not "everyone running multi-agent workflows". Composition: 44% business decision makers, 56% employees. Fieldwork dates conflict inside the page (18 February to 7 April, or to 20 April 2026).
14. Same report: documented, repeatable agent workflows and handoffs, Frontier Professionals versus other AI users: team 26% vs 19%, function 29% vs 17%, organization 25% vs 14%. Even among the 16%, about a quarter document workflows at each scale. Population per cell is not stated.
15. Same report, "readiness zones" (16,971 respondents): Frontier 19%, Emergent 50%, Stalled 16%, Blocked agency 10%, Unclaimed capacity 5%. This is a different segmentation from the 16% Frontier Professionals; do not merge the two "Frontier" labels.
16. McKinsey 2025 (search summary, not opened): "no more than 10 percent of respondents say their organizations are scaling AI agents" in any single function, and 23% scaling an agentic system somewhere. This is the nearest organization-level figure for multi-step automation, from 1,993 respondents, fielded 25 June to 29 July 2025. UNVERIFIED.
17. No survey measures AI-run end-to-end lifecycles as a share of workers, developers or firms. The proxies below are all partial.
18. Grant Thornton [12]: "Between February 23 and March 18, 2026, Grant Thornton conducted a survey of 950 business leaders across 10 industries." "Only 5% allow agents to execute high-stakes decisions without human review" (the page's sentence is longer; 60% restrict agents to moderate-risk task automation). Population: business leaders answering for their organizations. Closest direct number to "unwatched".
19. JetBrains [13], verified: about 22% of professional developers generate over 80% of their code with agents, and about 31% fall in the agentic-coder segment. The "43% ready to fully delegate code review to AI" claim is not on the opened post and stays UNVERIFIED. These measure code authorship, not an AI-run lifecycle.
20. Cursor vendor data (search summary only, UNVERIFIED): AI-generated changes reaching production without a separate manual review rose from 7% to 36.3% by mid-May 2026; 30% of Cursor's own PRs are agent-developed end to end. Vendor telemetry from one company; do not use as an adoption share.
21. Gartner [10][11], 23 April 2026, verified at the release (Wayback copy of gartner.com): "27% expect their organizations to operate primarily without human intervention, signalling a move to autonomous business ecosystems"; "32% of CEOs expect their organizations to deploy self-learning and adaptable AI tools to assist with human decision-making"; "54% of CEOs said their automation was limited to specific tasks; by the end of 2028, only 13% expect to remain at this level". Survey: "469 CEOs and other senior business executives worldwide", "conducted across three quarters, ending in the fourth quarter of 2025". The release's "Eighty percent ... force a high to medium degree of change" line was in the title and IT-Online copy. The horizon of 2028 is explicit only for the 13% sentence. This is the nearest thing to "leaders expect Factory": a quarter of CEOs expect autonomous operation. It is about the whole operation, not software, and Gartner is an analyst firm with commercial interest in the "autonomous business" framing.
22. Anthropic [9]: "Over a third expect AI to be able to do most or nearly all of their work tasks next year." Population: Claude users who answered a survey (about 9,700 linked respondents, 23% in management), not leaders and not workers generally.
23. Microsoft 2026 [3]: leaders versus employees are split on culture, not expectations. Feeling safe suggesting new ways of working with AI: leaders 81%, employees 67%. Managers create space for experimentation: leaders 78%, employees 59%. "Reinvention is rewarded regardless of outcome": leaders 21%, employees 10%. "Only 26% of AI users say leadership is clearly and consistently aligned on AI." The leader group comes from a 1,800-worker study from July 2025 (819 leaders, 520 managers, 461 individual contributors).
24. Grant Thornton [12]: subtitle "Why AI isn't delivering the performance leaders expected"; "48% of boards haven't set AI governance expectations". Leaders expected performance that has not arrived; no figure for the size of the expectation.
25. Other claims seen only in search results, NOT opened: Deloitte 69% of leaders expect major industry transformation within 18 months; PwC 37% comfortable assigning agents to end-to-end processes. Both come from blog roundups. Do not cite.
26. Carried forward from LLM-0020: Upwork (July 2024) "96% of C-suite leaders expect the use of AI tools to increase their company's overall productivity levels". General productivity, not factory scale.

## Caveats

- Populations differ per row: all US employees [1], employed US adults [2], AI users in 10 markets [3], developers [4][5][13], respondents' organizations [6][12], German companies 20+ employees [7], EU companies 10+ employees [8], Claude users [9], CEOs [10]. A single bar chart would mix workers, developers and firms.
- "Agent" is defined differently per source: any tool-using coding agent (JetBrains), "AI agents" as the respondent understands them (Stack Overflow), scaling an agentic system in a function (McKinsey), Copilot Agents platform objects (Microsoft telemetry). Developer figures range from 22% (over 80% of code agent-written, JetBrains, verified) to 59% (use agents, Stack Overflow pulse) and an unverified 90% (JetBrains secondary).
- Developer figures do not generalise to workers: developers are about 30% of the Anthropic sample and the heaviest agent users. Stack Overflow notes use was "driven by those that were daily users and those that were in more executive roles".
- No source gives the share of workers at Workflows or Factory. The 16% is the only worker-level figure above Agents, and it is a composite, so a card should say "16% of AI users are Frontier Professionals", not "16% run workflows".
- A "most people are here" marker on Prompting stands: 52% of employees use AI at least a few times a year [1] and 38% use chatbots [2], while agent use outside developers has no worker-level figure. It remains an inference that those users are mainly prompting.
- Unopened or unverified: McKinsey primary (mckinsey.com timed out or returned 403 again on 2026-11-11; read as search excerpts only), JetBrains weekly and daily agent-use shares and the 43% review figure, Eurostat Germany figure, Pew 2025 figures, Anthropic January 2026 figures, Cursor, Deloitte, PwC. Verified on 2026-11-11: Gartner (release copy), JetBrains August post.
- Vendor or interested sources: Microsoft, JetBrains, Stack Overflow (owned by Prosus, sells to developers), Gartner, Anthropic (reports on its own users), Cursor.
- Several 2026 pages carry internal date conflicts (Gallup, Microsoft fieldwork, Eurostat reference year). Quote the dates as given and avoid year-over-year comparisons across sources.

- Use one source and population per Level, labelled:
- Suggested wording, Prompting: "52% of US employees use AI at least a few times a year; 30% a few times a week or more (Gallup, May 2026)".
- Suggested wording, Agents: "59% of surveyed developers use agents (Stack Overflow pulse, April 2026); 40% of $1B+ firms scale agents in at least one function (McKinsey, 2026)"; Germany: "11% of companies with 20+ employees (Bitkom, September 2026)".
- Suggested wording, Workflows: "16% of AI users are Frontier Professionals who build multi-agent systems (Microsoft, 2026)".
- Suggested wording, Factory: "No adoption figure exists"; or "5% of leaders let agents decide high-stakes matters without review (Grant Thornton, 2026)".
- Suggested wording, Leaders expect: "27% of CEOs expect their organization to operate primarily without human intervention (Gartner, 469 CEOs, survey ended Q4 2025; horizon 2028 implied)", with the Factory marker kept as a hypothesis in the sense that this is about the whole business, not a software lifecycle.

[1]: https://www.gallup.com/699797/indicator-artificial-intelligence.aspx 'Gallup, AI in the workplace indicator'
[2]: https://www.pewresearch.org/internet/2026/06/17/americans-and-ai-2026-chatbots-smart-devices-and-views-on-impact/ 'Pew Research Center, Americans and AI 2026'
[3]: https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization 'Microsoft, Work Trend Index 2026'
[4]: https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/ 'Stack Overflow, 2025 Developer Survey press release'
[5]: https://stackoverflow.blog/2026/10/01/a-look-back-before-we-look-forward-a-developer-survey-retrospective/ 'Stack Overflow blog, Developer Survey retrospective'
[6]: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai 'McKinsey, The State of AI 2026'
[7]: https://www.bitkom.org/Presse/Presseinformation/Erstmals-nutzt-Mehrheit-Unternehmen-KI 'Bitkom, Erstmals nutzt die Mehrheit der Unternehmen KI'
[8]: https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises 'Eurostat, Use of artificial intelligence in enterprises'
[9]: https://www.anthropic.com/research/economic-index-june-2026-report 'Anthropic, Economic Index report: Cadences'
[10]: https://www.gartner.com/en/newsroom/press-releases/2026-04-23-gartner-survey-reveals-80-percent-of-ceos-say-artificial-intelligence-will-force-operational-capability-overhauls 'Gartner, Survey Reveals 80% of CEOs Say AI Will Force Operational Capability Overhauls'
[11]: https://it-online.co.za/2026/04/24/ai-is-going-to-force-operational-capability-overhauls/ 'IT-Online, AI is going to force operational capability overhauls'
[12]: https://www.grantthornton.com/services/advisory-services/artificial-intelligence/2026-ai-impact-survey 'Grant Thornton, 2026 AI Impact Survey'
[13]: https://blog.jetbrains.com/research/2026/08/how-much-code-do-developers-really-let-agents-write/ 'JetBrains Research, How Much Code Do Developers Really Let Agents Write?'
[14]: https://www.anthropic.com/research/economic-index-march-2026-report 'Anthropic, Economic Index report, March 2026'
