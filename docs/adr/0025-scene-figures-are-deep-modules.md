---
type: design-adr
title: Scene figures are deep modules
status: accepted
---

# Scene figures are deep modules

The Iceberg Episode `what-lies-below-the-waterline-of-sustainable-ai-skills` draws one deep-sea scene on 26 Slides: sea on 26, bubbles on 22, the robot on 21, the seated pilot on 17, the ship on 13, the captain on 10. Drawn per Slide, every retune repeats 26 times and the figures drift. This record binds where the scenery and its figures live, the interface a Slide uses, and how they move, so a Slide names its zone, places its cast and states its motion, and nothing more.

## Human acceptance

Han chose these decisions in the architecture grill of the Episode Run (`/new-episode`, branch `episode/what-lies-below-the-waterline-of-sustainable-ai-skills`) on 2026-11-13, questions 1 to 24, run with `/codebase-design` (23 and 24 on colour, after a figure agent hit FE-011), after approving the Spec's design for implementation. He answered each question, left each "Decided without asking" line uncontested, and confirmed the shared understanding with "yes". The questions and answers are in `.scratch/what-lies-below-the-waterline-of-sustainable-ai-skills/grill-architecture.md`.

Han amended the record in the feedback-2 grill of 2026-11-14, on the Episode's title Slides, scenery and transition; [Feedback 2 changes](#feedback-2-changes) lists what changed, and the sections below state the current decisions.

## Decision

### Modules

Three modules under `src/episodes/components/slide-shared/`, split by what each changes with:

| Module                 | Changes with                     | Owns                                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iceberg/`             | the Iceberg style (design guide) | zone tokens, the depth gauge (`DepthGauge`), rail (`DepthRail`), zone label, `ZoneScene`, `HeroDepthScene`, `WholeDepthScene`, `Travel`; in `scenery/` the sky (`FlatSky`, `Clouds`, `SunMoon`), sea life, seabed, light rays, `Iceberg` and `placeIceberg` |
| `character/`           | how people are drawn             | `Character`: body, poses, moods, the emote and `says` bubble at the head; `shared-presets.ts` with `aiAgent`                                                                                                                                                |
| `deep-sea-expedition/` | this Episode's analogy           | `cast.ts` (captain, pilot presets), `Robot`, `Ship`, `Console`, `ControlRoom`                                                                                                                                                                               |

Each Fable element (`Ship` with its pennant, `Iceberg`, `Clouds`, `SunMoon`, `Lanternfish`, `Siphonophore`, `Jellies`, `FishSchool`, `Whale`, and `PolyBubble`) is its own `.tsx` drawing with its own CSS module, behind a frozen interface its tests pin: props, anchor box, `data-*` hooks and tokens. A redraw changes the drawing only. `PolyBubble`, the one faceted bubble the Abyss scenery and the `bubbles` transition both draw, is a primitive several parts share, so it lives in `src/shared/components/core-components/poly-bubble/` (FE-007-module-layering).

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

1. **Zone colours** are five global tokens in `globals.css`, `--zone-surface` to `--zone-abyss`, one value in both themes, so Han tunes each zone once in the token editor. Text contrast follows the zone, not the theme: dark on Surface and Sunlit, light from Twilight down. Dark mode is out of scope until Han settles it separately.
2. **Scenery colours** stay mixed from global tokens. If the cast gallery shows neighbouring figures too alike, a small set of scenery tokens is promoted to `globals.css` (`--ice`, `--deep`, `--seabed`, `--creature`), each with a dark value, and the figures mix from those (Q24), following FE-011's own mitigation.

### Motion

1. **Trigger:** a Scene's motion starts when its Slide's mount carries `data-zone="active"` (`slide-mount.client.tsx`), plays once per entry and replays on re-entry. There is no Replay button on the page.
2. **Engine:** CSS keyframes for scene motion, server-rendered, with no GSAP. The Section-title descent is the `bubbles` transition into the section slide: a canvas wave in the next Section's zone colour, its crest irregular, carrying about forty `PolyBubble`s the browser draws when the edge plays, never the static HTML ([Slide transitions](../features/slide-transitions.md)). Figures stay inline SVG; only the transition wave is canvas.
3. **Choreography:** movement across the Scene is `Travel`, because positions belong to the Slide; movement inside a figure is its `motion` prop, because only the figure knows its parts. A Slide never targets a figure's internal parts.
4. **Emotes** pop in once after their figure's motion and stay visible: meaning is never behind hover or a click.
5. **Ambient loops:** slow loops per zone, scenery only, drawn by `ZoneScene` (Surface: three cloud layers drifting at their own speeds, the ship's rock, which a Surface Slide switches on with `Ship`'s `rock` prop so a ship elsewhere stays still, and the pennant fluttering at its masthead; Sunlit: a fish school; Twilight: jellies, and on a Twilight Section title also a lanternfish school and a siphonophore; Midnight: the whale; Abyss: rising `PolyBubble`s). A loop may move small groups, each bubble or fish on its own, by transform or opacity only. Each pauses outside `active` and while the document is hidden. The cast never loops; the iceberg never moves.
6. **Reduced motion:** every figure's rest state is its end state, so `prefers-reduced-motion: reduce` only removes animations. Figures are server components and cannot set attributes, so they mark each animated part `data-motion="<name>"`; one client leaf in `ZoneScene` listens for the Scene's `animationend` events and sets `data-motion="settled"` on the Scene once every once-animation has ended (ambient loops excluded), which browser checks wait on (ARCH-003-testing §5). An emote reads `--emote-delay`, set by its figure, so it pops in after the figure's motion.

### Interaction

1. **View switch:** one Chat app / Coding agent toggle in the Episode page's sticky top bar, reachable on every Slide, held in memory as transient state, opening on Chat app (FE-001-state-management). Q8 chose `?view=coding`; FE-001 §1.2 forbids query-param state and the hash holds the active Slide, so Han chose memory on 2026-11-13 over a preference, a `/coding` path or an FE-001 exception. Its state sits behind one seam, so persisting it is one change.
2. **Zone label:** the plain zone name stays visible; a button opens a popover with the depth in metres and the scientific name, on hover, focus or tap.
3. **Depth gauge:** the Title slide and every section slide show a slim gauge at the right edge, the five zone colours as one strip with only the current zone named in its plain word; the word is a zone label button, so its popover gives the depth and the ocean term. Section tiles are left to the table of contents. A section slide's eyebrow names its place in the Episode, never its zone.
4. **Phones:** below `md` a section slide's gauge hides, and a thin coloured rail at the left edge keeps the depth readable (Han, 2026-11-13).

### Build

The Build job `implement-scene-cast` writes these figures before any Section uses them. It needs `implement-episode-init` and runs before `implement-iceberg-style`, whose `ZoneScene` draws its sea life and iceberg; every `implement-section-*` job needs both. Four Opus agents at medium effort, in parallel: `Character` with the captain, pilot and `aiAgent` presets; `Robot`; `Ship` and `Console`; the sea life and iceberg for `ZoneScene`. A Sonnet agent builds the cast gallery, a `/to-decision-html` page rendering the real components in every pose and mood, light and dark, beside the Spec's low-poly figure. Han's picks there gate the job; a Fable redraw is decided after he sees it.

## Feedback 2 changes

Han decided these in the feedback-2 grill of 2026-11-14, on the title Slides, the scenery and the transition:

1. **Depth gauge for the ruler:** the slim depth gauge replaces the depth ruler and its GSAP Section-title descent (Q4); the descent is the `bubbles` transition (Motion §2).
2. **Zone-coloured title Slides:** the Title slide and every section slide fill with their zone's colour, running up under the page header; page Slides keep the default background. One zone palette serves both themes (Q2, Q3).
3. **Flat sky and Surface water:** the sky and the Surface water are flat fills with a distinct night sky; from Sunlit down the water stays low poly at about half the facets (Q6).
4. **One iceberg placement:** the title hero, `ZoneScene` and `WholeDepthScene` place the berg through `placeIceberg` (`scenery/iceberg-placement.pure.ts`): its body in Sunlit, its keel only touching Twilight (Q10).
5. **Fable elements behind frozen interfaces:** each element is split into its own file and CSS module, so a Fable redraw touches one drawing at a time and its interface tests stay green (Q15, Q17).
6. **`PolyBubble` shared:** one faceted bubble for the Abyss scenery and the transition (Q7, Q16), in `src/shared/components/core-components/poly-bubble/`.
7. **Transition bubbles drawn by the browser:** the `bubbles` transition's forty bubbles are rendered from a seeded field when the edge plays, never in the static HTML (Q28).

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
- **The full depth ruler on every section slide** repeated what the table of contents names and crowded the ship and the scenery; the gauge keeps the depth in one strip.

The cost:

- The design guide's Iceberg style gains an exception to "nothing loops at rest".
- `implement-scene-cast` adds a gate before every Section job.
- `aiAgent` is built before any Slide uses it, as proof of the seam.

## Relationship to binding rules

Lives within [FE-004-slide-architecture](../../.archgate/adrs/FE-004-slide-architecture.md) (`slide-shared` holds parts two Slides share), [FE-006-server-client-boundary](../../.archgate/adrs/FE-006-server-client-boundary.md) (figures are server components; the view toggle, the zone-label popover and the transition's bubble field are the client leaves), [FE-009-slide-wrapper-and-scene](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md) and [FE-011-design-tokens](../../.archgate/adrs/FE-011-design-tokens.md). The Iceberg style is [the design guide](../design/design-guide.md#iceberg); the motion duties are [Slide transitions](../features/slide-transitions.md).
