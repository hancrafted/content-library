---
type: research
title: 'Why does starting a plan from the goal, not from the first step, find the
  steps and dependencies the work needs?'
description: 'Planning from the goal asks what must hold just before it, which
  surfaces steps and dependencies; the evidence is for formal planning and
  project scheduling, and no study tests it on agent work.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-18T00:58:00+01:00
stale_after: 2027-11-18T00:00:00+01:00
sources:
  - id: 1
    resource: docs/episodes/what-agentic-workflows-require/research/PLAN-0001__backward-reasoning-from-the-goal/research.md
    title: 'content-library research, Why does backward reasoning, working back from
      the goal, find the steps and dependencies a plan needs?'
  - id: 2
    resource: docs/episodes/what-agentic-workflows-require/research/PLAN-0002__critical-path-backward-pass/research.md
    title: 'content-library research, Why is planning back from the goal a
      well-known project-management principle, as in the backward pass of the
      Critical Path Method?'
  - id: 3
    resource: docs/episodes/what-agentic-workflows-require/research/LLM-0032__clear-goals-improve-agents/research.md
    title: 'content-library research, Why do AI agents perform better when given a
      clearly defined goal and outcome?'
---

# Why does starting a plan from the goal, not from the first step, find the steps and dependencies the work needs?

## Context

Asked to support "Backwards from the goal", the first principle of an agentic workflow: state the finished result first, then derive the steps. The question is scoped to what the evidence shows about planning from the goal, and to whether it carries over to work handed to AI agents. This file extends three earlier research files, which hold the primary-source reading; it adds the verdict on the principle's wording.

## Answer

Planning from the goal is established practice in two long-standing fields: mathematical problem solving ("working backwards") and AI planning ("regression"), and project scheduling computes each job's latest times backward from a fixed completion time [1][2]. Each backward step asks what must hold immediately before the goal, so the chain surfaces the steps and preconditions the goal needs and ends where it meets today [1]. For agents, the supported part is narrower: vendors tell builders to state the goal and success criteria up front, and studies measure that missing detail costs agents accuracy [3]. No source tests the backward method on agent work, so applying it there is an inference.

## Findings

1. Working backwards assumes the goal is achieved and repeatedly asks what must come immediately before it; the chain ends where it meets what is already true [1].
2. In AI planning this is regression: each step replaces a goal with the subgoals that must hold before it. It considers only steps that contribute to the goal, so it often searches far less than forward search; the textbook example is one problem, not a general rate [1].
3. The Critical Path Method computes earliest times forward from the start and latest times backward from a fixed completion time; the gap is each job's float, and jobs with none form the critical path [2].
4. Work breakdown practice starts with the end product and subdivides it into the work that produces it, which checks that all work serves the objective [2].
5. Agents that meet missing detail guess it; that costs accuracy and stability, and agents that recover the detail by asking do better. Anthropic and OpenAI instruct builders to state the goal, success criteria and exit condition; this is guidance, not a measurement [3].

## Caveats

- The planning evidence is for formal planning problems with explicit actions, preconditions and effects, and for project scheduling with a fixed end date. Applying either to a team's recurring process, or to agents, is an inference [1][2].
- The sources do not show that working backwards finds tasks nobody owns, and CPM takes the jobs and dependencies as given [1][2].
- The term is not fixed: Pólya says "working backwards" and "regressive reasoning", AI planning says "backward search" and "regression" [1]. "Backwards from the goal" is a plain-language gloss of these, not a term of art.
- No source found here measures "a clearly defined goal" as one isolated variable for agents [3].
- This file cites earlier research files that sit in an Episode's staging; their own Caveats apply.

[1]: docs/episodes/what-agentic-workflows-require/research/PLAN-0001__backward-reasoning-from-the-goal/research.md 'content-library research, Why does backward reasoning, working back from the goal, find the steps and dependencies a plan needs?'
[2]: docs/episodes/what-agentic-workflows-require/research/PLAN-0002__critical-path-backward-pass/research.md 'content-library research, Why is planning back from the goal a well-known project-management principle, as in the backward pass of the Critical Path Method?'
[3]: docs/episodes/what-agentic-workflows-require/research/LLM-0032__clear-goals-improve-agents/research.md 'content-library research, Why do AI agents perform better when given a clearly defined goal and outcome?'
