---
type: design-adr
status: proposed
---

# Every titled Slide opens with a shared Slide header, and its entrance plays once

Scenes that each authored their own label line, title and caption drifted in size, spacing and wording, and an audience reads a talk faster when every Slide opens the same way. So the Slide wrapper renders one shared **Slide header** (the computed **Eyebrow**, the title, the caption) above the Scene and types it in once, the Scene fades up once with no entrance of its own, and hover emphasis comes from one shared vocabulary. It sits between the Slide wrapper and the Scene that FE-009 splits.

## Decisions

1. **One shared header.** The Slide wrapper renders `SlideHeader` (composing `SlideEyebrow`) above the Scene for every titled Slide; the container supplies its data. Its type comes from tokens, per the Slide header table in [the design system](../design/design-system.md). On the shared header a Scene renders no title and no caption: the kit's `Title` throws there, failing the build. A Slide gives `title` and `caption` in its own Translation file, and its Scene keeps to the visual, a `SlideFrame` with the picture and no heading.
2. **The Eyebrow is computed, never authored.** It is the Section title and the Slide's place among its Section's titled page Slides (`n / N`), read from the Sections the table of contents shows, so it can't drift from them. Section slides and the Title slide have none.
3. **An Episode record may opt out or tune.** `header: 'authored'` makes its Scenes render their own header, and its Slides keep their `[data-zone]` entrances; the layouts in `slide-layouts/` serve such Episodes. `entrance` (default `typewriter`, else `fade` or `none`) picks how the header enters. `title` names the Title slide's hero Slide, a Slide folder with no notes or Voice script; the container keeps its `h1`.
4. **The entrance plays once per Slide per page.** It is `pending` until the Slide is first `active`, then `entering`, then `done` for the page's life, held in the zone store (FE-001: transient, in memory). A replay on every return turns scrolling back to re-read into waiting.
5. **Nothing hides without JavaScript.** The entrance hides a Slide only under the `js` class, set in `<head>` before first paint, so without JavaScript, in print and under reduced motion every Slide shows at once, and a server-rendered Scene never flashes on load.
6. **The typewriter is CSS.** Characters are split into spans on the server and timed by a seeded jitter in `typewriter.pure.ts`, so the pace is irregular like a person typing yet stable across loads, and no client component runs for the header. It keeps the full text for assistive tech and settles within 1.5s. Another entrance is another keyframe set over the same spans.
7. **A Scene on the shared header has no entrance of its own.** It does not stagger, draw on or fade its elements in on entry: a per-element entrance would play under the shared one. Looping motion with a purpose (FE-009 §6) and decision 9 aside.
8. **One hover vocabulary.** Scene hover and focus emphasis reuse the `globals.css` classes `card-hover`, `focus-group` and `hover-reveal` (for example `card-hover--raise`, `focus-group--dim-others`, `hover-reveal__detail`); a new pattern is added there and to the design-system catalogue first, never invented for one Scene. Every pattern also applies on `:focus-visible` or `:focus-within` and drops its transition under reduced motion. The presenter points with the mouse, and a few shared patterns teach the audience what a hover means across Episodes.
9. **At most one emphasis motion per Scene, carrying the Slide's message.** Motion that carries the claim (a funnel whose dots arrive while everything else is at rest) is the point of the Slide, not decoration. It plays on first entry (`useSlideEntry()` reads `entering`), replays on mouse enter and keyboard focus of a focusable trigger, shows its end state under reduced motion, and is named in the Spec Option's build notes. One per Scene keeps it legible.

## Considered options

- **A per-Slide header prop.** Rejected: no Slide has needed a different header yet.
- **A GSAP or client-side typewriter.** Rejected: a client leaf per Slide for text that is static.
- **Replaying the entrance on return.** Rejected: re-reading becomes waiting.
- **Per-element entrances inside Scenes.** Rejected: they play under the shared entrance and fight it.

## Consequences

- Every Slide reads Eyebrow, title, caption, then its visual, and Scenes carry no heading markup and no entrance code.
- With JavaScript, a pending Slide is blank until active, so the top of the next Slide shows empty while the current one is read. A Slide stays hidden if the observer never reports it; only `.js` hides, and a browser check counts `data-entry` values after load.
- Typed headers weigh more: one span per character in the static HTML.
- Two header modes coexist: an Episode with `header: 'authored'` keeps each Scene's own header and entrances.
- Enforcement: the record's `header`, `entrance` and `title` fields are typed; unit tests cover the entrance states in the zone store and `useSlideEntry()`, the seeded jitter (deterministic, uneven, normalised, within budget), the Eyebrow's count, the header text by default and none on `header: 'authored'`, and the kit's `Title` refused on the shared header; a post-build test counts the typed header once in each Episode's reader text; a `visual-check` after load finds the Title slide `data-entry="done"` and Slides below the fold `pending`, the caption 70% of the Foreground from `md`, and a section slide at least `40svh`. Review checks no entrance in a Scene on the shared header, at most one emphasis motion with a focusable trigger named in the build notes, and hover emphasis from the shared classes.
