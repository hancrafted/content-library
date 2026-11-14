---
type: research
title: 'Why does the factory metaphor fit AI-driven software production, and where does it break?'
description: 'It fits as a flow of Jobs with stop-on-defect gates, mistake-proofing and standard work; it breaks where software differs: building is free copying, parts need no order, and Workers vary.'
generated:
  by: copilot-cli/claude-opus-5
  at: 2026-10-30T23:59:00+01:00
stale_after: 2027-04-30T00:00:00+02:00
sources:
  - id: 1
    resource: docs/llm-wiki/research/LLM/LLM-0018__ai-layers-model-to-factory/research.md
    title: 'Content library, Why are a model, prompting, an agent, a workflow and a factory distinct layers of working with AI?'
  - id: 2
    resource: https://global.toyota/en/company/vision-and-philosophy/production-system/
    title: 'Toyota Motor Corporation, Toyota Production System'
  - id: 3
    resource: https://www.lean.org/lexicon-terms/andon/
    title: 'Lean Enterprise Institute, Lean Lexicon: Andon'
  - id: 4
    resource: https://www.lean.org/lexicon-terms/poka-yoke/
    title: 'Lean Enterprise Institute, Lean Lexicon: Poka-yoke'
  - id: 5
    resource: https://www.lean.org/lexicon-terms/standardized-work/
    title: 'Lean Enterprise Institute, Lean Lexicon: Standardized work'
  - id: 6
    resource: https://www.lean.org/lexicon-terms/takt-time/
    title: 'Lean Enterprise Institute, Lean Lexicon: Takt time'
  - id: 7
    resource: https://www.lean.org/lexicon-terms/cell/
    title: 'Lean Enterprise Institute, Lean Lexicon: Cell'
  - id: 8
    resource: http://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF
    title: 'Naur and Randell (eds.), Software Engineering: Report on a conference sponsored by the NATO Science Committee, Garmisch 1968'
  - id: 9
    resource: https://www.developerdotstar.com/mag/articles/reeves_design.html
    title: 'Reeves, What Is Software Design? (C++ Journal, 1992)'
  - id: 10
    resource: https://prl.khoury.northeastern.edu/img/p-tr-1971.pdf
    title: 'Parnas, On the Criteria To Be Used in Decomposing Systems into Modules (CMU technical report, 1971)'
  - id: 11
    resource: http://hdl.handle.net/1721.1/47992
    title: 'Cusumano, Factory Concepts and Practices in Software Development: An Historical Overview (MIT Sloan working paper 3095-89)'
  - id: 12
    resource: https://www.anthropic.com/engineering/building-effective-agents
    title: 'Anthropic, Building effective agents'
  - id: 13
    resource: https://factory.strongdm.ai/
    title: 'StrongDM, The Software Factory'
  - id: 14
    resource: https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/
    title: 'Shapiro, The Five Levels: from Spicy Autocomplete to the Dark Factory'
  - id: 15
    resource: https://developers.openai.com/api/docs/guides/prompt-engineering
    title: 'OpenAI, Prompt engineering guide'
---

# Why does the factory metaphor fit AI-driven software production, and where does it break?

## Context

Asked to decide which ideas from a physical factory carry over to a system that runs pipelines of Jobs, each done by a Worker (a script, an agent with a fixed profile, or a person) at a Station, with evals and tracing built in. It probes workstation against workbench and work cell, inspection and quality gates, stop-on-defect (jidoka, andon), mistake-proofing (poka-yoke), takt and flow, standard work, the 2026 "software factory" and "dark factory" labels, and the industrial-era software factories. It extends [1], which found "factory" to be a 2026 practitioner label with no settled definition, and does not repeat its dating of that label.

## Answer

The metaphor fits the quality machinery of a factory, not its production economics. What transfers: build quality into each step by detecting an abnormality and stopping before a defect passes on (jidoka, andon); prefer checks that make a wrong input impossible over checks that only warn (poka-yoke); write each Job's sequence, inputs and expected output down as the baseline that improvement changes (standard work); and keep the human as the one who improves the process, not the one who watches the machine. Agent practice says the same in its own words: gates on intermediate steps, ground truth from the environment, checkpoints for human feedback and stopping conditions.

What breaks: a factory exists to replicate one design many times, but replicating software is nearly free, so every Job is a design act, and the industrial history shows factory methods held only for families of similar projects. Physical assembly has a forced order; software modules hidden behind agreed interfaces can be built in parallel and in any order, which is why the windows can come before the building: a pipeline is a graph joined by contracts, not a conveyor. Takt, the beat that matches output to customer demand for identical units, has no counterpart when no two units are alike; flow and stopping at a fixed point carry over, the beat does not. Standard work assumes a worker who repeats a sequence with low variation; a model Worker is non-deterministic, so variation has to be measured by repeated trials and evals instead of assumed away. A check the Worker can rewrite is not mistake-proofing: the grading has to sit outside the Worker's reach. The "dark factory" label borrows the one feature, no humans, that Toyota's own pillar rejects for improvement work.

On the word for the place: a workstation in a line is a fixed position the work moves past; a work cell groups adjacent steps so a few operators can run them in near-continuous flow; a workbench is the craft image, a skilled worker choosing tools for one-off work. A harness that runs one kind of Job with fixed tools is closest to a workstation; an inspector Worker with a free choice of tools is closer to a workbench, which is the job-shop mode the industrial software factories tried to leave.

## Findings

1. Toyota names two pillars of its production system: jidoka, "stopping immediately when abnormalities are detected to prevent defective products from being produced", and Just-in-Time, synchronised processes "making only what is needed, when it is needed, and in the amount needed" [2].
2. In jidoka the machine stops itself or "the operator can stop the line by pulling the stop cord", which "eliminates the outflow of defective products" and means "machines and equipment no longer need to be watched over". Toyota adds that work must first be done "thoroughly by hand" before it is automated, and that machines "can't evolve any further on their own. Only humans can implement kaizen" [2].
3. An andon lights when "a machine sensor detects a problem" or "an operator pulls a cord". In Toyota's fixed-position stop the line halts not at once but at "the end of each workstation", so other stations are not disturbed while "defects never passed on" [3].
4. Poka-yoke aims "to achieve 100% quality by finding defects at their source". It comes in two kinds: shutdown, the most powerful ("a machine will not start if a work piece is set incorrectly"), and warning ("a buzzer or light"); sampling inspection "guarantees defects" [4].
5. Standardized work fixes three elements, takt time, "the precise work sequence" and the standard inventory; its benefits include "reductions in variability" and "a baseline for improvement activities", and it is "the object of continuous improvement through kaizen" [5].
6. Takt time is "the available production time divided by customer demand", whose purpose is "to precisely match production with demand". It began in 1930s German aircraft building as "the interval at which aircraft were moved ahead to the next production station" [6].
7. A cell places processing steps "immediately adjacent to each other" for "very nearly continuous flow", and its operator count changes with demand; "many companies use the terms cell and line interchangeably" [7].
8. The 1968 NATO conference report records Bemer's proposal of a "machine-controlled production environment, or software factory", inside which "it should be impossible to produce programs exterior to this environment" [8].
9. In the same report McIlroy argues that "mass production, in the sense of limitless replication of a prototype, is trivial for software", but that subassemblies carry over directly, "interchangeable parts corresponds roughly to our term 'modularity'", and machine tools have an analogue in "assembly programs and compilers" [8].
10. Reeves (1992) argues that source code is the design and "actually building software is done by compilers and linkers", so "software is cheap to build ... so cheap it is almost free" [9].
11. Parnas lists the first expected benefit of modular programming as managerial: "development time could be shortened because separate groups would work on each module with little need for communication", and shows that whether this holds "is dependent upon the criteria used in dividing the system into modules" [10].
12. Cusumano (1989) dates the first use of "factory" (kojo) for a real software facility to Hitachi's Software Works in 1969, set up to turn software from an unstructured "service" into a "product" with guaranteed cost and quality [11].
13. Cusumano finds that firms adopting factory practice reused components, standardised methods and tools, deskilled operations, and managed development "across a series of similar projects". He cites Abernathy and Utterback that such processes became possible only once product change slowed, so "not all products or development processes are suitable" [11].
14. SDC's US Software Factory (1976 to 1978) ended after an unfamiliar application, a police dispatch system, let "the requirements [keep] on expanding"; SDC "reverted to its former job-shop structure", and its project managers "disliked separating system design from programming". Hitachi, Toshiba, NEC and Fujitsu kept their factories long after, though Toshiba "had to tolerate variations in practices" between departments [11].
15. Anthropic advises adding "programmatic checks ('gate') on any intermediate steps", having agents gain "ground truth" from the environment at each step, letting them "pause for human feedback at checkpoints or when encountering blockers", adding "stopping conditions (such as a maximum number of iterations)", and testing "in sandboxed environments", because autonomy brings "the potential for compounding errors" [12].
16. StrongDM's Software Factory is "non-interactive development where specs + scenarios drive agents", with the rules that code is neither written nor reviewed by humans. It found that "tests can be reward hacked" (an agent can "return true"), so it moved validation to scenarios "stored outside the codebase (similar to a 'holdout' set)", and replaced a green test suite with a probabilistic "satisfaction" score over observed trajectories [13].
17. Shapiro's Level 5 is "a black box that turns specs into software", named after the Fanuc dark factory, "a place where humans are neither needed nor welcome" [14].
18. OpenAI calls prompt engineering "a mix of art and science" because model output is non-deterministic, so instructions must be written to get the wanted result consistently [15].

## Caveats

Findings 2 to 7 come from Toyota and from the Lean Enterprise Institute's lexicon, a practitioner reference rather than Toyota itself; the definitions agree with Toyota's own page where both cover a term. Finding 10 is one engineer's essay, widely cited but an argument, not a measurement. Finding 11 was read from Parnas's 1971 technical report; the paper appeared in Communications of the ACM in December 1972. Findings 12 to 14 were read from Cusumano's MIT working paper (December 1989) through a machine OCR text; the related IEEE Software article of March 1989 was not read, and SDC's on-time claims in that paper are its managers' own. Findings 16 and 17 are first-party practitioner accounts, not studies, and describe one team and one author's levels. No source maps workstation, workbench or cell onto agent harnesses: the place-word mapping, the claim that takt does not transfer and the claim that a rewritable check is not a poka-yoke are this file's judgement from the findings. The "windows before the building" reading rests on Parnas and holds only when the interfaces are fixed first.

[1]: docs/llm-wiki/research/LLM/LLM-0018__ai-layers-model-to-factory/research.md 'Content library, Why are a model, prompting, an agent, a workflow and a factory distinct layers of working with AI?'
[2]: https://global.toyota/en/company/vision-and-philosophy/production-system/ 'Toyota Motor Corporation, Toyota Production System'
[3]: https://www.lean.org/lexicon-terms/andon/ 'Lean Enterprise Institute, Lean Lexicon: Andon'
[4]: https://www.lean.org/lexicon-terms/poka-yoke/ 'Lean Enterprise Institute, Lean Lexicon: Poka-yoke'
[5]: https://www.lean.org/lexicon-terms/standardized-work/ 'Lean Enterprise Institute, Lean Lexicon: Standardized work'
[6]: https://www.lean.org/lexicon-terms/takt-time/ 'Lean Enterprise Institute, Lean Lexicon: Takt time'
[7]: https://www.lean.org/lexicon-terms/cell/ 'Lean Enterprise Institute, Lean Lexicon: Cell'
[8]: http://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF 'Naur and Randell (eds.), Software Engineering: Report on a conference sponsored by the NATO Science Committee, Garmisch 1968'
[9]: https://www.developerdotstar.com/mag/articles/reeves_design.html 'Reeves, What Is Software Design? (C++ Journal, 1992)'
[10]: https://prl.khoury.northeastern.edu/img/p-tr-1971.pdf 'Parnas, On the Criteria To Be Used in Decomposing Systems into Modules (CMU technical report, 1971)'
[11]: http://hdl.handle.net/1721.1/47992 'Cusumano, Factory Concepts and Practices in Software Development: An Historical Overview (MIT Sloan working paper 3095-89)'
[12]: https://www.anthropic.com/engineering/building-effective-agents 'Anthropic, Building effective agents'
[13]: https://factory.strongdm.ai/ 'StrongDM, The Software Factory'
[14]: https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/ 'Shapiro, The Five Levels: from Spicy Autocomplete to the Dark Factory'
[15]: https://developers.openai.com/api/docs/guides/prompt-engineering 'OpenAI, Prompt engineering guide'
