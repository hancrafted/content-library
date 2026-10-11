# Voice grill onboarding: repo state and open points

Read this before a voice grilling session about the content library. You have no access to the repo; everything you need is here. Follow `docs/agents/grilling-voice.md` for the session shape. The user is likely driving: one short question at a time, no lists read aloud, no file paths spoken unless asked.

State as of 11 October 2026.

Since then, epic [#51 Self-contained Slides](https://github.com/hancrafted/content-library/issues/51) changed the Slide shape: every Slide is one folder carrying its own text, and the site-wide Translation files hold no Episode text. Where this file describes Slides otherwise, #51 wins.

## What the project is

- A localized Next.js site, exported as static pages to GitHub Pages.
- It visualizes theory content from YouTube training videos, in English (canonical at the bare root) and German (under `/de`).
- Each Episode is one page of Slides stacked vertically, grouped into Sections, with a table of contents, a Context drawer for Speaker notes and Voice script, and a talk player.
- Binding rules live in Archgate ADRs; checks run through `npm run verify`.
- Work arrives as handoffs from voice brainstorms like this one.

Use the glossary words exactly: Episode, Section, Slide (section slide, page slide), Scene, Backdrop, Foreground, Chrome, Speaker notes, Voice script, Translation file, Translation key. Avoid "card", "panel", "page" for a Slide, and "catalog" for a Translation file.

## What just happened

A prototype run tested two things:

- how well agents produce generic Slide layouts with no real content
- whether the harness steers them

An orchestrator agent built a new Episode called **slide-master**, a catalog of reusable Slide layouts in two Sections:

- **Timelines (8 page Slides):**
  - three horizontal: a rail with popovers, a snapping card track, phase bars on a time axis
  - three vertical: a centre spine that fills on scroll, sticky years in changelog style, a numbered stepper
  - two surprises: a clock-face cycle and a metro map with branching lanes
  - All are interactive and respect reduced motion; the user asked that every timeline look distinct, and they do.
- **Grids (10 page Slides):** every grid from one-by-one to three-by-three (rows by columns), plus a bento grid. Every cell has a title and a caption.

Each Slide was built by its own sub-agent and merged one at a time, with the full check suite after every merge.

- Everything passes, and it is up for review as **PR 50**.
- A "Slide master" link sits on the landing page beside the page-template link.

## What the harness did well

- The one-observer rule redirected "animate on entering the viewport" to the existing Slide-zone mechanism instead of a new observer.
- The client-boundary, import-direction and test-shape rules held across 18 independent agents with almost no friction.
- The function-length lint forced smaller components; most agents said the code got clearer.

## Open points to grill

These are the decisions waiting on the user. Take them one at a time; the first three matter most.

1. **Name clash.** The glossary already uses "Slide master" for the shared slide frame and type scale. The new Episode reuses it as its slug. Rename the Episode, or keep it and record the clash in the glossary? No link to it has been published yet, so renaming is still cheap.

2. **Where single-Slide styling lives.** The rules say an Episode's shared parts folder is for parts several Slides share, but also that all Episode CSS must live there. So one-Slide components with their own CSS ended up in the shared folder. Allow that explicitly, or give a Slide its own stylesheet beside it?

3. **Shared helpers versus free Slides.** Three Slides each wrote their own popover positioning, and five each wrote the same "reveal once when the Slide becomes active" logic. The rules deliberately leave a Slide's inside ungoverned, because an earlier prototype degraded when forced through shared shapes. Extract the two helpers, or accept the duplication as the price of freedom?

4. **A phantom colour token.** Agents used a "card" background colour that the site never defined, so it rendered transparent and no check noticed. Fixed in the new Episode; still present in one older Episode and one UI component. Define the token, or ban it?

5. **A link rule that fired on a drawing.** The rule that every `href` must be a localized link also fired on an SVG text path, which is not a link. Should the rule exempt SVG and in-page fragments?

6. **The Next.js dev server rewrites the agent instructions file** every time it starts, and every agent had to undo it. Turn that feature off in config, or commit the block once?

7. **Checks that don't exist yet:**
   - test assertions holding unnamed magic values
   - content invisible until JavaScript runs, or in print
   - popovers not using the shared portal root
   - basic accessibility lint
   - Which of these deserve an enforcer, and which stay reviewer duties?

8. **Placeholder gaps.** Sub-agents wanted a few more Translation keys: a "today" label and quarter labels for the phase bars, a legend label for the metro map, a "card n of 6" announcement for the track, category names for the changelog. Add them now, or wait for real content?

9. **What comes after the prototype.** The user planned to review the result and then write design guidelines. What should those guidelines fix first: typography, colour, motion, density? And should the catalog's layouts become the starting point for real Episodes?

## Possible artefacts from this session

- Design guidelines for Slide layouts.
- ADR amendments: link rule scope, the parts folder, colour tokens, new checks.
- A handoff for an executing agent. The detailed technical list already exists: `docs/handoff/slide-master-harness-findings.md`.
