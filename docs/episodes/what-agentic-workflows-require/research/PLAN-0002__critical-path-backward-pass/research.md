---
type: research
title: 'Why is planning back from the goal a well-known project-management
  principle, as in the backward pass of the Critical Path Method?'
description: 'The Critical Path Method computes each job''s latest start and
  finish by running the project backward from a fixed completion time, and work
  breakdown practice subdivides from the end product.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T14:40:27Z
stale_after: 2027-11-14T00:00:00Z
sources:
  - id: 1
    resource: https://mosaicprojects.com.au/PDF/PM-History_Critical_Path_Planning_&_Scheduling_Kelley_and_Walker_1959.pdf
    title: 'Kelley and Walker, Critical-Path Planning and Scheduling (Proceedings of
      the Eastern Joint Computer Conference, 1959)'
  - id: 2
    resource: https://www.nasa.gov/wp-content/uploads/2025/06/nasa-wbs-handbook.pdf
    title: 'Sadler, NASA Work Breakdown Structure (WBS) Handbook
      (NASA/SP-20250006071)'
---

# Why is planning back from the goal a well-known project-management principle, as in the backward pass of the Critical Path Method?

## Context

Asked to support the claim that planning from the goal backward is established project-management practice, not a new idea for agents. The claim rests on two long-standing techniques: Critical Path scheduling, which fixes a completion time and works backward from it, and work breakdown structures, which start from the end product and subdivide it. This file extends the general account of backward reasoning in `research/PLAN-0001__backward-reasoning-from-the-goal/research.md`.

## Answer

The Critical Path Method (Kelley and Walker, 1959) computes each job's earliest times by working forward from the start, then its latest start and completion times by working backward from a fixed project completion time. The gap between the two is each job's float, and jobs with none form the critical path. Work breakdown practice applies the same direction to scope: it begins with the end product and successively subdivides it into the work that produces it. Scheduling and scoping in project management both start at the goal, which supports calling it a well-known principle. The term "backward pass" itself is later textbook vocabulary, not Kelley and Walker's wording.

## Findings

1. Kelley and Walker presented the method to coordinate "many diverse activities toward a common goal", and named it "the Critical-Path Method" because of "the central position that critical activities in a project play in the method" [1].
2. They built the project diagram by asking, for each job, "What immediately precedes this job?", "What immediately follows this job?" and "What can be concurrent with this job?", and by "continually back-checking" so that "the chance of making omissions is small" [1].
3. From estimated durations they computed "the earliest and latest start and completion times for each job in a project", which gives "rigorous limits to guide operating personnel" and "the basis for a system of management by exception" [1].
4. Earliest event times are computed inductively from a start at relative time 0. "Similarly, we may compute the latest time at which each event in the project may occur relative to a fixed project completion time", with the completion time denoted A [1].
5. From the two sets of event times they derive, per job, the earliest and latest start and completion times and the "maximum time available". A job whose maximum time available equals its duration is "critical": a delay in it "will cause a comparable delay in the project completion time". A contiguous path of critical jobs "through the project diagram from origin to terminus" is "a critical-path" [1].
6. A job whose maximum time available exceeds its duration is a "floater", and the paper defines total, free, independent and interfering float for it [1].
7. In the discussion of non-deterministic schedules the authors describe the latest times as "running the project backward from some fixed or random completion time", and the discussion calls them times "computed by running the project backward from some fixed completion time" [1].
8. The NASA Work Breakdown Structure Handbook says "A WBS is developed by first identifying the system or project end item to be structured, and then successively subdividing it into increasingly detailed and manageable subsidiary work products or elements" [2].
9. In the handbook each subsidiary work product "has its own set of goals and objectives which must be met in order for the project objectives to be met", and the detailed tasks are identified from those [2].
10. The handbook requires "a clear understanding of the project's objectives and the end item(s) or end product(s) of the work to be performed" to develop and maintain a WBS, and calls it "a product-oriented structure, not an organizational structure" [2].
11. Its construction guidance is to "begin at the top level with the desired end product that is completely integrated" and continue until the product structure is complete [2].
12. The handbook states the purpose of the decomposition: by "breaking the total product into successively smaller entities, management can more readily verify that all work identified by the WBS and budgeted for ... actually contributes to the project objectives" [2].

## Caveats

Neither source uses "backward pass" for the latest-time computation; Kelley and Walker say "running the project backward from some fixed completion time" [1]. "Backward pass" and "forward pass" as paired names are later textbook usage that this file did not source.

Finding 7 is stated in the paper's discussion of the non-deterministic case, and the second quote comes from the discussion of PERT, not CPM. The deterministic computation is equation (2) [1]. The scanned copy has OCR errors, and the quotes were read from its text layer; the paper is also in the ACM Digital Library as doi 10.1145/1460299.1460318.

The PMBOK Guide and the PMI Practice Standard for Work Breakdown Structures are paywalled and were not read. The work breakdown evidence is NASA's handbook, a government standard for its own projects, so it shows that decomposition from the end product is standard practice there; that PMI's standard says the same (its definition of a WBS as a "deliverable-oriented hierarchical decomposition") was seen only in search summaries and is not cited here. A reader who needs the PMI wording should read the standard.

CPM's backward computation answers when each job must happen given a fixed end date. It takes the jobs and their dependencies as given, from the diagram built by asking what precedes each job. The sources do not show that CPM discovers missing tasks, and the work breakdown evidence shows decomposition checks that all work serves the objective [2]. Applying these to a team's recurring process, or to agents, is an inference.

[1]: <https://mosaicprojects.com.au/PDF/PM-History_Critical_Path_Planning_&_Scheduling_Kelley_and_Walker_1959.pdf> "Kelley and Walker, Critical-Path Planning and Scheduling (Proceedings of the Eastern Joint Computer Conference, 1959)"
[2]: <https://www.nasa.gov/wp-content/uploads/2025/06/nasa-wbs-handbook.pdf> "Sadler, NASA Work Breakdown Structure (WBS) Handbook (NASA/SP-20250006071)"
