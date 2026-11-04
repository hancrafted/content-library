---
type: design-adr
status: accepted
---

# Magnetic ink is a shared action effect

The landing hero's magnetic ink depended on hero-specific markup and lifecycle, while the Episode card prototype demonstrated the same effect with primary and secondary actions. On 2026-11-04 Han approved one deep, domain-free magnetic ink module: callers opt in explicitly, and the module owns drawing, transitions, proximity, smooth repulsion, scheduling and cleanup. Ink attracts the viewer to an available action; it is not applied to non-actionable decoration.

## Ownership

1. The server-rendered `SiteShell` mounts a small client leaf owning one coordinator per page. It does not become a client module for ink.
2. Shared actionable hosts expose an opt-in; a custom client host attaches through a hook and an explicit element reference. No document-wide selector discovery is used. Registration, pointer input and animation state are transient in memory, never URL or storage state.
3. The coordinator owns cooperation between registered hosts. Drawing, filters and geometry live behind the magnetic ink module's seam; callers do not assemble SVG descendants, schedule frames or calculate collisions.
4. Native links and buttons retain navigation, activation, focus and accessible names. Decorative geometry may determine emphasis, but never intercepts clicks, synthesizes activation or adds another tab stop.
5. A compound card declares its primary and secondary actions locally. The effect owns their visual priority and interruption rules, not their product meaning. Shared ink reads no content-store records, Episode data, locale or Video metadata.
6. Implementation follows the existing shared tiers: drawable leaves and styling under `src/shared/components/`, browser attachment and scheduling under `src/shared/hooks/`, React-free deterministic geometry and transition logic under `src/shared/lib/`. Product-specific words and composition stay with their existing owners.

## Behaviour and first rollout

1. Outside a host, liquid pools at the nearest point on its rounded outline, with irregular stretched droplets and liquid extending inside the host. Neighbouring pools stay anchored and smoothly compress to preserve separation; neither nearest-only ownership nor spring-pressure repulsion is a supported production mode initially.
2. Entering a card carries its liquid to the Open Episode cue and fills it. Approaching its YouTube action produces that action's proximity ink. Hovering YouTube fills it and drains Open Episode to an outline; directly hovering Open Episode adds subtle emphasis. Hovering a card gives it exclusive visual ownership over neighbouring cards.
3. The first rollout covers the landing hero action, featured Episode cards, the `/episodes/` Overview and Episode cards in Event Playlists. The existing shared Episode card is retained. No ink is enabled inside Episode pages or Explorables in this rollout.
4. Activation is local and explicit, although coordination is page-wide. The coordinator batches geometry reads before drawing, avoids per-frame React rerenders and runs frames only while motion is unsettled. It stops or clears work when hidden, offscreen, disabled or disposed; host registrations are removed on unmount.
5. Keyboard and touch retain clear actionable cues without requiring pointer motion; reduced motion and print show readable static states. No additional `IntersectionObserver` is introduced. Future use inside a Slide must respect its existing zone and mount lifecycle.

## Trade-offs and verification

Explicit attachment was chosen over attribute discovery: an opt-in is small for authors, but its activation and disposal remain visible rather than becoming a hidden document scanner. Smooth compression was chosen over nearest-only handover and spring pressure: multiple pools remain responsive without competing bounce motion. The prototype alternatives remain experimental evidence, not configuration obligations.

Han confirmed the coordinator and host attachment as test seams before TDD implementation. Explicit geometry, pointer input and time exercise ownership, compression, travel, fill, interruption and settling; registration and disposal exercise scheduler cleanup and remount isolation. Geometry tests alone do not prove action handoff or cleanup. Interactive inspection verifies native hit targets, keyboard and touch, light and dark contrast, shape, travel and settled motion; visual taste remains a manual-review duty, not a claim made by numerical tests.

## Using the module

`SiteShell` supplies `InkPage`; it passes server-rendered children through the context without importing their implementation into the client bundle. A shared Episode card opts in through `CardShell`'s `ink` flag. Its native primary link remains the card's stretched heading link; `data-ink-primary` marks its visual cue, `data-ink-secondary` its labelled Video link, and `data-ink-label` the text above the fill. These are local role declarations, never document-scanned activation markers.

A custom client action attaches through `useMagneticInk(hostRef, { kind: 'button' })`; a server-authored host can use `MagneticInk` from `src/shared/components/animations/magnetic-ink.client.tsx`, passing its native element as the child. The hook's optional `enabled` callback gates an existing lifecycle; `onProximity` reports strength without making ink know about that lifecycle. The hero uses these to preserve the promotion timeline's readiness gate and paper draining. Reach is the only geometric caller setting; shape, filters, compression and timing are implementation-owned.

Binding placement, client, state and motion constraints remain in the Archgate records: [Slide Architecture](../../.archgate/adrs/FE-004-slide-architecture.md), [Server/Client Boundary](../../.archgate/adrs/FE-006-server-client-boundary.md), [Module Layering](../../.archgate/adrs/FE-007-module-layering.md), [State Management](../../.archgate/adrs/FE-001-state-management.md), [Slide Wrapper and Scene](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md) and [Testing](../../.archgate/adrs/ARCH-003-testing.md). This decision adds no new tier, route, Slide shape or observer exception.
