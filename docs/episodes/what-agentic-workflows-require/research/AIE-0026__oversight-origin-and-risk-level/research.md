---
type: research
title: 'Why do in, on and out of the loop come from military and aviation
  automation, and why does a task''s risk, what a wrong result can do, decide
  which level it gets?'
description: 'The loop terms come from weapon autonomy and aircraft supervisory
  control; AI rules and vendors give more oversight to severe or irreversible
  risk, but no source says risk alone sets the level.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T14:43:49Z
stale_after: 2027-05-14T00:00:00Z
sources:
  - id: 1
    resource: https://www.hlaszny.com/booksAndPapers/buckets/b3_handbookOfSysEng/Ch%2016%20Human%20Supervisory%20Control.pdf
    title: 'Sheridan, Human Supervisory Control (Handbook of Systems Engineering and
      Management, Wiley, 1999, ch. 16)'
  - id: 2
    resource: https://doi.org/10.1109/3468.844354
    title: 'Parasuraman, Sheridan, Wickens, A Model for Types and Levels of Human
      Interaction with Automation (IEEE Trans. SMC-A 30(3), 2000)'
  - id: 3
    resource: https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-123.pdf
    title: 'FAA, Advisory Circular 120-123, Flightpath Management (21 Nov 2022)'
  - id: 4
    resource: https://artificialintelligenceact.eu/article/6/
    title: 'EU AI Act (Regulation 2024/1689), Article 6 Classification rules for
      high-risk AI systems'
  - id: 5
    resource: https://artificialintelligenceact.eu/article/14/
    title: 'EU AI Act (Regulation 2024/1689), Article 14 Human oversight'
  - id: 6
    resource: https://artificialintelligenceact.eu/annex/3/
    title: 'EU AI Act (Regulation 2024/1689), Annex III High-risk AI systems'
  - id: 7
    resource: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
    title: 'NIST, AI Risk Management Framework 1.0 (NIST AI 100-1, January 2023)'
  - id: 8
    resource: https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
    title: 'OpenAI, A practical guide to building agents'
  - id: 9
    resource: https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents
    title: 'Anthropic, Our framework for developing safe and trustworthy agents (Aug
      2025)'
  - id: 10
    resource: https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/LLM/LLM-0024__human-in-on-out-of-the-loop/research.md
    title: 'Earlier research file, Why do human-in, human-on and
      human-out-of-the-loop mark different AI capability Levels? (LLM-0024)'
  - id: 11
    resource: docs/episodes/what-agentic-workflows-require/research/AIE-0024__result-checkability-limits-oversight/research.md
    title: 'Earlier research file, Why does how well a result can be checked limit
      how far human oversight can be reduced? (AIE-0024)'
---

# Why do in, on and out of the loop come from military and aviation automation, and why does a task's risk, what a wrong result can do, decide which level it gets?

## Context

Asked to support two claims: that the terms for how much a person stays involved with an agent were borrowed from fields where automation already acted on its own with serious consequences, and that the level of involvement is chosen per task by what a wrong result can do. The military origin and the definitions of the three terms are in [10]; the link between how well a result can be checked and how far oversight can shrink is in [11]. This file adds the aviation and supervisory-control side and the sources that tie oversight to risk.

## Answer

The loop vocabulary has two roots: weapon autonomy, where the split is who selects and engages targets [10], and supervisory control, the engineering field built around aircraft, spacecraft and process plants, where a computer closes the control loop and the person plans, monitors and corrects it [1]. Both are fields where an automated action can kill or destroy and cannot be undone, which is why the person's role was designed deliberately rather than left to chance. The sources that set rules for AI today attach the amount of oversight to risk: the EU AI Act requires oversight for high-risk systems and measures "commensurate with the risks" [4][5], NIST says policies and resources should follow "the assessed risk level and potential impact" [7], and OpenAI and Anthropic ask for a human before high-stakes, irreversible actions [8][9]. The automation-levels literature adds a caution: it treats the cost of a wrong result as a secondary criterion after the effect on human performance [2], and aviation guidance warns that levels are hard to apply as a strict hierarchy [3]. That risk alone selects the level is this file's synthesis, not a claim any one source makes.

## Findings

1. Supervisory control grew from aircraft. Sheridan writes that theorizing began when "direct manual control by the human operator was being replaced by the computer in aircraft", leaving the person "in a new role of monitor and goal-constraint setter", and the US space program added the case of a person on earth controlling a vehicle on the moon through a 3-second delay, solved by making the operator "a supervisory controller" who communicates intermittently with a computer that closes the loop [1].
2. Sheridan's definition is the on-the-loop role in engineering terms: humans "set initial conditions for, intermittently adjust, and receive information from" a computer that itself closes a control loop through a controlled process. He compares it to a supervisor giving subordinate staff general instructions [1]. In-the-loop is then direct manual control, and out-of-the-loop is a computer that needs no person.
3. The aviation history in [1] runs from purely manual control, through simple autopilots that hold altitude or heading, to autopilot modes that take off or land the aircraft, with the pilot's work shifting to "button-pushing". The flight management system "permits pilot selection among many levels of automation" [1]. The pilot chooses a level of automation per phase of flight, the same design question an agent workflow poses per step.
4. A formal model of those levels. Parasuraman, Sheridan and Wickens propose that automation applies to four types of function (information acquisition, information analysis, decision and action selection, action implementation), each across "a continuum of levels from low to high, i.e., from fully manual to fully automatic". They state that automation "does not merely supplant but changes human activity and can impose new coordination demands on the human operator" [2].
5. Risk enters that model as a secondary criterion. "The human performance consequences of particular types and levels of automation constitute primary evaluative criteria", and "secondary evaluative criteria include automation reliability and the costs of decision/action consequences, among others" [2]. So the aviation-derived model does name the cost of a wrong decision as an input to the level, but ranks the effect on the person first (see Caveats).
6. Current FAA guidance keeps the person responsible. AC 120-123 says "the responsibility for FPM [flightpath management] remains with the pilots at all times" and warns that policies dealing only with automation use "can misplace the responsibility of FPM onto the automation system" [3].
7. Monitoring is treated as a safety barrier, and its failure is a documented vulnerability. "Effective monitoring and cross-checking can be the last barrier or line of defense against accidents", and "inadequate monitoring and cross-checking" is identified in studies of incidents and accidents [3]. Degraded manual skill is a second documented cost: "degradation of pilot skills in MFO [manual flight operations] has been identified as a potential vulnerability", and a policy that "excessively require[s] the use of automated systems may negatively affect the retention of MFO skills" [3].
8. The FAA warns against reading levels as a strict ladder. Levels of automation are "simple hierarchies of combinations of certain autoflight systems", a description that "assumes a linear hierarchy that is difficult to apply operationally"; operators should give strategies for the right combination for the situation, without defining them in levels "except for the highest (everything is on) or the lowest (everything is off)" [3].
9. The EU AI Act ties oversight to a risk class. An AI system is high-risk if it is a safety component of a product that needs third-party conformity assessment (Art. 6(1)) or if it is listed in Annex III (Art. 6(2)); an Annex III system escapes the class if it "does not pose a significant risk of harm to the health, safety or fundamental rights of natural persons", for instance by performing a "narrow procedural task" or a "preparatory task to an assessment"; profiling of natural persons is always high-risk [4]. Annex III lists areas such as critical infrastructure, education, employment and worker management, law enforcement and administration of justice [6].
10. Within the high-risk class, the amount of oversight again follows risk. Art. 14(3): "The oversight measures shall be commensurate with the risks, level of autonomy and context of use of the high-risk AI system". Oversight "shall aim to prevent or minimise the risks to health, safety or fundamental rights" [5]. For remote biometric identification the Act goes to the top of its ladder: no action or decision may be taken on the identification "unless that identification has been separately verified and confirmed by at least two natural persons with the necessary competence, training and authority", with exceptions for law enforcement, migration, border control and asylum where national law finds it disproportionate [5].
11. NIST's AI RMF 1.0 does not prescribe a level of oversight but prescribes prioritising by risk: "Policies and resources should be prioritized based on the assessed risk level and potential impact of an AI system", and risks judged highest "call for the most urgent prioritization and most thorough risk management process"; low-risk use "may suggest potentially lower prioritization" (section 1.2.3). It leaves risk tolerance to the organization (1.2.2). Function MAP 3.5 asks that "processes for human oversight are defined, assessed, and documented", and MANAGE 1.2 prioritises treatment of risks "based on impact, likelihood, and available resources" [7].
12. OpenAI's agent guide turns this into a tool-level rule. Rate each tool low, medium or high "based on factors like read-only vs. write access, reversibility, required account permissions, and financial impact", and use the rating to pause for guardrail checks or escalate to a human. "High-risk actions: Actions that are sensitive, irreversible, or have high stakes should trigger human oversight until confidence in the agent's reliability grows. Examples include canceling user orders, authorizing large refunds, or making payments." [8]
13. Anthropic's framework states the same balance. "A central tension in agent design is balancing agent autonomy with human oversight"; "humans should retain control over how their goals are pursued, particularly before high-stakes decisions are made". Claude Code has read-only permissions by default and "must ask for human approval before taking any actions that modify code or systems", while users can "grant persistent permissions for routine tasks they trust Claude to handle" [9]. Read-only versus modifying is one reversibility split; routine and trusted versus new is another.
14. The earlier files supply the rest of the chain. The military triad is a split of weapon autonomy by who selects and engages targets, and the EU 2019 guidance already says "the less oversight a human can exercise over an AI system, the more extensive testing and stricter governance is required" [10]. How far oversight can drop for a low-risk task depends on whether its result can be checked cheaply [11].

## Caveats

- No source says "risk decides the level" as a rule. Findings 9 to 13 are rules and guidance that tie oversight to risk; combining them into a per-task choice is this file's synthesis. Parasuraman et al. rank the effect on human performance above the cost of errors (Finding 5), so risk is one input among others.
- Findings 4 and 5 rest on the abstract of [2], read through the Europe PMC index; the paper's Table I of ten levels was not opened. Sheridan and Verplank's 1978 ten-level scale (MIT technical report, DTIC ADA057655) could not be fetched and is not cited. Wording of the individual levels is not given here.
- [1] is a Wiley handbook chapter (1999) read from a copy hosted on a third-party site; the chapter's text and page layout were read in full for the passages cited, but the host is not the publisher.
- The FAA's PARC/CAST report on flight path management (2013) could not be fetched; the FAA's own AC 120-123 [3] is used instead. [3] concerns airline pilots, not agents; carrying it to agent workflows is an analogy. The claim that the loop terms came to AI "from aviation" rests on [1] showing the concepts were developed there; no source traces the words "in, on, out of the loop" to aviation. The three labels themselves are traced to military policy in [10].
- The Anthropic framework page [9] and the Art. 6 and Annex III pages [4][6] were read through a page summarizer or as page text, so quotes should be re-opened before they go on a Slide. Art. 6(3) exceptions are summarised; the Act's full list and its application dates (2 Dec 2027 for Annex III, 2 Aug 2028 for Annex I as shown on the page) may have been amended and were not checked.
- OpenAI's guide [8] is undated in the PDF; its date is not used. Rules for AI systems (EU, NIST) are about harm to people; whether the same tiers suit a company's internal agent workflow is a design choice, not a legal requirement, unless the system falls in an Annex III area.

[1]: <https://www.hlaszny.com/booksAndPapers/buckets/b3_handbookOfSysEng/Ch%2016%20Human%20Supervisory%20Control.pdf> "Sheridan, Human Supervisory Control (Handbook of Systems Engineering and Management, Wiley, 1999, ch. 16)"
[2]: <https://doi.org/10.1109/3468.844354> "Parasuraman, Sheridan, Wickens, A Model for Types and Levels of Human Interaction with Automation (IEEE Trans. SMC-A 30(3), 2000)"
[3]: <https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-123.pdf> "FAA, Advisory Circular 120-123, Flightpath Management (21 Nov 2022)"
[4]: <https://artificialintelligenceact.eu/article/6/> "EU AI Act (Regulation 2024/1689), Article 6 Classification rules for high-risk AI systems"
[5]: <https://artificialintelligenceact.eu/article/14/> "EU AI Act (Regulation 2024/1689), Article 14 Human oversight"
[6]: <https://artificialintelligenceact.eu/annex/3/> "EU AI Act (Regulation 2024/1689), Annex III High-risk AI systems"
[7]: <https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf> "NIST, AI Risk Management Framework 1.0 (NIST AI 100-1, January 2023)"
[8]: <https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf> "OpenAI, A practical guide to building agents"
[9]: <https://www.anthropic.com/news/our-framework-for-developing-safe-and-trustworthy-agents> "Anthropic, Our framework for developing safe and trustworthy agents (Aug 2025)"
[10]: <https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/LLM/LLM-0024__human-in-on-out-of-the-loop/research.md> "Earlier research file, Why do human-in, human-on and human-out-of-the-loop mark different AI capability Levels? (LLM-0024)"
[11]: <docs/episodes/what-agentic-workflows-require/research/AIE-0024__result-checkability-limits-oversight/research.md> "Earlier research file, Why does how well a result can be checked limit how far human oversight can be reduced? (AIE-0024)"
