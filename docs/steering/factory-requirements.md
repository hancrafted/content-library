---
type: product-steering
title: Factory requirements
generated:
  by: claude-code/opus-5.5
  at: 2026-11-01T21:00:00+01:00
stale_after: 2026-11-15T21:00:00+01:00
---

# Factory requirements

> **What belongs here.** One user story per line: "As a **role**, I can **capability**, so that **outcome**", grouped by horizon of `factory-vision.md`, each with a stable id `FAC-<horizon>.<n>`. A spec cites the ids it refines (`Refines FAC-1.2`); an id is retired with its line, never reused. No mechanisms, tools, file formats or acceptance criteria. Test for every line: could two very different solutions both meet it? If not, it is a design decision and belongs in an ADR or a ticket. Acceptance criteria live in the specs that refine these lines.

## Roles

- **Operator:** runs Pipelines, decides at Gates, gives feedback.
- **Process engineer:** defines Pipelines and Jobs, and improves them with evidence.
- **Maintainer:** builds and evolves the Factory itself.

Han holds all three today. A solopreneur in Horizon 3 holds Operator and Process engineer.

## Horizon 1: until 16 Jan 2027

Episodes first; the Factory is a pre-alpha. A Run here is a Run of today's Episode pipeline: the evidence is collected before the Factory that will use it exists. Trusted evidence starts with the first Run after these lines are met; earlier Runs are not brought up to it, yet still count: each Brief and its accepted result are a pair to compare against, and their records show what was missing. Must-haves for the Episode-first weeks: FAC-1.1 to FAC-1.4. The rest may slip into January.

- **FAC-1.1** As a Process engineer, I can compare any two Runs and see what differed in their setup, so that a difference in results can be traced to its cause.
- **FAC-1.2** As a Process engineer, I can see the time and tokens of every Run and Job, so that cost and speed are known, not guessed.
- **FAC-1.3** As an Operator, I can give feedback anywhere in a Run and find it kept with where it came from, so that quality is judged from evidence, not memory.
- **FAC-1.4** As a Process engineer, I can find every artifact of a finished Run in one place, so that any Run can be revisited and its first input reused for evals.
- **FAC-1.5** As a Process engineer, I can browse past Runs and let agents retrieve from them, so that earlier work is reused.
- **FAC-1.6** As an Operator, I can open any artifact a Run produced, long after, as it looked then, so that the record stays trustworthy.
- **FAC-1.7** As a Process engineer, I can see when a Run skipped an expected step or could not be traced, and why, so that gaps never silently corrupt the evidence.

### Questions the evidence must answer

1. How long and how many tokens does a Run take, per Job?
2. How many Spec rounds until every Slide has a pick, and is that going down?
3. How often is the first-round pick the recommended Option, or any Option?
4. Which Slides changed after Build, and why?
5. Does a cheaper model need more rounds or fixes than a stronger one?
6. Do Speaker note sources support each Slide's claim? _Needs a judge: Horizon 2._

## Horizon 2: 16 Jan 2027 until Horizon 3

Factory first.

- **FAC-2.1** As an Operator, I can run the whole Episode Pipeline in the Factory, so that Episodes are produced by the new machinery.
- **FAC-2.2** As an Operator, I can run several Runs at once without them interfering, so that my output is not capped at one Run at a time.
- **FAC-2.3** As an Operator, I can let any agent harness do a Job, so that I am not locked to one vendor.
- **FAC-2.4** As an Operator, I can decide at the points that matter, inside the Pipeline, so that human judgment is part of the flow, not a workaround.
- **FAC-2.5** As a Process engineer, I can take Jobs out of a Pipeline one at a time without rewriting the rest, so that improvement is gradual and safe.
- **FAC-2.6** As a Process engineer, I can see a Score for every Job I took out, and which version of its judge gave it, advisory until validated against real outcomes, so that I know where quality stands.
- **FAC-2.7** As a Process engineer, I can rerun a Job on frozen inputs and compare it with its baseline, so that every change shows whether it helped.
- **FAC-2.8** As a Process engineer, I can follow every Run Job by Job, whatever harness did the work, so that tracing does not depend on the vendor.
- **FAC-2.9** As a Process engineer, I can declare a Pipeline in one structured definition, so that it can be read, versioned and later rendered.
- **FAC-2.10** As a Maintainer, I can change how the Factory keeps its state without changing Jobs or Pipelines, so that it can grow into Horizon 3.
- **FAC-2.11** As a Process engineer, I can set up a second Pipeline from the same kinds of Jobs, so that the Factory proves it is not Episode-specific.
- **FAC-2.12** As an Operator, I can resume a failed or interrupted Run from the last Job that succeeded, so that a late failure does not cost the whole Run.
- **FAC-2.13** As a Process engineer, I can rerun any Job without it changing anything outside the Factory, on exactly the outside data it read the first time, so that experiments are safe and comparable.

## Horizon 3: end of 2027 into 2028

Directional: these keep doors open; they are not a plan.

- **FAC-3.1** As a Process engineer without an engineering background, I can define Pipelines and Jobs and run evals through a visual interface, with reasonable effort, so that I improve my own work without help.
- **FAC-3.2** As a Process engineer, I can see improvement three ways (metrics, my own judgment of quality, and less effort per review), so that I trust the change.
- **FAC-3.3** As an Operator, I can run the Factory on my own machine with the AI subscription I already have, so that I keep control and cost.
- **FAC-3.4** As an Operator, I can have Pipelines start from events and schedules and wait days for replies, so that ongoing business work runs on its own.
- **FAC-3.5** As an Operator, I can trust that my business and personal data stays private, so that I can use the Factory for client work.
- **FAC-3.6** As an Operator, I can act on any of my devices, e.g. decide at a Gate from my phone, so that work does not wait for my desk.
