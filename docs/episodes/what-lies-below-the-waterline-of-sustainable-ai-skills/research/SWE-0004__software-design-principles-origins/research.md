---
type: research
title: 'Why do the established software engineering principles of the rule of three, YAGNI, premature optimisation, cohesion and coupling, technical debt and Lehman''s laws hold, as their original sources word them?'
description: 'Each principle is a reasoned trade-off its author argued from cost: waiting for evidence before generalising, building or optimising, and keeping change cheap by managing structure.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T15:44:14Z
stale_after: 2027-11-12T00:00:00Z
sources:
  - id: 1
    resource: https://pdfs.semanticscholar.org/2f09/a866bc7cb521227dc5ab2c4092096077c1ac.pdf
    title: 'Fowler, Refactoring: Improving the Design of Existing Code (1997 slides)'
  - id: 2
    resource: https://dl.acm.org/doi/10.1145/356635.356640
    title: 'Knuth, Structured Programming with go to Statements'
  - id: 3
    resource: https://ronjeffries.com/xprog/articles/practices/pracnotneed/
    title: 'Jeffries, You''re NOT gonna need it!'
  - id: 4
    resource: https://martinfowler.com/bliki/Yagni.html
    title: 'Fowler, Yagni'
  - id: 5
    resource: https://doi.org/10.1147/sj.132.0115
    title: 'Stevens, Myers and Constantine, Structured design'
  - id: 6
    resource: https://c2.com/doc/oopsla92.html
    title: 'Cunningham, The WyCash Portfolio Management System'
  - id: 7
    resource: https://users.ece.utexas.edu/~perry/work/papers/feast1.pdf
    title: 'Lehman, Ramil and Wernick, Metrics and Laws of Software Evolution: The Nineties View'
  - id: 8
    resource: https://plg2.cs.uwaterloo.ca/~migod/papers/2000/icsm00.pdf
    title: 'Godfrey and Tu, Evolution in Open Source Software: A Case Study'
  - id: 9
    resource: https://doi.org/10.1145/2543581.2543595
    title: 'Herraiz, Rodriguez, Robles and Gonzalez-Barahona, The evolution of the laws of software evolution: a discussion based on a systematic literature review'
---

# Why do the established software engineering principles of the rule of three, YAGNI, premature optimisation, cohesion and coupling, technical debt and Lehman's laws hold, as their original sources word them?

## Context

Asked to support the claim that a repeated task, a speculative feature or a growing body of instructions follows long-known software engineering trade-offs. The claim needs each principle in its author's own words and the reason the author gave, so that a later page can name a parallel without overstating it.

## Answer

Each principle holds because its author argued it from a cost: Knuth said speculative optimisation slows debugging and maintenance, and Jeffries and Fowler said an unneeded feature costs effort and makes later change harder [3][4][2]. Stevens, Myers and Constantine held that fewer and simpler connections between modules make each module easier to understand and change, and Cunningham called unrepaid shipped code a debt whose interest slows work [5][6]. The rule of three is Fowler's heuristic wording, not a measured result [1]. Lehman's laws state that a changing system degrades unless work is spent on it, but they are disputed: Godfrey and Tu found Linux growing super-linearly, against the laws' predicted slowdown, and a later literature review found only the laws of continuing change and growth confirmed by all studies [7][8][9]. The sources word these as guidelines and observations, not as proofs.

## Findings

1. Fowler's slide wording of the rule of three: "The first time you do something, you just do it. The second time you do something similar, you wince at the duplication, but you do the duplication thing anyway. The third time you do something similar, you refactor." The slide is headed "Three strikes and you refactor" [1]. Fowler's slides do not credit Don Roberts; the credit is in the 1999 book, which this research could not read (see Caveats).
2. Knuth wrote: "We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%" [2].
3. His reason is a cost: "Programmers waste enormous amounts of time thinking about, or worrying about, the speed of noncritical parts of their programs, and these attempts at efficiency actually have a strong negative impact when debugging and maintenance are considered." Critical code should be examined "only after that code has been identified" [2].
4. In the same paper Knuth also defends efficiency in the small, calling the conventional wisdom of ignoring it "an overreaction" to abuses, so the quotation is a rule about timing and measurement, not against optimisation [2].
5. Jeffries states YAGNI as: "Always implement things when you actually need them, never when you just foresee that you need them." His reasons are wasted effort, distraction from the real task, and "The best way to implement code quickly is to implement less of it" [3].
6. Fowler names four costs of a presumptive feature: build, delay, carry ("this complexity makes it harder to modify and debug that software") and repair [4].
7. Fowler scopes YAGNI: it "only applies to capabilities built into the software to support a presumptive feature" and "does not apply to effort to make the software easier to modify". It is "only a viable strategy if the code is easy to change", so it depends on refactoring [4].
8. On coupling, Stevens, Myers and Constantine report that Constantine "has observed that programs that were the easiest to implement and change were those composed of simple, independent modules", because problem solving is faster when pieces can be considered separately [5].
9. They define the measure: "The fewer and simpler the connections between modules, the easier it is to understand each module without reference to other modules" and "Coupling is reduced when the relationships among elements not in the same module are minimized" [5].
10. On cohesion, they write: "Binding is the measure of the cohesiveness of a module", ranked on a scale from coincidental to functional binding, where "Functional binding is the strongest type of binding" [5].
11. Cunningham's debt metaphor: "Shipping first time code is like going into debt. A little debt speeds development so long as it is paid back promptly with a rewrite." "Every minute spent on not-quite-right code counts as interest on that debt." "The danger occurs when the debt is not repaid" [6].
12. He names the failure mode as "the failure to consolidate", and warns that entire engineering organisations "can be brought to a stand-still under the debt load of an unconsolidated implementation" [6].
13. Lehman's first two laws, in the authors' table dated 1974: "E-type systems must be continually adapted else they become progressively less satisfactory" and "As an E-type system evolves its complexity increases unless work is done to maintain or reduce it" [7].
14. The authors say the laws came from observed behaviour of evolving systems, starting with OS/360, and treat them as external constraints from the organisational environment, not only from software technology [7].
15. Godfrey and Tu studied Linux kernel growth over its first six years and report: "we had expected to find that Linux was growing more slowly as it got bigger and more complex. Instead, we have found that Linux has been growing at a super-linear rate for several years." They write that the super-linear growth of development releases "contradicts Lehman and Turski's inverse square growth rate hypothesis" [8].
16. Herraiz and co-authors reviewed the literature on the laws and report that "controversial studies about the validity of the laws of software evolution are common". Across the studies they review, Law I (continuing change) and Law VI (continuing growth) are validated by all, while Laws II, IV and V are invalidated in most cases; these three relate to growth, and projects whose growth accelerates do not fulfil them [9]. They note that Godfrey and Tu's Linux result was read by some as an anomaly and that discrepancies may stem from different size metrics and from the laws' lack of formalisation [9].

## Caveats

The rule of three is not a measured result. It is a heuristic, and its stated rationale in this research is only Fowler's own wording; the claim that it prevents choosing a wrong abstraction comes from secondary commentary and is an inference here. The credit to Don Roberts rests on the 1999 book, which was not read; Finding 1 uses Fowler's earlier slides.

Beck's Extreme Programming Explained (1999 to 2000) was not read; YAGNI is sourced to Jeffries and Fowler. Lehman's 1980 paper and the 1996 "Laws of software evolution revisited" were not read; Finding 13 uses a later paper by Lehman and co-authors that restates the laws, and the wording of Law I and II there is the 1990s form. Cunningham later said the metaphor was not about writing poor code; that clarification was not retrievable and is not claimed.

Knuth's quotation is often misread as discouraging optimisation, and Knuth himself attributed the phrase to Hoare, which Hoare disputed (secondary report, not verified). Lehman's laws were derived from a few large systems (Finding 14) and are disputed (Findings 15 and 16). Godfrey and Tu's result covers one system and was later read partly as a metric artefact; the review's summary is secondary to the original studies, which were not each read. The software parallel to AI skills is the caller's inference, not a claim any of these sources makes.

[1]: <https://pdfs.semanticscholar.org/2f09/a866bc7cb521227dc5ab2c4092096077c1ac.pdf> "Fowler, Refactoring: Improving the Design of Existing Code (1997 slides)"
[2]: <https://dl.acm.org/doi/10.1145/356635.356640> "Knuth, Structured Programming with go to Statements"
[3]: <https://ronjeffries.com/xprog/articles/practices/pracnotneed/> "Jeffries, You're NOT gonna need it!"
[4]: <https://martinfowler.com/bliki/Yagni.html> "Fowler, Yagni"
[5]: <https://doi.org/10.1147/sj.132.0115> "Stevens, Myers and Constantine, Structured design"
[6]: <https://c2.com/doc/oopsla92.html> "Cunningham, The WyCash Portfolio Management System"
[7]: <https://users.ece.utexas.edu/~perry/work/papers/feast1.pdf> "Lehman, Ramil and Wernick, Metrics and Laws of Software Evolution: The Nineties View"
[8]: <https://plg2.cs.uwaterloo.ca/~migod/papers/2000/icsm00.pdf> "Godfrey and Tu, Evolution in Open Source Software: A Case Study"
[9]: <https://doi.org/10.1145/2543581.2543595> "Herraiz, Rodriguez, Robles and Gonzalez-Barahona, The evolution of the laws of software evolution: a discussion based on a systematic literature review"
