---
type: research
title: 'Why does checking a result against its specification (verification) not
  show whether it serves the goal (validation), after Boehm?'
description: 'Verification compares a product only with its specification, so a
  product can pass every check and still be the wrong one; validation tests it
  against the operational need.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T12:00:10Z
stale_after: 2027-11-14T00:00:00Z
sources:
  - id: 1
    resource: https://mferchaves.wordpress.com/wp-content/uploads/2014/08/articulo_4.pdf
    title: 'Boehm, Guidelines for Verifying and Validating Software Requirements and
      Design Specifications (Euro IFIP 79)'
  - id: 2
    resource: https://doi.org/10.1109/MS.1984.233702
    title: 'Boehm, Verifying and Validating Software Requirements and Design
      Specifications'
  - id: 3
    resource: https://www.nasa.gov/ivv-overview/
    title: 'NASA, IV&V Overview'
---

# Why does checking a result against its specification (verification) not show whether it serves the goal (validation), after Boehm?

## Context

Asked to support the claim that a result can satisfy every requirement written for it and still fail the purpose it was ordered for, so a second, separate check against the goal is needed. The question is about software engineering's two named checks, not about how an AI agent performs them.

## Answer

Boehm defines verification as establishing "the correspondence between a software product and its specification", and validation as establishing "the fitness or worth of a software product for its operational mission" [1]. Verification therefore has the specification as its only reference, so it cannot reveal that the specification itself is wrong or incomplete; validation tests the product against the operational need and so can, and then the specification changes [1]. Boehm's informal questions are "Am I building the product right?" and "Am I building the right product?" [1]. NASA states the same pair as "Are we building the product right?" and "Are we building the right product?" [3].

## Findings

1. Boehm defines verification as "to establish the truth of the correspondence between a software product and its specification" and validation as "to establish the fitness or worth of a software product for its operational mission" [1].
2. Boehm gives the informal versions as questions: verification, "Am I building the product right?", and validation, "Am I building the right product?" [1].
3. Boehm names the requirements baseline, the customer-accepted requirements specification, as the artifact that separates the two: verification compares the baseline with the product design, detailed design, code, database and documentation descending from it, and leads only to changes in those refinements, never in the baseline [1].
4. Validation, in Boehm's account, identifies problems that must be resolved by changing the requirements specification itself. His example is a simulation of the product design that shows the performance requirements are too stringent for any cost-effective design: the design failing the requirements is a verification result, the requirements needing change is a validation result [1].
5. Boehm's 1984 IEEE Software paper treats V&V of requirements and design specifications, with the objective of identifying and resolving problems and high-risk issues early in the life cycle [2].
6. NASA's own definitions use "Are we building the product right?" for verification, which checks that the products of each life-cycle phase satisfy the established requirements for that phase, and "Are we building the right product?" for validation, which evaluates the products to ensure they meet the mission's and the customer's needs [3].

## Caveats

- Wording differs by source: Boehm's questions say "Am I" [1]; NASA says "Are we" [3]. Quote each as its own source has it.
- Only the 1979 conference paper [1] was read in full, in a copy hosted on a third-party site. Of the 1984 IEEE Software paper [2], which is paywalled, only the abstract was read, so this file does not claim its wording.
- The sources define the checks and give an example; none counts how often a verified product fails validation. That a product can pass verification and fail validation whenever the specification misses the goal follows from the definitions.
- NASA's definitions [3] describe software life-cycle practice; applying them to work handed to an AI agent is an inference.

[1]: <https://mferchaves.wordpress.com/wp-content/uploads/2014/08/articulo_4.pdf> "Boehm, Guidelines for Verifying and Validating Software Requirements and Design Specifications (Euro IFIP 79)"
[2]: <https://doi.org/10.1109/MS.1984.233702> "Boehm, Verifying and Validating Software Requirements and Design Specifications"
[3]: <https://www.nasa.gov/ivv-overview/> "NASA, IV&V Overview"
