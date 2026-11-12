---
type: research
title: 'Why does requirements engineering decide the outcome more than execution
  does?'
description: 'Brooks calls deciding what to build the hardest and
  costliest-to-fix part, and aerospace incident data traces 40% of failures to
  absent code and requirements, though the evidence is thin.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-11T13:17:06Z
stale_after: 2027-11-11T00:00:00Z
sources:
  - id: 1
    resource: https://www.cgl.ucsf.edu/Outreach/pc204/NoSilverBullet.html
    title: 'Brooks, No Silver Bullet: Essence and Accidents of Software Engineering'
  - id: 2
    resource: https://ntrs.nasa.gov/api/citations/20230012909/downloads/Historical%20Aerospace%20Software%20Errors.pdf
    title: 'Prokop, Historical Aerospace Software Errors Categorized to Influence
      Fault Tolerance'
  - id: 3
    resource: https://arxiv.org/abs/1702.07656
    title: 'Mund, Femmer, Méndez Fernández, Eckhardt, Does Quality of Requirements
      Specifications matter? Combined Results of Two Empirical Studies'
  - id: 4
    resource: docs/llm-wiki/research/SWE/SWE-0002__unclear-requirements-cause-rework/research.md
    title: 'Why do unclear requirements lead to rework and failed projects? (earlier
      research file)'
---

# Why does requirements engineering decide the outcome more than execution does?

## Context

Asked to support the claim that a result is decided by how well the intent was defined before building, and less by how well it was built. The question compares defining (requirements) with building (execution) in software projects. The earlier file [4] shows that unclear requirements cost rework; it does not compare them with execution, which this file adds.

## Answer

Requirements engineering decides the outcome more than execution because the conceptual work of deciding what to build is the hard part of software, while representing it in code is the easier part. An error in the concept cripples the result and is the hardest to rectify later, whereas an error in expression is minor by comparison [1]. Data on 55 aerospace software incidents agrees in direction: only 16% were errors of traditional programming, and 40% came from absent code, meaning unanticipated situations and missing requirements [2]. The evidence is thin, though: the strongest statement is an expert argument [1], the incident study is small and partly subjective [2], and how much specification quality matters depends on context [3]. The cost side, rework and its disputed numbers, is in [4].

## Findings

1. Brooks holds the hard part of building software to be the specification, design and testing of the conceptual construct, not the labor of representing it and testing the fidelity of the representation [1].
2. Brooks states that syntax errors are "fuzz" compared with the conceptual errors in most systems [1].
3. Brooks calls deciding precisely what to build the hardest single part of building a software system, and says no other part so cripples the resulting system if done wrong, and none is more difficult to rectify later [1].
4. Brooks argues clients do not know what they want and cannot specify requirements completely, precisely and correctly before they have tried versions of the product, so extracting and refining requirements iteratively is the most important thing builders do for clients [1].
5. In a categorisation of 55 historic aerospace software incidents from 1962 to 2023, 85% produced wrong output rather than stopping, and only 16% were considered errors of traditional computer science or programming; none came from the programming language, compiler, tools or operating system [2].
6. In the same study 40% of incidents were attributed to the absence of code, covering missing requirements, incomplete modelling of the real world and unexpected inputs, and 16% were judged unknown-unknowns [2].
7. The author notes that missing code could be equated with missing requirements, which would attribute 40% of these errors to the requirements phase, but argues requirements are in practice less detailed than could have been written in advance, so some of these errors are better found by testing as flown. She also warns that testing code only against requirements cannot expose code that is not there [2].
8. A survey and a controlled experiment on requirements specifications found that how much specification quality matters depends on project characteristics and on what counts as a defect; defects of pragmatic quality seemed less relevant than initially thought [3].
9. Practitioners in 228 companies named incomplete or hidden requirements their most cited requirements problem (48%), and avoidable rework is estimated at 40 to 50 percent of project effort, though the 100x late-fix cost rule and the CHAOS failure rates are disputed [4].

## Caveats

- Finding 1 to 4 are one author's argument from experience, not a measurement; "decides more than execution" is not quantified anywhere in these sources. It is a widely shared position, not a tested one.
- The incident study [2] covers aerospace flight software, a 55-incident sample, and its categories were assigned in hindsight and partly subjectively. The 40% mixes missing requirements with missing handling of unanticipated situations, so it is not a requirements-only share, and the author herself doubts that more requirements would have averted many of these errors [2].
- [3] is counter-evidence to a blanket claim: specification quality does not matter equally everywhere, and some defect classes mattered little.
- Brooks wrote in 1986 about human-built software. That the same holds when an AI does the building is an inference, not shown by these sources; the neighbouring finding in [4] is also about human projects.
- No source here compares requirements and execution on the same projects' outcomes. A study doing that was not found among the sources that could be read in full.

[1]: <https://www.cgl.ucsf.edu/Outreach/pc204/NoSilverBullet.html> "Brooks, No Silver Bullet: Essence and Accidents of Software Engineering"
[2]: <https://ntrs.nasa.gov/api/citations/20230012909/downloads/Historical%20Aerospace%20Software%20Errors.pdf> "Prokop, Historical Aerospace Software Errors Categorized to Influence Fault Tolerance"
[3]: <https://arxiv.org/abs/1702.07656> "Mund, Femmer, Méndez Fernández, Eckhardt, Does Quality of Requirements Specifications matter? Combined Results of Two Empirical Studies"
[4]: <docs/llm-wiki/research/SWE/SWE-0002__unclear-requirements-cause-rework/research.md> "Why do unclear requirements lead to rework and failed projects? (earlier research file)"
