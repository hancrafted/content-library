---
type: product-steering
title: Factory vision
generated:
  by: claude-code/opus-5.5
  at: 2026-11-01T21:00:00+01:00
stale_after: 2026-11-15T21:00:00+01:00
---

# Factory vision

> **What belongs here.** The problem, the north star, users, horizons with their success measures, principles, trade-off rules and non-goals. No named technology, tool, file format, folder or data structure. Test for every line: would it still be true if the Factory were rebuilt on another stack? If not, it belongs in a spec, an ADR or a ticket. What each role can do lives in `factory-requirements.md`.

## North star

Enable one person to reach 5 to 10 times their output, by making it easy to define, monitor and improve their Pipelines.

The unit of "output" is defined once Horizon 1 has produced evidence.

## Problem

A one-person business runs many digital tasks: content, marketing, leads, invoices, software. Agents can do much of this work, but the person cannot see what made a result good, results vary from Run to Run, and reviewing agent work eats the time it was meant to save. Without evidence, improving a Pipeline is guesswork.

## What the Factory is

The Factory turns any digital task into a measurable Pipeline of Jobs, from knowledge work to software engineering. Episodes are the first product it makes: the content library's steering (`product-vision.md`) decides what an Episode must be; this file decides how the Factory makes it.

## Users

- **Han first.** He builds the Factory, runs it to produce Episodes, and is its first solopreneur.
- **Solopreneurs and freelancers (Horizon 3).** The "one-person army": people who run their business alone and want their digital work done reliably, without engineering it themselves.

## Horizons

**Horizon 1: until the masterclass on 16 Jan 2027.** Episodes first.

- Contracted events drive the work: workshops on 16 and 18 Nov, the masterclass on 16 Jan.
- From 18 Nov, Factory work runs alongside Episode work; Episodes keep priority.
- The Factory is a pre-alpha for learning, not a beta.
- Problem today: Han cannot tell whether skills and context help; a Run takes about two hours; the Spec needs two to four feedback rounds; results are about 60–70% satisfactory, judged by gut.
- Success: every Episode Run made with today's pipeline leaves trusted evidence, shaped by the questions we will ask of it, so it is usable data once the Factory exists.

**Horizon 2: 16 Jan 2027 until Horizon 3.** Factory first.

- Success by end of Q1 at the latest: the first usable Factory produces Episodes, several at once.
- Success in Q2: a second Pipeline runs on it (e.g. video post-production).
- It has to work, not be perfect. A rewrite or a fresh start stays allowed.

**Horizon 3: end of 2027 into 2028.** A tool for solopreneurs.

- It runs their Pipelines on their own machine, with the AI subscription they already have.
- Success: Han works at 5 to 10 times his output with the Factory, and the first solopreneurs build and improve their own Pipelines without help.
- 2026 and 2027 Episodes and workshops build the audience it is for.

## Trade-off ranking

When goals conflict, the higher one wins.

- **Horizon 1:** Episode work comes before Factory work. Within Factory work, Factory quality comes before Han's time in the loop.
- **Horizon 2 onward:** contracted Events come before Factory work, and Factory work before other Episode work. Within Factory work, Factory quality comes first. Each Event is also a chance to dogfood the Factory: its Episodes are made with the Factory wherever it can already make them.

The Horizon 1 order is about time, never a licence for shortcuts: Factory work still follows the content library's rule _Architecture beats delivery_. Episode quality is what customers see. Factory quality means an architecture that grows, stays maintainable, and is traceable and measurable.

## Principles across all horizons

1. **Local-first.** The Factory runs and keeps its data on the user's machine, in open formats.
2. **Model-agnostic.** Bring your own AI subscription; every Run records which model did the work.
3. **Structured for rendering.** Everything the Factory produces is structured, so a later app layer can render it for non-engineers.
4. **Traceable.** Every result can be followed back to its inputs and decisions.
5. **Measurable.** Every Job can be scored; every change can be tested against a baseline. Evals and tracing are first-class, but not the product.
6. **Every Run has many outputs.** The deliverable is the main one; every input and byproduct is worth keeping. The first human input is the most valuable: frozen, it is the input for every future eval. For Episodes, that is the Brief.
7. **Private.** Personal and business data stays private and under the user's control.
8. **Effects are their own Jobs.** A Job either changes something outside the Factory or works entirely inside it, never both. What a Job reads from outside is kept, so it can be replayed. Every Job that works inside can therefore be checked and repeated safely.
9. **Cloud-ready when it costs nothing.** When two options cost the same, choose the one that makes a later move to the cloud easier.

**Guard:** generality comes from the Job contract, never from domain-specific features in the Factory.

## Non-goals

- Not enterprise, not B2B, not a scale-first SaaS.
- Not a replacement for the human's judgment at the points that matter.
- Organizations stay an Audience of the content library, never of the Factory.
