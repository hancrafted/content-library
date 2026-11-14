---
type: research
title: 'Why does backward reasoning, working back from the goal, find the steps
  and dependencies a plan needs?'
description: 'Working back from the goal finds the steps and dependencies a plan
  needs because each step asks what must hold just before it, until the chain
  reaches today.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T11:52:46Z
stale_after: 2027-11-14T00:00:00Z
sources:
  - id: 1
    resource: https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How%20to%20Solve%20It.pdf
    title: 'Pólya, How to Solve It (1945), entries Pappus and Working backwards'
  - id: 2
    resource: https://aima.cs.berkeley.edu/2nd-ed/newchap11.pdf
    title: 'Russell and Norvig, Artificial Intelligence: A Modern Approach, 2nd ed.,
      chapter 11 Planning'
  - id: 3
    resource: http://bitsavers.informatik.uni-stuttgart.de/pdf/rand/ipl/P-1584_Report_On_A_General_Problem-Solving_Program_Feb59.pdf
    title: 'Newell, Shaw and Simon, Report on a General Problem-Solving Program
      (RAND P-1584, 1959)'
---

# Why does backward reasoning, working back from the goal, find the steps and dependencies a plan needs?

## Context

Asked to support the claim that planning from a goal, breaking it into subgoals until reaching where you stand today, surfaces steps and dependencies that planning from the present misses. The claim is about the method and its two long-standing formulations, in mathematical heuristics and in AI planning, not about any one domain.

## Answer

Backward reasoning assumes the goal is already achieved and repeatedly asks what must come immediately before it, so each answer is a step or a precondition that the goal needs, and the chain ends where it meets what is already known or true today. In AI planning this is regression: each step replaces a goal with the subgoals that must hold before it. It considers only steps that contribute to the goal, so it often searches far less than forward search. The established names are "working backwards" and "regressive reasoning" (Pólya) and "backward search" or "regression planning" (AI planning); "backward reasoning" is a plain-language gloss of them.

## Findings

1. Pólya quotes Pappus: in analysis "we start from what is required, we take it for granted", and ask "from what antecedent the desired result could be derived", then the antecedent of that antecedent, "until passing from antecedent to antecedent, we come eventually upon something already known or admittedly true". Pappus names this "analysis, or solution backwards, or regressive reasoning" [1].
2. Pólya's own entry "Working backwards" states the procedure as a question: concentrate on the desired end, "visualize the final position in which we would like to be. From what foregoing position could we get there?" [1].
3. Pólya's worked example is a measuring puzzle (exactly six quarts from a four-quart and a nine-quart pail). Assuming six quarts in the large container, working back shows it needs nine quarts less three poured out, which needs one quart in the small container, which is a state reachable from the start; the solution is then found "in retrogressive order" and performed by reversing it [1].
4. Pólya notes the method needs no genius ("anybody can do it with a little common sense") yet there is "a certain psychological difficulty in turning around, in going away from the goal, in working backwards, in not following the direct path to the desired end" [1].
5. In AI planning, searching backwards "is sometimes called regression planning": the question is "what are the states from which applying a given action leads to the goal?", and computing that description is "regressing the goal through the action" [2].
6. A regression step adds the action's preconditions to the goal. Given the goal of 20 cargo pieces at airport B, the action Unload(C1, p, B) is relevant, and "any predecessor state must include these preconditions: In(C1, p) and At(p, B)". Each precondition is a dependency the plan needs [2].
7. The procedure is mechanical: delete the action's positive effects that appear in the goal, add each of its precondition literals, and stop "when a predecessor description is generated that is satisfied by the initial state" [2].
8. "The main advantage of backward search is that it allows us to consider only relevant actions", those that achieve a part of the goal, and an action that undoes a desired part of the goal is excluded. In the textbook air cargo problem there are about 1000 actions leading forward from the initial state but only 20 working backward from the goal [2].
9. Newell, Shaw and Simon's General Problem Solver rests on the "principle of subgoal reduction: make progress by substituting for the achievement of a goal the achievement of a set of easier goals" [3].
10. Their means-ends analysis asks what differs between what you have and what you want, and what changes that difference. Where an operator cannot yet be applied, getting it applicable becomes a new goal. Their example runs from taking a son to nursery school back through a car that will not start, a new battery and a repair shop, to a telephone [3].

## Caveats

Findings 1 to 4 and 9 and 10 are mathematical heuristics and a 1959 cognitive-science program. The planning evidence (5 to 8) is for formal planning problems with explicit actions, preconditions and effects. Applying either to a team's recurring process is an inference.

Means-ends analysis (9, 10) moves from the current state toward the goal, choosing operators by the difference they remove, and treats unmet operator conditions as subgoals. It shares subgoal reduction with regression but is not the same as working back from the goal [3]. The sources do not show that backward reasoning finds tasks nobody owns; that follows from the dependencies it surfaces and is an inference.

The terminology is not fixed. Pólya says "working backwards" and "regressive reasoning", and AI planning says "backward search" and "regression planning" [1][2]. None of these sources uses "backward reasoning" or "backward planning" as a term of art, and "backward chaining", which belongs to rule-based inference, is not covered here. The 1000 versus 20 comparison is the textbook's example for one problem, not a general rate; the source also notes that neither forward nor backward search is efficient without a good heuristic [2]. The Pólya source is an unofficial copy of the book; the quoted passages match the 1945 text as reproduced there.

[1]: <https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How%20to%20Solve%20It.pdf> "Pólya, How to Solve It (1945), entries Pappus and Working backwards"
[2]: <https://aima.cs.berkeley.edu/2nd-ed/newchap11.pdf> "Russell and Norvig, Artificial Intelligence: A Modern Approach, 2nd ed., chapter 11 Planning"
[3]: <http://bitsavers.informatik.uni-stuttgart.de/pdf/rand/ipl/P-1584_Report_On_A_General_Problem-Solving_Program_Feb59.pdf> "Newell, Shaw and Simon, Report on a General Problem-Solving Program (RAND P-1584, 1959)"
