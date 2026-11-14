---
type: research
title: 'Why does design by contract, agreeing what each party receives and
  delivers, make handoffs reliable without prescribing how the work is done?'
description: 'A contract states what the caller must provide and what the
  supplier guarantees, so each condition has one owner, and the supplier chooses
  the method.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T11:47:26Z
stale_after: 2027-11-14T00:00:00Z
sources:
  - id: 1
    resource: https://pages.mtu.edu/~aebnenas/teaching/spring2010/cs3141/readings/meyerPDF.pdf
    title: 'Meyer, Applying "Design by Contract" (IEEE Computer, October 1992)'
  - id: 2
    resource: https://www.eiffel.com/values/design-by-contract/
    title: 'Eiffel Software, Design by Contract'
---

# Why does design by contract, agreeing what each party receives and delivers, make handoffs reliable without prescribing how the work is done?

## Context

Asked to support the claim that a handoff between two parties is reliable when it states what the receiver is given, what it must deliver and how the result is judged, and says nothing about the method. Meyer's setting is a caller and a called routine in software, so this file reports what he shows there; applying it to people and agents is an extension, flagged in the Caveats.

## Answer

Meyer takes the human business contract as the model: each party expects benefits and accepts obligations to obtain them, and a contract document records both [1]. For a routine, the precondition states what any call must satisfy and the postcondition states what the call ensures in return [1]. Because each condition is assigned to exactly one party, neither party defends against everything, and responsibility for a failure is clear [1]. The contract states results and conditions, not steps, so the supplier may implement the work any way that meets it [1]. Eiffel's own summary gives the same split: what must be true before use, and what is guaranteed after [2].

## Findings

1. Meyer opens from everyday life: to get a package delivered in Paris you may do it yourself or "contract out the task to a courier service", and software calling a routine is the same situation [1].
2. He names two properties of human contracts between two parties: "Each party expects some benefits from the contract and is prepared to incur some obligations to obtain them", and these are "documented in a contract document" [1].
3. A contract document protects both sides: the client "by specifying how much should be done" and the contractor "by specifying how little is acceptable", so it need not carry out "tasks outside of the specified scope" [1].
4. "What is an obligation for one party is usually a benefit for the other": his courier example (Table 1) lists the client's obligation to provide a package within size limits and pay, and the supplier's benefit of not dealing with oversize, overweight or unpaid deliveries [1].
5. The No Hidden Clauses rule: with a fully spelled out contract between honest parties, no requirement other than the official obligations may be imposed on the client as a condition for obtaining the official benefits [1].
6. In software, "the precondition expresses requirements that any call must satisfy if it is to be correct; the postcondition expresses properties that are ensured in return by the execution of the call" [1]. His put-child contract (Table 2) puts the precondition in the client's obligations and the postcondition in the client's benefits [1].
7. A missing precondition equals `Require True` and a missing postcondition equals `Ensure True`, the least committing assertions: leaving a side unstated commits nobody to anything [1].
8. Meyer rejects defensive programming, where both parties check everything: "Either the condition is part of the precondition and must be guaranteed by the client, or it is not stated in the precondition and must be handled by the supplier" [1]. Redundant checks add complexity and "the single worst obstacle" to software quality [1].
9. How strict to be is a trade-off, not a rule: a strong precondition makes the client's burden heavier and the supplier's lighter, and the choice is "a pragmatic decision about division of labor", judged by which gives the simplest architecture [1].
10. The contract does not prescribe the method: a routine's body is not part of it, and Meyer states the contract's content as what each party must guarantee for a correct call and what each is entitled to in return [1]. The same routine contract can be met by any implementation that satisfies it, which is why a subclass may redeclare a routine under a subcontract [1].
11. Eiffel Software defines a precondition as what must be true before a component is used and a postcondition as what the component guarantees after execution, and says contracts "define the legal space of software behavior" [2].

## Caveats

- Meyer and Eiffel describe contracts between software routines, checked by assertions the runtime can evaluate. Using them for handoffs between people and agents is an extension beyond what the sources show.
- A human or agent handoff condition is often not a Boolean expression, so "checked by" needs a reviewer or a test, not an assertion; the sources do not cover that.
- Meyer's 1992 contract is a specification of a routine, not of an agent that may read it loosely or ignore it. Whether an agent honours a stated postcondition is not shown here.
- Finding 10 is partly inference: Meyer does not state "no prescription of how" as a rule; it follows from a contract consisting only of preconditions, postconditions and invariants.
- The Eiffel page gives definitions only; it does not use the words obligation and benefit, so that wording rests on Meyer [1].

[1]: <https://pages.mtu.edu/~aebnenas/teaching/spring2010/cs3141/readings/meyerPDF.pdf> "Meyer, Applying \"Design by Contract\" (IEEE Computer, October 1992)"
[2]: <https://www.eiffel.com/values/design-by-contract/> "Eiffel Software, Design by Contract"
