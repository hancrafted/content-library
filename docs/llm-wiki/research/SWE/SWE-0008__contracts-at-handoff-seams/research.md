---
type: research
title: 'Why does a stated contract at each handoff between workers keep the
  parts of a workflow from failing at their seams?'
description: 'A contract states what the receiver needs and the supplier returns, not the steps; builders report vague handoffs duplicate or miss work, but no study tests contracts between agents.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-18T00:58:00+01:00
stale_after: 2027-05-18T00:00:00+01:00
sources:
  - id: 1
    resource: docs/episodes/what-agentic-workflows-require/research/SWE-0005__design-by-contract-handoffs/research.md
    title: 'content-library research, Why does design by contract, agreeing what
      each party receives and delivers, make handoffs reliable without prescribing
      how the work is done?'
  - id: 2
    resource: https://www.anthropic.com/engineering/multi-agent-research-system
    title: 'Anthropic, How we built our multi-agent research system'
  - id: 3
    resource: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
    title: 'Anthropic, Prompting best practices'
---

# Why does a stated contract at each handoff between workers keep the parts of a workflow from failing at their seams?

## Context

Asked to support "Contracts at the seams", the fourth principle of an agentic workflow: where one worker's output becomes the next one's input, the two agree beforehand on what is handed over. The question is scoped to what the sources show about stated handoff conditions, from software design and from agent builders. This file extends one earlier research file, which holds the primary-source reading of Meyer's design by contract.

## Answer

Design by contract, the software-engineering source of the idea, assigns each condition to exactly one party: the precondition says what the caller must provide, the postcondition says what the supplier ensures, and neither says how the work is done, so responsibility for a failure is clear [1]. Agent builders report the same need in their own terms: Anthropic found that each subagent needs an objective, an output format, guidance on tools and sources, and clear task boundaries, and that short instructions made subagents duplicate work or leave gaps [2]. The principle is supported as a design rule. That a contract makes an agent honour it is not shown: the contract sources concern routines checked by assertions, and the agent sources are builders' experience.

## Findings

1. Meyer takes the business contract as the model: each party expects benefits and accepts obligations; the precondition states what any call must satisfy, the postcondition what it ensures [1].
2. Each condition belongs to one party, so neither defends against everything and responsibility for a failure is clear [1].
3. A contract states results and conditions, not steps, so the supplier may implement the work in any way that meets it. This follows from a contract consisting of preconditions, postconditions and invariants; Meyer does not state it as a rule [1].
4. In Anthropic's research system the lead agent delegates, and "each subagent needs an objective, an output format, guidance on the tools and sources to use, and clear task boundaries". Without that, agents "duplicate work, leave gaps, or fail to find necessary information" [2].
5. The same post says agent-tool interfaces are "as critical as human-computer interfaces", and that bad tool descriptions "can send agents down completely wrong paths", so each tool needs a distinct purpose and a clear description [2].
6. Anthropic's prompting guide advises structured formats for state passed between steps so schema requirements are explicit, and explicit prompt chaining when a person needs to inspect intermediate outputs or enforce a pipeline structure [3].

## Caveats

- Meyer and Eiffel describe contracts between routines, checked by assertions the runtime evaluates. A handoff condition between people and agents is often not a Boolean expression, so "checked by" needs a reviewer or a test; the contract sources do not cover that [1].
- Meyer's contract specifies a routine, not an agent that may read it loosely. Whether an agent honours a stated postcondition is not shown [1].
- The agent evidence is one vendor's account of its own system; it does not use the word "contract", and none of the sources used "seam".
- No source found here compares workflows with and without stated handoff conditions.
- The file cites an earlier research file held in an Episode's staging; its own Caveats apply. [2] and [3] describe named vendor products at a point in time, hence the six-month freshness.

[1]: docs/episodes/what-agentic-workflows-require/research/SWE-0005__design-by-contract-handoffs/research.md 'content-library research, Why does design by contract, agreeing what each party receives and delivers, make handoffs reliable without prescribing how the work is done?'
[2]: https://www.anthropic.com/engineering/multi-agent-research-system 'Anthropic, How we built our multi-agent research system'
[3]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices 'Anthropic, Prompting best practices'
