---
type: design-adr
title: Scene figures are deep modules
status: accepted
---

# Scene figures are deep modules

The Iceberg Episode `what-lies-below-the-waterline-of-sustainable-ai-skills` draws one deep-sea scene on 26 Slides: sea on 26, bubbles on 22, the robot on 21, the seated pilot on 17, the ship on 13, the captain on 10. Drawn per Slide, every retune repeats 26 times and the figures drift. This record binds where the scenery and its figures live, the interface a Slide uses, and how they move, so a Slide names its zone, places its cast and states its motion, and nothing more.

## Human acceptance

Han chose these decisions in the architecture grill of the Episode Run (`/new-episode`, branch `episode/what-lies-below-the-waterline-of-sustainable-ai-skills`) on 2026-11-13, questions 1 to 24, run with `/codebase-design` (23 and 24 on colour, after a figure agent hit FE-011), after approving the Spec's design for implementation. He answered each question, left each "Decided without asking" line uncontested, and confirmed the shared understanding with "yes". The questions and answers are in `.scratch/what-lies-below-the-waterline-of-sustainable-ai-skills/grill-architecture.md`.

## Decision

### Modules

Three modules under `src/episodes/components/slide-shared/`, split by what each changes with:

| Module                 | Changes with                     | Owns                                                                                                                                                 |
| ---------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iceberg/`             | the Iceberg style (design guide) | zone tokens, depth ruler, rail, zone label, `ZoneScene` (sky with sun and moon, sea, light rays, seabed, iceberg, the zone's ambient loop), `Travel` |
| `character/`           | how people are drawn             | `Character`: body, poses, moods, the emote and `says` bubble at the head; `shared-presets.ts` with `aiAgent`                                         |
| `deep-sea-expedition/` | this Episode's analogy           | `cast.ts` (captain, pilot presets), `Robot`, `Ship`, `Console`, `ControlRoom`                                                                        |

`iceberg/` knows no cast and `character/` knows no setting, so a later Iceberg Episode about something else reuses the style, and a later setting (`office/cast.ts`) adds presets without touching `Character`.

### Interfaces

A Slide's Scene reads:

```tsx
<ZoneScene zone="twilight" iceberg="keel">
  <Travel from="-20% -10%" to="40% 55%">
    <Robot motion="beam-on" mood="confused" />
  </Travel>
  <Character preset={cast.pilot} pose="sit" mood="thinking" says={t('pilotAsks')} />
</ZoneScene>
```

1. **A figure is a server component rendering inline SVG.** It ships no client JavaScript. Its colours are mixed with `color-mix()` from global tokens in its own CSS module, as `note-tints` does, never raw colours: shared parts reach every Episode that reuses them, so FE-011-design-tokens keeps raw colours out of `slide-shared/` (Q23). Meaning colours appear only for their meanings: `ai` on the `aiAgent` badge, nowhere in scenery.
2. **`ZoneScene` is deep.** One `zone` prop draws that zone's scenery; retuning a zone is one edit that all its Slides follow. The Surface sky draws both sun and moon and `.dark` swaps them in CSS, the pattern of the landing hero (`src/page-assembly/landing/promotion-window.tsx`), copied, since an Episode does not import page assembly.
3. **A preset varies appearance only:** build, skin tone, hair, headwear, outfit, one held prop, and `kind`. Poses and moods belong to `Character`, so any preset takes any pose. `kind: 'ai'` draws the `ai` meaning colour as one badge, so an AI agent reads as a colleague, the amnesiac freelancer, not a robot.
4. **The actor contract** is `mood`, `says` and a head anchor where the emote sits. `Character` and `Robot` both implement it. `mood` is one of a closed set (`confused`, `surprised`, `happy`, `thinking`, `blank`); `says` is text from the Slide's `i18n/` (FE-003-localization), never a preset field.
5. **`poses.pure.ts`** maps preset, pose and mood to the visible parts and is tested for every preset × pose (ARCH-003-testing). The drawing itself is judged by Han in the cast gallery.
6. **In this Episode the robot is the AI.** `aiAgent` exists in `character/shared-presets.ts` and is shown in the gallery as the third preset that proves `Character` outside the crew; the Slides do not use it.

### Colour tokens

1. **Zone colours** are five global tokens in `globals.css`, `--zone-surface` to `--zone-abyss`, each with a `.dark` value, so Han tunes each zone once in the token editor.
2. **Scenery colours** stay mixed from global tokens. If the cast gallery shows neighbouring figures too alike, a small set of scenery tokens is promoted to `globals.css` (`--ice`, `--deep`, `--seabed`, `--creature`), each with a dark value, and the figures mix from those (Q24), following FE-011's own mitigation.

### Motion

1. **Trigger:** a Scene's motion starts when its Slide's mount carries `data-zone="active"` (`slide-mount.client.tsx`), plays once per entry and replays on re-entry. There is no Replay button on the page.
2. **Engine:** CSS keyframes for scene motion, server-rendered; GSAP only for the Section-title descent, which moves the whole ruler view.
3. **Choreography:** movement across the Scene is `Travel`, because positions belong to the Slide; movement inside a figure is its `motion` prop, because only the figure knows its parts. A Slide never targets a figure's internal parts.
4. **Emotes** pop in once after their figure's motion and stay visible: meaning is never behind hover or a click.
5. **Ambient loops:** one slow loop per zone, scenery only, drawn by `ZoneScene` (Surface: wind on the clouds and the ship's rock, which a Surface Slide switches on with `Ship`'s `rock` prop, so a ship elsewhere stays still; Sunlit: a fish school; Twilight: jellies; Midnight: the whale; Abyss: bubbles). Each pauses outside `active` and while the document is hidden. The cast never loops; the iceberg never moves.
6. **Reduced motion:** every figure's rest state is its end state, so `prefers-reduced-motion: reduce` only removes animations. Figures are server components and cannot set attributes, so they mark each animated part `data-motion="<name>"`; one client leaf in `ZoneScene` listens for the Scene's `animationend` events and sets `data-motion="settled"` on the Scene once every once-animation has ended (ambient loops excluded), which browser checks wait on (ARCH-003-testing §5). An emote reads `--emote-delay`, set by its figure, so it pops in after the figure's motion.

### Interaction

1. **View switch:** one Chat app / Coding agent toggle in the Episode page's sticky top bar, reachable on every Slide, held in memory as transient state, opening on Chat app (FE-001-state-management). Q8 chose `?view=coding`; FE-001 §1.2 forbids query-param state and the hash holds the active Slide, so Han chose memory on 2026-11-13 over a preference, a `/coding` path or an FE-001 exception. Its state sits behind one seam, so persisting it is one change.
2. **Zone label:** the plain zone name stays visible; a button opens a popover with the depth in metres and the scientific name, on hover, focus or tap.
3. **Phones:** below `md` the full ruler and its labels hide, and a thin coloured rail at the left edge keeps the depth readable (Han, 2026-11-13).

### Build

The Build job `implement-scene-cast` writes these figures before any Section uses them. It needs `implement-episode-init` and runs before `implement-iceberg-style`, whose `ZoneScene` draws its sea life and iceberg; every `implement-section-*` job needs both. Four Opus agents at medium effort, in parallel: `Character` with the captain, pilot and `aiAgent` presets; `Robot`; `Ship` and `Console`; the sea life and iceberg for `ZoneScene`. A Sonnet agent builds the cast gallery, a `/to-decision-html` page rendering the real components in every pose and mood, light and dark, beside the Spec's low-poly figure. Han's picks there gate the job; a Fable redraw is decided after he sees it.

## Alternatives and cost

- **One kit holding style and cast** ties a later Iceberg Episode to a submarine crew; the design guide calls the iceberg the frame, never a second analogy.
- **Figures copied into each Slide** (product rule 4) would mean 21 robots drifting apart.
- **Static `.svg` files** cannot take zone tokens or dark mode; **generating TSX from the Spec's Python** puts a second toolchain into the build.
- **Each Section drawing its own figures** gives eight robots; **an HTML preview ported to TSX later** gives two artefacts per figure and an approval the port can quietly break.
- **Exported scenery parts per Slide** is shallow: each Slide relearns which parts belong at which depth.
- **Choreography in the figure** grows the figure with every Slide; **in the Slide's CSS** couples 21 Slides to the robot's SVG structure.
- **Emotes as Slide-positioned parts** make each Slide guess the head; **moods as poses** multiply poses by moods.
- **A Replay button per Slide** was review machinery; **scroll-linked motion** ties the scene to how fast the presenter scrolls.
- **A per-Slide view switch** means 27 clicks. **`?view=coding`** breaks FE-001 §1.2; **a preference** and **a `/coding` path** were offered and not chosen.
- **A hover-only tooltip** reaches neither keyboard nor touch.

The cost:

- The design guide's Iceberg style gains an exception to "nothing loops at rest".
- `implement-scene-cast` adds a gate before every Section job.
- `aiAgent` is built before any Slide uses it, as proof of the seam.

## Relationship to binding rules

Lives within [FE-004-slide-architecture](../../.archgate/adrs/FE-004-slide-architecture.md) (`slide-shared` holds parts two Slides share), [FE-006-server-client-boundary](../../.archgate/adrs/FE-006-server-client-boundary.md) (figures are server components; the view toggle and zone-label popover are the only client leaves), [FE-009-slide-wrapper-and-scene](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md) and [FE-011-design-tokens](../../.archgate/adrs/FE-011-design-tokens.md). The Iceberg style is [the design guide](../design/design-guide.md#iceberg); the motion duties are [Slide transitions](../features/slide-transitions.md).
