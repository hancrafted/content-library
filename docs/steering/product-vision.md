---
type: product-vision
title: Product vision
status: draft
---

# Product vision

## North star

A visual knowledge library of reusable teaching units, backed by public research and produced by an agentic pipeline, that enables people and organizations to work with AI: it wins clients through workshops now and an audience through YouTube later.

The repo practises what it teaches: what agents build here is proof, and source material, for Episodes on AI enablement.

## Audiences

An Audience is a level of AI enablement, independent of locale.

- **Individual:** a person learning for themselves, reached through YouTube. Paid end: webinars and cohorts.
- **Organization:** a company enabling its people, reached through workshops, German businesses first. Paid end: consulting and engineering projects.

What each Audience can do, per horizon: `docs/steering/product-requirements.md`.

## Horizons

1. **Now to Jan 2027: workshops.** Events are Han's main client exposure. The site is a presenting surface with a booking call to action.
2. **2027: library, evidence and pipeline.** Polished YouTube Episodes and public playlists build an audience. Explorable explanations on their own URLs bring visitors back. A first paid webinar or cohort runs without a platform of our own. Concepts and Research questions are rendered publicly, so a viewer can see that what an Episode teaches rests on research. The content pipeline becomes a product, first local, then in the cloud.
3. **End of 2027: platform.** Login, booking, billing, webinars and progress tracking. The site moves from static pages to an application with a backend.

## Trade-off rules

When rules conflict, the higher one wins.

1. **Architecture beats delivery.** Software architecture, information architecture and UX take no shortcuts. A decision that needs a record gets its own session, even before a workshop. Each kind has its record and its check: Archgate ADRs for code, markdown-harness for documents, design-ADRs and `docs/design/design-guide.md` for UX.
   **Known gap:** UX taste has no automated check; only review enforces it. Flag any UX decision that relies on review alone, until this gap is closed.
2. **Agent legibility.** The repo stays as findable for an agent next month as it is today. Test: from `AGENTS.md`, an agent new to the repo reaches any fact in two pointers, and finds it in exactly one place. How to write for that: `/writing-for-agents`.
3. **Claims cite public evidence.** A Speaker note cites a Research question, or a high-trust Source directly; never an unjudged URL. Trust is judged once, in the evidence layer, and every citation inherits it.
4. **Episode for the viewer, Slide for the code.** The Episode is the product unit: what a viewer watches and an Event presents. The Slide is the technical unit: an Episode is an ordered composition of Slides. Every Episode stands alone, with its own title, Slides and video, whether public or unlisted. Adapt an Episode for an audience by composing an unlisted Episode. Reuse a Slide by copying it into the Episode; promote it to the shared pool deliberately, and accept that copies drift until then.
5. **The pipeline produces it, and learns from every fix.** New or changed Episodes and Slides go through `/new-episode` and its skills. Research grows the evidence layer on its own schedule; an Episode draws on it and commissions research only where evidence is missing. When something is fixed by hand, feed the lesson back into the skill, template or guide that should have got it right. Under deadline, filing an issue for the feedback is enough.
6. **Workshop deadlines cut content, never structure.** When there isn't time for both, present fewer Slides, simpler visuals or rougher polish, and cut a claim rather than ship it uncited. Schema, tests, the right document location and any needed record stay in.

## Content layers

- **Evidence:** Concept → Research question → Source; the proof, rendered publicly.
- **Teaching:** Episode → Slide → Speaker note item, Explorable explanation; the product unit and the technical unit.
- **Delivery:** Event → Playlist → Episode; arranging and presenting, never owning Slides.

## Escalation

A change that would trade architecture or agent legibility for delivery is escalated to Han before it is built, as Archgate ADR GEN-004 Escalated tech debt lays out; every other change proceeds without asking.

## Non-goals

- A backend, login or database service before horizon 3.
- Machinery that keeps Slide copies in step: a copy drifts until it is promoted.
- A document without one clear home.
- A feature that serves one workshop and can't become reusable.
