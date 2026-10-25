---
type: product-vision
title: Product vision
status: draft
---

# Product vision

## North star

A visual knowledge library of reusable teaching units, produced by an agentic pipeline, that wins clients through workshops now and an audience through YouTube later.

## Horizons

1. **Now to Jan 2027: workshops.** Events are Han's main client exposure. The site is a presenting surface with a booking call to action.
2. **2027: library and pipeline.** Polished YouTube Episodes and public playlists build an audience. Explorable explanations on their own URLs bring visitors back. The content pipeline becomes a product, first local, then in the cloud.
3. **End of 2027: platform.** Login, booking, billing, webinars and progress tracking. The site moves from static pages to an application with a backend.

## Trade-off rules

When rules conflict, the higher one wins.

1. **Architecture beats delivery.** Software architecture, information architecture and UX take no shortcuts. A decision that needs a record gets its own session, even before a workshop. Each kind has its record and its check: Archgate ADRs for code, markdown-harness for documents, design-ADRs and `docs/design/design-guide.md` for UX.
   **Known gap:** UX taste has no automated check; only review enforces it. Flag any UX decision that relies on review alone, until this gap is closed.
2. **Agent legibility.** The repo stays as findable for an agent next month as it is today. Test: from `AGENTS.md`, an agent new to the repo reaches any fact in two pointers, and finds it in exactly one place. How to write for that: `/writing-for-agents`.
3. **Evidence is public.** A claim traces to its proof, and the proof renders on this site: Concepts and Research questions have their own pages, Sources are cited, never pasted. A teaching unit with no proof behind it is unfinished.
4. **Episode for the viewer, Slide for the code.** The Episode is the product unit: what a viewer watches and a workshop lists. The Slide is the technical unit: an Episode is a configuration of Slides. Reuse a Slide by reference; a Run that edits one makes an instance, and Promotion resolves it at a Gate. Adapt an Episode for an audience through configuration, never a forked copy. An unlisted Episode has every ability a public one has, its own Slides included.
5. **The pipeline produces it, and learns from every fix.** New or changed Episodes and Slides go through `/new-episode` and its skills. When something is fixed by hand, feed the lesson back into the skill, template or guide that should have got it right, so the next Run does better. Under deadline, filing an issue for the feedback is enough; the fix itself feeds back later.
6. **Workshop deadlines cut content, never structure.** When there isn't time for both, present fewer Slides, simpler visuals or rougher polish. Schema, tests, the right document location and any needed record stay in.

## Content layers

One line per layer; the model itself lives in the design-ADR `docs/adr/0016-content-data-model.md`.

- **Evidence:** Concept → Research question → Source; the proof, rendered publicly.
- **Teaching:** Episode → Slide → Speaker note item, Explorable explanation; the product unit and the technical unit.
- **Delivery:** Event → Playlist → Episode; arranging and presenting, never owning Slides.

## Escalation

When a change would break rule 1 or 2, stop and escalate before building:

1. Name the trade-off.
2. State the cost: what gets harder later, and how to undo it.
3. Ask Han to accept it explicitly. Accepting is his business decision.

Once accepted, fence the shortcut, mark it with a comment linking a `tech-debt` GitHub issue, and file that issue (Archgate ADR GEN-004). Every other change proceeds without asking.

## Non-goals

- A backend, login or database service before horizon 3.
- Content forked per audience.
- A document without one clear home.
- A feature that serves one workshop and can't become reusable.
