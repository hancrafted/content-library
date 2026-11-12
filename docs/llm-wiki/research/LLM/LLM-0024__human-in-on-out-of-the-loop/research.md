---
type: research
title: 'Why do human-in, human-on and human-out-of-the-loop mark different AI capability Levels?'
description: "The three terms come from military autonomy policy and the EU 2019 ethics guidelines; applied to LLM agents they are used loosely, and the evidence supports the product owner's ordering only in part."
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-11T12:00:00Z
stale_after: 2027-05-11T00:00:00Z
sources:
  - id: 1
    resource: https://www.hrw.org/report/2012/11/19/losing-humanity/case-against-killer-robots
    title: 'Human Rights Watch and Harvard IHRC, Losing Humanity (19 Nov 2012)'
  - id: 2
    resource: https://www.congress.gov/crs_external_products/IF/PDF/IF11150/IF11150.15.pdf
    title: 'CRS, Defense Primer: U.S. Policy on Lethal Autonomous Weapon Systems (updated 26 Mar 2026), quoting DoDD 3000.09'
  - id: 3
    resource: https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419
    title: 'EU High-Level Expert Group on AI, Ethics Guidelines for Trustworthy AI (8 Apr 2019)'
  - id: 4
    resource: https://artificialintelligenceact.eu/article/14/
    title: 'EU AI Act (Regulation 2024/1689), Article 14 Human oversight'
  - id: 5
    resource: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
    title: 'NIST AI 600-1, Generative AI Profile (July 2024)'
  - id: 6
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents (19 Dec 2024)'
  - id: 7
    resource: https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
    title: 'OpenAI, A practical guide to building agents (2025)'
  - id: 8
    resource: https://www.anthropic.com/research/measuring-agent-autonomy
    title: 'Anthropic, Measuring AI agent autonomy in practice (18 Feb 2026)'
  - id: 9
    resource: https://www.anthropic.com/engineering/claude-code-sandboxing
    title: 'Anthropic, Beyond permission prompts: making Claude Code more secure and autonomous (20 Oct 2025)'
  - id: 10
    resource: https://arxiv.org/abs/2507.14034
    title: 'Wulf, Meierhofer, Hannich, Architecting Human-AI Cocreation for Technical Services (18 Jul 2025)'
  - id: 11
    resource: https://docs.langchain.com/oss/python/langgraph/human-in-the-loop
    title: 'LangGraph documentation, Human-in-the-loop (read Nov 2026)'
  - id: 12
    resource: https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/
    title: 'Dan Shapiro, The Five Levels (23 Jan 2026)'
  - id: 13
    resource: https://simonwillison.net/2026/Feb/7/software-factory/
    title: 'Simon Willison, StrongDM Software Factory (7 Feb 2026)'
  - id: 14
    resource: https://web.archive.org/web/2024/https://www.esd.whs.mil/portals/54/documents/dd/issuances/dodd/300009p.pdf
    title: 'US DoD, Directive 3000.09 Autonomy in Weapon Systems (25 Jan 2023); Wayback copy, the esd.whs.mil URL returns 403'
---

# Why do human-in, human-on and human-out-of-the-loop mark different AI capability Levels?

## Context

Asked for the AI capability Explorable (`.scratch/ai-capability/handoff.md`): define the three oversight modes from public sources, then test the product owner's hypothesis that HITL runs from mid-Agents and peaks at Workflows, HOTL from mid-Workflows to mid-Factory, and HOOTL starts at Factory. The four Levels are Prompting (2022-23), Agents (2024-25), Workflows (2024-26) and Factory (2026 onward). The Levels are the repo's own frame; no source uses them, so every placement on them is judgement.

Repo check: the human-in-the-loop Explorable (`docs/features/explorables/human-in-the-loop.md`) uses the term for a person who reviews each stage of a Workflow before the next ("a check mark once a person has reviewed it"). No file in `docs/` or `src/` defines human-on-the-loop or human-out-of-the-loop, and `GLOSSARY.md` has no entry for any of the three. The ai-capability preview already labels Workflows "agents on a graph, a human in the loop". The definitions below match that usage.

## Answer

The terms started as a three-way split of weapon autonomy: a human must command each engagement (in), a human supervises and can override (on), no human involvement (out). The same split carries over to agents by changing what "engagement" means: an action the agent takes. Two published definitions of "on the loop" differ, and the repo should pick one: the military one (the system acts, a human can abort) and the EU 2019 one (a human intervenes in the design cycle and monitors operation). For the Explorable, the military reading fits agents better.

The evidence supports the hypothesis in its middle, not at its ends. HITL as a designed checkpoint is documented from the first agents. The shift from approving to monitoring (HOTL) is measured inside the Agents Level already, before Workflows. HOOTL at Factory holds for one step only, code review. For the whole lifecycle no source claims a human is out of the loop; the humans move to specs, scenarios and outcome checks.

## Findings

1. Origin, military, 2012. "Human-in-the-Loop Weapons: Robots that can select targets and deliver force only with a human command." "Human-on-the-Loop Weapons: Robots that can select targets and deliver force under the oversight of a human operator who can override the robots' actions." "Human-out-of-the-Loop Weapons: Robots that are capable of selecting targets and delivering force without any human input or interaction." [1] These are the earliest triad I found; whether earlier uses exist is not checked.
2. Origin, US policy. DoDD 3000.09 (issued Nov 2012, reissued 25 Jan 2023), verified in the 2023 PDF (a Wayback copy of the esd.whs.mil file; the live URL returns 403). Its definitions: an autonomous weapon system is a "weapon system that, once activated, can select and engage targets without further intervention by an operator", including "operator-supervised autonomous weapon systems that are designed to allow operators to override operation"; an operator-supervised autonomous weapon system is one "designed to provide operators with the ability to intervene and terminate engagements"; a semi-autonomous one is "intended to only engage individual targets or specific target groups that have been selected by an operator". The 2023 text says "operator", not "human" (the draft's "human operator" came from the CRS paraphrase), and it never uses the labels "in/on/out of the loop". CRS adds them: "This concept of autonomy is also known as 'human out of the loop' or 'full autonomy.' The directive contrasts LAWS with human-supervised, or 'human on the loop,' autonomous weapon systems, in which operators have the ability to monitor and halt a weapon's target engagement." Semi-autonomous, or "human in the loop," systems "only engage individual targets or specific target groups that have been selected by a human operator." [2] The loop labels are CRS's gloss, not the directive's words.
3. EU 2019, the only source I found that names all of HITL and HOTL for AI governance. "HITL refers to the capability for human intervention in every decision cycle of the system, which in many cases is neither possible nor desirable. HOTL refers to the capability for human intervention during the design cycle of the system and monitoring the system's operation. HIC refers to the capability to oversee the overall activity of the AI system ... and the ability to decide when and how to use the system." It adds: "the less oversight a human can exercise over an AI system, the more extensive testing and stricter governance is required." [3] It has no out-of-the-loop term; it adds human-in-command (HIC).
4. EU AI Act, Art. 14. The phrases "human-in-the-loop" and "on-the-loop" do not appear. It requires high-risk systems to be "effectively overseen by natural persons during the period in which they are in use"; measures "shall be commensurate with the risks, level of autonomy and context of use"; overseers must be able to "disregard, override or reverse the output" and to "interrupt the system through a 'stop' button". [4] Read together: the Act demands at least on-the-loop capability for high-risk systems, so full out-of-the-loop is not available there (reading mine, not stated by the Act). Article 14 applies from 2 Dec 2027 for Annex III systems and 2 Aug 2028 for Annex I systems, per the page read; the Digital Omnibus may have moved these dates, not checked.
5. NIST AI 600-1 (July 2024) has no definition of the three terms. It defines "Human-AI Configuration" as "Arrangements of or interactions between a human and an AI system" and sets policy for "roles and responsibilities for human-AI configurations and oversight of AI systems" (GOVERN 3.2). [5] It is the closest NIST frame but not a definition of the modes.
6. Applied to LLM agents, vendor and academic wording:
   - Anthropic: after the task is defined, "agents plan and operate independently, potentially returning to the human for further information or judgement"; "Agents can then pause for human feedback at checkpoints or when encountering blockers." [6] Dec 2024. This is HITL by checkpoint.
   - OpenAI: "Human intervention is a critical safeguard"; "Two primary triggers typically warrant human intervention: exceeding failure thresholds ... high-risk actions"; high-risk actions "should trigger human oversight until confidence in the agent's reliability grows." The conclusion names "human-in-the-loop intervention". [7] The PDF has no date; secondary coverage dates it 17 Apr 2025 (unverified).
   - Anthropic Feb 2026 declines to define the term: "Defining human involvement is particularly difficult"; oversight "doesn't require approving every action but being in a position to intervene when it matters." Users "shift from approving individual actions to monitoring what the agent does and intervening when needed." [8] That second sentence is the cleanest published statement of the HITL-to-HOTL move for agents.
   - LangGraph: "Interrupts allow you to pause graph execution at specific points and wait for external input before continuing"; "This enables human-in-the-loop patterns." Approve, reject or edit. [11] It is the implementation meaning of HITL in a Workflow.
   - Wulf et al., Jul 2025 (arXiv preprint): HITL "facilitates agent-initiated escalation upon uncertainty"; HOTL "enables discretionary human oversight of an autonomous AI"; HOOTL is "full automation". [10] Abstract only; note this HITL is agent-initiated, narrower than the military one.
7. HITL starts at the beginning of Agents, not mid-Agents. Claude Code defaults to read-only and asks "permission before making modifications or running any commands" [9]; new users approve action by action [8]. Anthropic's Dec 2024 agent guidance already builds in checkpoints [6]. Prompting is HITL in the strict EU sense (a human in every decision cycle), but it is not designed oversight; the human is the driver, which is a judgement about wording.
8. HITL at Workflows is a designed gate, not a peak of intensity. LangGraph interrupts and the repo's stage review are gates [11]. In practice the per-action count falls as people gain experience: full auto-approve rises from about 20% of sessions (under 50 sessions) to over 40% (750 sessions) [8]; sandboxing "reduces permission prompts by 84%" and the sandbox article warns of "approval fatigue" that makes work "less safe" [9]. So the peak of human approvals per unit of agent work is probably at Agents (coding assistants), not Workflows. Shapiro's Level 3 says "You are the human in the loop" and "Your life is diffs", i.e. the heaviest review burden sits before the factory [12]. Challenge to the hypothesis: HITL peaks at Workflows only if peak means most deliberate and structured gating, not most approvals.
9. HOTL begins inside Agents. Interrupts rose from 5% of turns (new users) to about 9% (experienced) while auto-approve rose [8]; Anthropic reads this as active monitoring. The hypothesis puts HOTL from mid-Workflows; the data places its start earlier, at the experienced end of Agents. It plausibly becomes the main mode at Workflows, when gates replace per-action prompts (judgement).
10. HOTL at Factory is the human role in the sources. Shapiro Level 4: "You write a spec ... you leave for 12 hours, and check to see if the tests pass." [12] Willison on StrongDM: engineers "move from building the code to building and then semi-monitoring the systems that build the code." [13] Both are supervision of outcomes, which fits on-the-loop at lifecycle level.
11. HOOTL at Factory holds only per step. Shapiro Level 5: "a black box that turns specs into software", a place "where humans are neither needed nor welcome"; the post does not state outright that nobody reads code. [12] StrongDM's two rules, "Code must not be written by humans" and "Code must not be reviewed by humans" [13], make code writing and review out-of-the-loop. Humans still write the specs and the holdout scenarios, and monitor. Willison questions whether no review "could possibly be a sensible strategy" and the economics ($1,000 per engineer per day) [13]. The StrongDM case is one team; Shapiro knows "a few teams", each under five people [12]. So HOOTL is a property of a step in a Factory, not of the Factory.
12. Regulation pushes the other way. For high-risk uses Art. 14 requires override and stop capability [4], and the EU 2019 guidance asks for stricter testing as oversight shrinks [3]. A fully out-of-the-loop Factory is therefore a choice that governance must offset, a point for the Organization Audience.
13. HITL from mid-Agents: Verdict: Challenged: earlier; Basis: Sourced: permissions from the first agent tools [9], checkpoints [6].
14. HITL peaks at Workflows: Verdict: Partly: peak of designed gates, not of approval volume; Basis: Sourced for gates [11], approval fall [8,9]; the peak label is judgement.
15. HOTL from mid-Workflows: Verdict: Challenged: starts in Agents, becomes dominant at Workflows; Basis: Sourced: [8]. The "dominant at Workflows" part is judgement.
16. HOTL to mid-Factory: Verdict: Supported; Basis: Sourced: [12] Level 4, [13].
17. HOOTL starts at Factory: Verdict: Supported per step, not per lifecycle; Basis: Sourced: [12] Level 5, [13]; the caveat is judgement.
18. Mapping of Shapiro levels to the repo Levels (judgement, no source does it): L0-L2 and L3 are Agents-era coding, L4 is Workflows-to-Factory, L5 is Factory.

## Caveats

- Judgement, not sourced: the mapping onto the four Levels, "mid" and "peak" wording, reading Art. 14 as excluding full HOOTL for high-risk systems, preferring the military sense of "on the loop".
- The military and EU 2019 senses of "on the loop" conflict (override an action vs monitor and intervene in design); pick one for the Explorable and say so.
- Use of the terms for agents is vendor and practitioner wording, plus one preprint [10]. No standards body defines the three terms for LLM agents.
- Unverified:
  - DoDD 3000.09: verified against the 2023 directive text (Wayback copy); the 403 on the live URL still stands. The "human-supervised" wording is CRS's; the directive says "operator-supervised".
  - HRW: only the first 100,000 characters of the page were read; definitions came from there.
  - Anthropic (Dec 2024, Feb 2026, Oct 2025), Shapiro, Willison, Art. 14, LangGraph and Wulf were read through a page summarizer, so quotes were short and may be trimmed; re-open before putting words on a Slide. Shapiro's Level 1-2 detail was not needed and is not cited.
  - The OpenAI guide's date (April 2025) rests on secondary coverage. OpenAI's "harness engineering" post could not be opened (403) and is not used.
  - NIST AI 100-1 (RMF 1.0) was not opened.
  - Art. 14 application dates were not checked against later amendments.
  - Parasuraman, Sheridan and Wickens (2000), the classic levels-of-automation model, was found only as a citation and abstract excerpt, and is not used.
  - 73% of API tool calls with "a human in the loop in some way" and the 87% vs 67% by task complexity were read from the Anthropic summary but are not used above because Anthropic calls them an upper bound.

[1]: https://www.hrw.org/report/2012/11/19/losing-humanity/case-against-killer-robots 'Human Rights Watch and Harvard IHRC, Losing Humanity (19 Nov 2012)'
[2]: https://www.congress.gov/crs_external_products/IF/PDF/IF11150/IF11150.15.pdf 'CRS, Defense Primer: U.S. Policy on Lethal Autonomous Weapon Systems (26 Mar 2026)'
[3]: https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419 'EU HLEG, Ethics Guidelines for Trustworthy AI (8 Apr 2019)'
[4]: https://artificialintelligenceact.eu/article/14/ 'EU AI Act, Article 14'
[5]: https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf 'NIST AI 600-1 (July 2024)'
[6]: https://www.anthropic.com/engineering/building-effective-agents 'Anthropic, Building effective agents (19 Dec 2024)'
[7]: https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf 'OpenAI, A practical guide to building agents'
[8]: https://www.anthropic.com/research/measuring-agent-autonomy 'Anthropic, Measuring AI agent autonomy in practice (18 Feb 2026)'
[9]: https://www.anthropic.com/engineering/claude-code-sandboxing 'Anthropic, Claude Code sandboxing (20 Oct 2025)'
[10]: https://arxiv.org/abs/2507.14034 'Wulf et al., Human-AI Cocreation (18 Jul 2025)'
[11]: https://docs.langchain.com/oss/python/langgraph/human-in-the-loop 'LangGraph, Human-in-the-loop'
[12]: https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/ 'Dan Shapiro, The Five Levels (23 Jan 2026)'
[13]: https://simonwillison.net/2026/Feb/7/software-factory/ 'Simon Willison, StrongDM Software Factory (7 Feb 2026)'
[14]: https://web.archive.org/web/2024/https://www.esd.whs.mil/portals/54/documents/dd/issuances/dodd/300009p.pdf 'US DoD, Directive 3000.09 (25 Jan 2023); Wayback copy'
