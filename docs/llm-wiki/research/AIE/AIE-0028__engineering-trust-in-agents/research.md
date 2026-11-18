---
type: research
title: 'Why is trust in an AI agent something to engineer through review and
  safeguards, rather than assume?'
description: "Trust should match an agent's demonstrated reliability: unchecked output has caused harm, and vendors advise sandbox tests, checkpoints and guardrails, but no study measures them as a set."
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-18T00:58:00+01:00
stale_after: 2027-05-18T00:00:00+01:00
sources:
  - id: 1
    resource: https://pubmed.ncbi.nlm.nih.gov/15151155/
    title: 'Lee and See, Trust in Automation: Designing for Appropriate Reliance
      (Human Factors, 2004), abstract'
  - id: 2
    resource: https://brightspotcdn.byui.edu/e6/50/278fcd0e464796162f3fb9d0ef70/adp-6-0-mission-command.pdf
    title: 'US Army, ADP 6-0 Mission Command (17 May 2012), copy hosted by Brigham Young University-Idaho'
  - id: 3
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents'
  - id: 4
    resource: https://www.anthropic.com/engineering/multi-agent-research-system
    title: 'Anthropic, How we built our multi-agent research system'
  - id: 5
    resource: docs/llm-wiki/research/AIE/AIE-0005__risks-of-unchecked-ai-output/research.md
    title: 'content-library research, Why does unchecked AI work carry real risk?'
  - id: 6
    resource: docs/llm-wiki/research/AIE/AIE-0010__checking-intermediate-steps/research.md
    title: 'content-library research, Why does checking intermediate steps catch
      errors that a review of only the final result misses?'
---

# Why is trust in an AI agent something to engineer through review and safeguards, rather than assume?

## Context

Asked to support "Engineer trust", the fifth principle of an agentic workflow, glossed as review plus hardening: build the checks and safeguards that make it reasonable to rely on what an agent returns. The question covers what research on trust in automation says trust should track, what doctrine and agent builders say earns it, and what the evidence is for review and hardening. It extends two earlier research files on unchecked output and step-level checks.

## Answer

The evidence supports engineering trust, in the sense of matching reliance to demonstrated reliability, and does not support maximising it. The human-factors review of trust in automation finds that people often fail to rely on automation appropriately, and that trust guides reliance when the automation cannot be fully understood [1]. Army doctrine says trust "must be earned" [2]. Unchecked AI output has caused documented harm, and step-level checks catch errors that result-level checks miss [5][6]. Anthropic advises extensive sandbox testing, guardrails, human checkpoints, ground truth from the environment and evaluations that include human review [3][4]. These are practices from builders, not a measured package, and "hardening" is the loosest part of the wording.

## Findings

1. Lee and See's review states that "automation is often problematic because people fail to rely upon it appropriately", that trust influences reliance, and that it guides reliance "when complexity and unanticipated situations make a complete understanding of the automation impractical" [1].
2. Army doctrine: "Trust takes time and must be earned" and is gained or lost through everyday actions more than through grand or occasional ones [2].
3. Anthropic's agent guidance: it is "crucial for the agents to gain 'ground truth' from the environment at each step", agents can "pause for human feedback at checkpoints or when encountering blockers", and stopping conditions maintain control [3].
4. It also says the autonomous nature of agents means higher costs and "the potential for compounding errors", and recommends "extensive testing in sandboxed environments, along with the appropriate guardrails" [3].
5. Anthropic's research-system post combines deterministic safeguards (retry logic, regular checkpoints) with the agent's adaptability, uses an LLM judge on a rubric that includes citation accuracy and source quality, and reports that "human evaluation catches what automation misses": testers found early agents preferred SEO-optimised content farms over authoritative sources [4].
6. Unchecked AI output has caused documented harm, from fines for citing cases a model invented to less secure code written with more confidence, though the code-security effect is disputed [5].
7. A correct-looking final answer can rest on flawed reasoning; step-level checks find errors that final-result checks pass, and models cannot reliably find those errors in themselves, so the check needs an outside reader [6].

## Caveats

- Lee and See is read only from its abstract; the 2004 review is about automation in general, not language-model agents.
- Doctrine is about trust between people in command; applying it to agents is an inference.
- Findings 3 to 5 are vendor guidance from one vendor, describing its own systems, not measurements that sandboxing, guardrails or checkpoints raise reliability. Anthropic's prompting guide also advises asking the model to verify its own work and says one recent model does this without being asked; that is a vendor claim, and AIE-0010 shows models are unreliable at finding their own errors [6].
- The step-level evidence is from maths and multiple-choice reasoning; the harm evidence is from legal filings and 2022-era models [5][6].
- The sources describe review, testing and safeguards; none separately evidences "hardening" as a distinct step.
- [3] and [4] describe named vendor products at a point in time, hence the six-month freshness.

[1]: https://pubmed.ncbi.nlm.nih.gov/15151155/ 'Lee and See, Trust in Automation: Designing for Appropriate Reliance (Human Factors, 2004), abstract'
[2]: https://brightspotcdn.byui.edu/e6/50/278fcd0e464796162f3fb9d0ef70/adp-6-0-mission-command.pdf 'US Army, ADP 6-0 Mission Command (17 May 2012), copy hosted by Brigham Young University-Idaho'
[3]: https://www.anthropic.com/engineering/building-effective-agents 'Anthropic, Building effective agents'
[4]: https://www.anthropic.com/engineering/multi-agent-research-system 'Anthropic, How we built our multi-agent research system'
[5]: docs/llm-wiki/research/AIE/AIE-0005__risks-of-unchecked-ai-output/research.md 'content-library research, Why does unchecked AI work carry real risk?'
[6]: docs/llm-wiki/research/AIE/AIE-0010__checking-intermediate-steps/research.md 'content-library research, Why does checking intermediate steps catch errors that a review of only the final result misses?'
