---
type: feature-guide
title: Slide presentation contracts
stale_after: 2026-11-18T00:00:00Z
---

# Slide presentation contracts

**Accepted architecture contract; surfaces, named transitions and Title-departure navigation.** [design-ADR-0022](../adr/0022-slide-presentation-and-transition-clock.md) owns human acceptance evidence, the responsibility map and binding-governance pointers. This reference defines the accepted feature contract for [#480](https://github.com/hancrafted/content-library/issues/480); it grants no exception beyond the approved boundary. Context window uses the presentation slots; Human in the loop and AI capability use their self-contained Title heroes.

## Named transition interface

`Slide.presentation.enter` and `.leave` each accept `{ effect, className?, style? }`. `effect` names `liquid`, `paper`, `glitch`, `goo`, `dither` or `wave`; `style` accepts custom properties only. `className` supplies a self-contained transition CSS module scope, including any local token definitions and `.dark` variants its settings reference. It must not depend on the declaring Scene's ancestry or override structural positioning, stacking or interaction rules.

`EpisodeComposition.transitionPrecedence` is `'enter'` by default, optionally `'leave'`. `recordContent()` resolves adjacent declarations in one linear pass into `EpisodeContent.transitions`, keyed by outgoing wrapper id. Each resolved entry retains `id`, `outgoing`, `incoming`, `declaration`, `targetSurface` and optional incoming `targetStyle`. An absent declaration produces no renderer; geometry still exists.

`SlideTransition` renders outside `SlideMount`, inside the outgoing `SlideIdentity`, above its isolated primary content and below front decoration. Its trailing host is at most the wrapper's height and clips only its own filtered ink. The incoming surface's live token reference and custom token definitions travel in a nested destination scope; semantic tone is never discovered from rendered colours. The winning transition scope supplies calculation settings even when its author is the incoming Slide. Host-inherited transition settings are reset to defaults; local class and inline custom properties override those defaults.

The shared `InkCanvas` and `INK_PROFILES` preserve the existing named filter, bleed and progress curve. The page attachment subscribes directly to selected clock progress and writes the ink scale without React frame renders or another ScrollTrigger. The landing/legacy `LiquidInkTransition` retains its ScrollTrigger driver and defaults; it does not attach this clock.

Rendering-only mappings:

| Variable                            | Unit / default                                                                                       | Meaning                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `--slide-transition-height`         | CSS length, `100svh`                                                                                 | Trailing rendering extent, capped at the outgoing wrapper height |
| `--slide-transition-bleed`          | CSS length; liquid `300px`, paper `120px`, glitch `200px`, goo `250px`, dither `100px`, wave `180px` | Filter overscan around the ink canvas                            |
| `--slide-transition-opacity`        | number, `1`                                                                                          | Local effect opacity                                             |
| `--slide-transition-target-surface` | live incoming surface token                                                                          | Destination colour on the nested target scope                    |

Range offsets below are calculation inputs, not rendering dimensions. A controlled editor changes them on `[data-transition-edge]` and dispatches `surface-clock-refresh` on the Episode root. The Grids reference's `grid-1x2` enter `wave` wins over its neighbour's leave `paper`, carrying a portable `-64px` start setting; its outgoing leave `goo` targets the next normal surface. Neither choice implies inversion or decoration.

`SurfaceSnapshot.suppressed` describes explicit navigation only. The driver reads the existing authority's `getNavigation()` before `subscribeNavigation()`, tracks monotonic ids and suppresses only `navigating`. Terminal events reconcile actual geometry before release; resize retains its cached geometry until quiet. Stale terminals cannot release a newer flight; interruption/timeout do not certify arrival or force progress. Successful settlement leaves no completion override. Driver disposal removes the lifecycle subscription without disposing the authority. Reduced motion hides edge effects entirely and removes slot displacement; static surfaces and native navigation remain usable.

## Effect-free surface interface

The effect-free path uses `Slide.presentation` (`src/episodes/components/slide-master/slide-presentation.ts`). Its optional `tone`, `rear`, `front` and `rearMobile` are independent; `rear` and `front` are decorative JSX, not Scene templates. The Title's declaration is `EpisodeComposition.title.presentation`. The existing `/master-slides/grids/` reference configures `grid-1x2`.

`presentation.Provider` is an optional layout-free context component around retained slots, the effect and removable primary content. Context window supplies `HeroMotion`: its rear `HeroDecoration` and its Scene's localized `HeroMotionButton` share one pause state. `SlideIdentity` continues to supply each retained slot's own zone identity. Providers introduce neither geometry nor navigation authority.

`presentation.style` accepts CSS custom properties, not structural CSS declarations. `--slide-surface` and `--slide-surface-foreground` are live token references. A colour override must retain its authored `tone` semantics. Slots own any additional named motion settings: the Grids reference maps `--surface-reference-duration` to its rear drift duration (default `8s`) and `--surface-reference-displacement` to its drift/front offset (default `1rem`), both rendering-only inputs. Slot hosts enforce pointer pass-through, inert/assistive exclusion, layer containment, reduced-motion displacement removal and print exclusion. CSS loops pause outside `active` and while hidden; imperative decorative islands must also respect the existing zone, document visibility and reduced-motion duties.

Retained rear/front slots receive their wrapper's identity through `SlideIdentity` in `slide-mount.client.tsx`. Their `useSlideZone()` consumers read the existing page zone store, independently of Scene mounting; the provider owns no zone or active-Slide state. The Grids reference's rear decoration uses this hook to start/cancel a Web Animation, with visibility/reduced-motion listeners released on cleanup. Its duration/displacement properties are read when motion starts; controlled edits to this imperative reference take effect at the next start. Front displacement remains CSS-only.

`EpisodeComposition.surfaceSamplingLine` supplies viewport pixels for tone sampling; omission uses the measured header lower edge. The server container supplies only `{id, tone, effect?}` descriptors to `surface-clock.client.tsx`; declarations and Scene functions stay server-side. Configured Title wrappers have a minimum `200svh` presentation extent with their primary content occupying at least the opening viewport; tall content remains unrestricted. Inverse Title copy clears the header through primary-content padding, with `--slide-title-top-space` defaulting to `calc(var(--header-block) + 1rem)`, `--slide-title-measure` to `16ch` and `--slide-title-caption-measure` to `40rem`. These are rendering-only lengths. Inverse surfaces remap the interactive token pair; a preview marked `data-tone-flip` uses the page's normal pair.

## Title-departure navigation

`EpisodeComposition.tocEntrance` accepts `title-departure` and `visible-from-start`. Pages with presentation default to `title-departure`; an explicit policy also enables effect-free geometry on an otherwise unconfigured page. Non-opted-in pages retain Title-only hiding through `data-title-active`. Visible-from-start bypasses only the entrance: ToC navigation, active data, reading information, header sampling and edge effects retain their independent behavior.

The Episode maps Title departure to the first surface edge, whose resolved range includes the winning incoming declaration's settings. No effect means the same default geometric range, without a renderer. `title-departure.ts` normalizes this metric through `--toc-reveal-start` and `--toc-reveal-end`, unitless fractions with `0 <= start < end <= 1`, default `0..1`. Invalid intervals use that default with a development diagnostic. Set these inputs on `[data-slot="episode-page"]` and dispatch `surface-clock-refresh` there after controlled edits; reads share the geometry driver's refresh and 500ms resize-rest lifecycle. Ordinary theme changes are CSS-only.

The Episode-owned `--title-departure-progress` and `data-title-departure` signals describe the normalized reveal, not active Slide or page tone. The ToC owns their interpretation in `toc-entrance.module.css`: reversible opacity `0..1` and upward travel from `--toc-reveal-distance` (default `0.75rem`) to zero. Hidden endpoints are non-focusable through visibility; intermediate navigation remains operable. Individual desktop/mobile fixed affordances move, not their common ancestor, so the mobile modal retains its viewport geometry and native focus behavior. Reduced motion removes displacement and transitions; print and no-JavaScript output remain readable. An inverse middle Slide does not restart this Title policy.

The DOM-independent public seam is `createSurfaceClock` in `src/shared/lib/surface-clock.ts`:

- `getSnapshot()` reads semantic `tone` and ordered `edges` (`id`, outgoing/incoming tone, document `top`, effective `start`/`end`, `progress`).
- `setGeometry(input, position?)` accepts normalized document measurements and can reconcile a measured position atomically; `setPosition(position)` scrubs cached geometry. Adjacent edge ids are `outgoingId→incomingId`; effects are not an input.
- `subscribe(select, listener, equal?)` notifies only changed selections; read the snapshot for initial state. Its unsubscribe prevents subsequent notification, including removal during another listener's publication.
- `requestRefresh()` asks the attached driver to remeasure; `dispose()` releases the calculation's subscriptions.

`driveSurfaceClock` (`src/shared/lib/surface-clock-driver.ts`) supplies the scheduling boundary: explicit frame/timer/read ports, optional authoritative `navigation`, coalesced `scroll()`, 500ms-quiet `resize()`, `clock`, and `dispose()`. Dispose the driver to cancel queued frame/timer work as well as the clock. The container attachment additionally releases listeners, observers and owned signals. Geometry refreshes read stable wrappers, anchor scroll margins, root scroll padding and the winning effect scope's range properties before publishing; no-effect edges use their outgoing wrapper's range properties. The applicable anchor offset is the wrapper's scroll margin plus root scroll padding (`auto` contributes zero), matching native anchor landing. Percentage root padding resolves against viewport height, consistently with the navigation authority. Range custom properties use finite `px` values (or `0`), with invalid/missing values falling back to zero; invalid authored values produce development diagnostics. Content/Scene remounts, wrapper/header resizing and fonts request refresh. A controlled calculation-input edit dispatches `surface-clock-refresh` on the Episode root; theme-only edits need no refresh.

The adapter writes discrete `data-page-tone` on `<html>` and local `--surface-edge-progress` on each outgoing wrapper. Selected clock subscriptions drive each retained ink surface and its `data-transition-suppressed` attribute. It never writes global continuous progress or React frame state. Signal ownership prevents stale disposal from clearing a successor instance's values.

## Authoring

- A Slide independently opts into background inversion, an enter slide transition, a leave slide transition, rear decoration and front decoration. Omission enables none of the other capabilities. Title and non-Title Slides use the same presentation capabilities.
- The Slide master carries declarations; the existing wrapper renders mechanics. A Scene remains free JSX through its existing kit, without a creative template, Slide-type renderer, second container, new route or mandatory opt-in.
- Inversion is dark in the light theme and light in the dark theme. Each surface carries authored `normal`/`inverse` semantics plus live surface/foreground token references. A surface-colour override must preserve those contrast semantics or declare its corresponding tone. Neither clock nor chrome discovers tone from computed colours.
- Enter and leave declarations independently select `liquid`, `paper`, `glitch`, `goo`, `dither` or `wave`, the existing named family. There is no arbitrary renderer-registration API.
- Episode composition resolves each adjacent A → B edge once in a linear pass. B's enter wins a conflict by default; an Episode-wide leave-precedence option makes A's leave win. A single declaration wins alone; none means no effect. There are no per-edge precedence overrides.
- The result retains edge identity, both authored surfaces, the winning declaration and its portable settings separately from the outgoing host. No scroll callback resolves precedence.

## Rendering and lifetime

For A → B, A's trailing region always hosts the effect, even when B's enter declaration wins. The effect paints towards **B's declared surface token**. Within A's isolating wrapper the order is surface → rear decoration → primary Scene content → resolved edge effect → front decoration. Local numeric rungs and the chrome ladder belong to [FE-009 §8](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md#8-stacking-ladder).

The host cannot escape the outgoing wrapper or become a page overlay. Several relevant edges retain independent local hosts and progress. Keep both the plan and the rendering surface available for the entire geometric interval: retaining settings while unmounting the renderer is insufficient.

Rear decoration uses `SlideBackdrop`: full-bleed clipping within the Slide, hidden below `md` unless opted in, hidden in print, `aria-hidden`, no pointer interception. The surface/effect host is independent of the Scene's removable Backdrop. Front decoration is also decorative, assistively hidden and non-focusable, with pointer pass-through. Pointer movement, hover and click ripples may react without cancelling events, blocking links/controls or providing primary actions. Looping decoration pauses outside `active`, while hidden and under reduced motion.

Measure stable server-rendered wrappers, never headings or removable Scene elements. Preserve kept-height mounting and unrestricted content growth; no wrapper clipping, inner scrollbar or fixed creative layout. Title transition space extends beyond its initial viewport so departure starts only after scrolling. This Title presentation space is not permission to insert anchor-reachability spacers.

## Clock boundary

The clock is page-scoped transient presentation data, not a timer, URL writer or active-Slide store. Episodes translates composition into domain-free inputs; shared code imports no Episode records or Title concepts.

The small public contract is semantic; identifiers and React transport are implementation choices:

- **Read current snapshot:** DOM-independent surface-edge geometry, effective range, progress per relevant edge, outgoing/incoming semantic tones and tone at the supplied sampling line. Stable edge identities distinguish simultaneously visible edges.
- **Subscribe to a selected value:** notify only when that selection changes; return unsubscribe. Late consumers can read the current snapshot without waiting for a future event.
- **Request geometry/input refresh:** browser driver re-reads settled wrapper geometry and calculation-affecting CSS inputs; pure calculation receives normalized values, not DOM nodes or computed colours.
- **Dispose:** cancel scheduled work and listeners, release subscriptions and prevent queued callbacks from reaching disposed consumers. Unsubscribe gives the same guarantee for that consumer.

Driver inputs include current scroll/viewport/document limits, stable surface boundaries, authored tones, normalized range settings, composition-supplied sampling position and the existing authority's navigation lifecycle. Scheduling and measurement remain hidden behind the boundary.

Surface edges exist even with no effect selected: normal → inverse, inverse → normal and same-tone neighbours all have geometry. Effect selection never gates measurement. With multiple boundaries, sampling resolves the surface containing the sampling line in document order; retain each edge's measurements rather than publishing one ambiguous global progress.

Progress derives from current geometry: stop scrolling and it stops, reverse scrolling and it reverses, skip intermediate events and the current position still determines the result. The driver coalesces at most one update per animation frame, caches valid document geometry, batches reads before writes and limits per-frame work to relevant edges. IntersectionObserver threshold events are not a continuous clock. The existing observer alone owns zones/active Slide; effects and chrome do not add observers for that purpose.

### Reachable ranges

Use document scroll coordinates and the existing target's normal landing policy, including document-start landing for the `top` action. For an ordinary wrapper anchor, let `T` be the incoming wrapper's top, `V` the viewport height, `O` the applicable anchor offset, and `M` the browser's maximum document scroll position:

- The achievable landing is `L = clamp(T - O, 0, M)`, including document-start/end limits.
- Default start is the position where the incoming top reaches the viewport bottom (`T - V`), normalized to achievable scroll coordinates.
- Default end is `L`. Custom completion may be earlier, never later. Normalize custom and fallback ranges with the same landing cap.
- Normalize start to no later than end. For a collapsed range, progress is complete at/after the endpoint and unstarted before it; never divide by zero. Every successful arrival therefore has completed destination entry, including near-document-end and offset larger than viewport cases.
- Between distinct endpoints, progress is the clamped fraction of current scroll through that interval. Later reverse scrolling resumes the same calculation.

Example: with `T=2000`, `V=800`, `O=96`, `M=1800`, default start is 1200 and completion is 1800, not the unreachable nominal 1904. At scroll 1500 progress is 0.5; at arrival it is 1. With a landing clamped to document start, start and end can both be 0; arrival is still complete.

Direct links, reload and history restoration reconcile actual reachable geometry, including after layout refresh. No spacer, artificial scroll height or lingering forced-progress value compensates for an unreachable target.

### Geometry invalidation

During a resize burst retain cached geometry and do not recalculate it. Refresh 500 ms after the final resize event. Settled content expansion, font/layout changes and Scene remounts also invalidate geometry; they must not wait for an unrelated resize. Batch affected measurements and refresh the plan's normalized calculation inputs without moving ownership into Scenes.

## Portable CSS settings

Every authored visual setting has a documented CSS-variable mapping: surface colours, dimensions, effect parameters, decorative motion and progress ranges. Positioning responsibilities, stacking order, pointer safety and host ownership are private structural invariants, not override knobs.

The winning declaration carries a transition-specific style scope containing its settings, applied to the outgoing host's effect. It cannot depend on the declaring Scene's ancestors or copy their computed colours. Token references and any needed local token definitions must travel with that scope, including theme variants, without importing another Slide folder.

The following names are accepted contract mappings, not claims about existing code. Effect-specific mappings must be documented alongside their renderer when implemented.

- **Surface pair:** `--slide-surface`, `--slide-surface-foreground` default to the theme-aware normal pair, inverted only by explicit declaration. CSS-only; semantic changes require matching authored tone.
- **Effect destination:** `--slide-transition-target-surface` references the incoming declared surface token. CSS-only.
- **Range start adjustment:** `--slide-transition-start-offset` defaults to `0px`, added to default start before normalization. Requires explicit calculation refresh.
- **Range end adjustment:** `--slide-transition-end-offset` defaults to `0px`, added to achievable landing then capped at landing. Requires explicit calculation refresh.
- **Effect dimensions/visual parameters:** renderer documents each applicable variable, unit, safe default and whether it affects geometry; defaults preserve the named effect. Refresh only for calculation inputs.
- **Decorative motion:** slot documents applicable variables and resting defaults; structural pointer/layer rules are not exposed. CSS-only unless declared calculation-facing.
- **ToC reveal interval:** `--toc-reveal-start` defaults to 0; `--toc-reveal-end` to 1, fractions of the mapped departure progress. Refresh normalized inputs after controlled edits.
- **ToC presentation:** ToC owns opacity and short upward displacement mappings, bounded by its shared design tokens. CSS-only.

At refresh the DOM driver resolves calculation values from the winner's portable scope and supplies normalized inputs to the DOM-independent calculation. Missing/invalid range offsets fall back to zero; invalid ToC intervals fall back to 0..1. Rendering-only settings use their documented renderer defaults. Development diagnostics identify invalid authored values. Controlled runtime editors explicitly request refresh after calculation-input edits. No per-frame computed-style reads or broad style-mutation monitoring. Ordinary theme flips remain live CSS-only updates, with no plan rebuild.

## Navigation lifecycle: one authority

Extend `src/shared/lib/url-state.ts` additively. Its active-Slide interface, the existing observer/zones and one history writer remain authoritative. The clock reads navigation lifecycle; it never infers intent from an active-Slide change.

Every unmodified same-page action targeting a Slide participates: ToC, keyboard, in-content and native fragment links, including repeated navigation to the already-current destination. Preserve modified-click, download, external and cross-page behaviour. An initial fragment, reload or history restoration is positional reconciliation, not fresh explicit intent. Keep native links and anchors usable without JavaScript.

Consumers can read **current navigation** as well as subscribe. Each flight has a correlated identity, target and lifecycle status; a new flight supersedes the prior flight. A stale completion, timeout or queued callback cannot terminate a newer flight, even when targets match.

- **Start/current flight:** publish explicit intent and target immediately, even when the active id is unchanged. Suppress intermediate transition playback during the flight without creating competing active-Slide state.
- **Successful arrival:** establish actual arrival at the browser-achievable offset/clamped landing for this flight. Release navigation suppression; ordinary geometry already reports destination entry complete. `scrollend` alone does not identify a target or prove arrival.
- **Interruption:** report viewer interruption distinctly. Cancel navigation-specific suppression and immediately present current geometry, not the intended target's settled surface.
- **Timeout:** report timeout distinctly; elapsed time alone is not arrival evidence. Release suppression and resume current geometry.
- **Supersession:** retire the prior flight without allowing its terminal work to change the current flight. The new intent controls suppression.
- **Page disposal:** release page-owned work and signals; old navigation/clock callbacks cannot act on a successor page.

Exact event representation, interruption detection and cancellation mechanics belong to implementation. This lifecycle is additive coverage at the existing public authority, not a new controller or a private-helper testing seam.

## Signals and independent chrome

One thin browser adapter evolves the existing `data-page-tone` channel on `<html>`; it is the sole tone writer for the page instance. Update global tone only on change. Publish generic continuous edge progress at local edge/Episode scope (for example `--surface-edge-progress`), never a page-wide per-frame React state value or a blanket root CSS invalidation.

The container owns attachment, disposal and signal cleanup. Remove only the attributes/variables that instance owns; stale cleanup must not erase a successor's signals. Safe setup, cleanup and reattachment, provider placement, hydration coordination, snapshot representation and serialization shape are implementation choices under existing ADRs. Pass narrow permitted descriptors/JSX; do not ship server declarations or widen a shell into a client boundary.

- **Renderer:** consumes continuous progress directly from the clock, independent of CSS signals.
- **Header:** consumes semantic tone and owns its colours. Flip when the geometric boundary crosses a configurable viewport sampling line. Page composition supplies that position, defaulting to the header's lower edge; the shared clock knows no header selector. Approximate ink alignment is intentional, not pixel-perfect silhouette matching.
- **ToC:** Episodes maps Title departure to its outgoing surface edge. It uses that edge's resolved range even when the incoming enter wins, or the default geometric range without an effect. The shared clock knows no Title mapping. Default ToC entrance is a restrained fade and short rise, reversed on return; the visible-from-start option bypasses it. Inverse middle Slides do not re-trigger hiding, and header tone never decides ToC visibility. Keep current mobile/desktop layouts, controls and navigation routes.

## Accessibility and static output

Surfaces, reader content and native navigation remain usable in static HTML, without JavaScript, in print and under reduced motion. Surface changes preserve token contrast in both themes, including during a theme flip.

Reduced motion explicitly removes decorative displacement and unnecessary animation in both slots, edge effects and ToC entrance; merely leaving the page readable is insufficient. Use appropriate resting/settled presentation while geometry and navigation remain correct. Decorative interaction cannot add keyboard stops, primary actions or assistive content. Hidden ToC presentation cannot leave invisible keyboard targets.

This keeps the existing design system and shared-header entrance duties. UX taste for the ToC rise and approximate header boundary is a manual-review gap; this document makes no rendered-quality or performance claim.

## Confirmed verification seams

The parent confirms three seams; lifecycle additions extend the second, not a fourth seam. Apply TDD when implementation changes behaviour, one public-contract case at a time. This documentation prerequisite adds no tests, renderer, preview or visual check.

### 1. Episode composition

Exercise real Slide declarations: default enter/configured leave precedence, single/omitted declarations, independent inversion/slots; winner's portable settings distinct from outgoing host; stable no-effect edges.

This does not establish browser geometry, CSS cascade or smoothness.

### 2. Clock public interface and existing navigation authority

Supply geometry/time and observe forward/reverse/fast positions, multiple edges, no-effect inverse surfaces and Title departure, incoming-enter winner and sampling tone. Cover nonzero offsets, clamped/collapsed ranges and safe fallbacks, cached resize geometry until 500 ms quiet, settled layout refresh, explicit CSS-input refresh, notifications and no queued callbacks after unsubscribe/disposal.

Navigation coverage includes every supported entry point, repeated/superseded intent, late current-flight read, distinct arrival/interruption/timeout and ordinary geometry after handoff.

This does not establish pixel rendering, actual browser anchor offsets or performance.

### 3. Published rendering and interactive browser behaviour

Extend existing static-markup and post-build structures for anchors, free Scenes, layer order, local hosts and mount lifetime. Inspect three migrated pages across en/de, light/dark and mobile/desktop: pristine initial Title, tall content, reversible/fast scroll, offset/clamped navigation and interruption, ToC default/override, header flip, pointer pass-through, live theme/settings, resize-rest and remounts, incoming-declared outgoing-hosted effects and simultaneous edges. Explicitly inspect reduced-motion displacement removal in slots/effects/ToC.

This does not establish a frame-rate guarantee or authorize changing other Episodes.

### Test discipline

Automated tests execute real code against explicit expected values, with supplied environmental/time inputs and small handwritten browser adapters where needed. Follow the existing success/failure/edge and Arrange/Act/Assert conventions, not private helper calls, mock/spy frameworks, tautological constants or a new browser suite. Keep the fast suite independent of built output.

Downstream implementation runs the existing verification pipeline, build and post-build gates; interactive browser inspection uses DOM/state evidence and condition-based waits, not sleeps. Measure callback/layout behaviour and actual ink rendering costs before claiming smoothness.

## Migration boundary

Only the Context window, Human in the loop and AI capability Explorable pages opt into migration initially. Preserve reader content, links, previews, translations, intended decoration, published routes and anchors. Other Episodes remain unchanged unless opted in. The landing page retains its behaviour and does not join this clock.
