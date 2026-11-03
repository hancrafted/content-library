---
type: design-adr
title: Slide presentation and a domain-free transition clock
status: proposed
---

# Slide presentation and a domain-free transition clock

Reusable Slide presentation needs independent authored capabilities and one geometry clock, while Scenes retain creative freedom. Episode composition resolves neighbouring declarations; the outgoing wrapper owns rendering, and the existing navigation authority owns intent. A domain-free clock supplies presentation measurements to independent consumers.

## Approval gate

This is a proposal, not an exception to binding Archgate rules. The feature specification and testing seams in [#480](https://github.com/hancrafted/content-library/issues/480) are confirmed; [#481](https://github.com/hancrafted/content-library/issues/481) requires separate governance approval before governed implementation.

**Required human decision:** Han must approve this record and the reconciliation below, including shared Slide configuration, geometry-driven tone beyond the Title slide, presentation lifetime outside removable Scenes, and the local layer ladder. Record his explicit approval with its source and the version approved. An agent must not supply a human verification entry or infer approval from a request to execute the epic.

**Implementation gate:** until that approval exists and the owning Archgate records express the approved disciplines, implementations crossing those contracts are blocked. The existing records remain binding. Review approval, passing checks and a proposed design-ADR do not replace human approval.

## Ownership and trade-off

The [contract reference](../features/slide-transitions.md) owns authoring, geometry, lifecycle, signals and downstream acceptance details. This record owns the architectural choice, rationale and governance reconciliation.

- **Slide master:** optional Slide declarations, frame and presentation types.
- **Episodes composition:** linear resolution of adjacent declarations; Title departure and ToC policy.
- **Existing wrapper/container:** stable anchors, measurement targets, presentation hosts, mount sizing and page-instance lifecycle.
- **Existing observer, zone store and URL-state authority:** active Slide, zones and navigation intent/lifecycle.
- **Shared clock:** domain-free edge measurements and progress; Episodes supplies domain-free inputs.
- **Driver/adapter attached by the container's client leaves:** browser geometry/CSS-input reads and generic CSS-signal publication.
- **Independent consumers:** effect rendering, header colours and ToC entrance; each owns its presentation.

These are responsibilities, not a required new folder tree, provider hierarchy or serialization format. Server declarations stay server-side; runtime descriptors and JSX cross only permitted React seams. The container, wrappers and Scenes stay server-default, with browser work at leaf boundaries. Shared code imports no Episode record, schema or Title policy; React stays out of `lib/`.

### Alternatives

- **A reusable hero layout:** makes mechanics depend on a Scene shape and cannot serve a freely composed middle Slide.
- **Effect-owned measurement:** leaves surfaces without effects unmeasured and gives chrome competing observers.
- **An Episode overlay:** loses local stacking and simultaneous edge hosts; incoming declaration precedence cannot determine where rendering lives.
- **CSS-only clock output:** couples consumers to browser state and hides a deterministic public testing seam.
- **A second navigation controller:** duplicates intent, arrival and interruption decisions that the URL-state authority must own.

The chosen boundary costs a resolved composition plan and explicit browser adapters. In return, copied Slides carry their declarations and settings, effects remain replaceable within the named family, and page chrome does not import rendering mechanics.

## Governance reconciliation for human review

The following is proposed discipline text, not an operative amendment. Use the ADR-authoring skill to reconcile each owning record after approval; retain its identity and update affected summaries, diagrams, Do's/Don'ts and review duties together. Do not remove checks or weaken boundaries to make implementation pass.

### FE-004: architecture and configuration

[FE-004](../../.archgate/adrs/FE-004-slide-architecture.md), Decision 3.4 and 3.5 and module diagrams:

> The Slide master owns optional presentation configuration and frame types. The existing wrapper/container owns composition mechanics and page-scoped presentation adapters. Domain-free shared measurement receives plain inputs from Episodes and knows no Episode or Title concept.

Decision 5.4:

> A Slide MAY declare a semantic surface tone independently of enter/leave effects and decorative slots. The container's single presentation adapter owns the page-tone channel, derived from surface geometry at the supplied viewport sampling line. Page chrome follows that channel; Scenes never style chrome or infer tone from computed colours.

Decision 6:

> Optional presentation configuration and the domain-free clock boundary are permitted as defined by design-ADR-0022. Scene shape, one-container ownership, downward imports and the requirement for an ADR for other shared-shape/module changes remain binding.

### FE-009: hosts, Backdrop and layers

[FE-009](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md), Decisions 1, 3 and 4 and split/mount descriptions:

> The server wrapper owns stable geometry and local presentation hosts. Removable Scene content retains its mount boundary and kept height. A resolved edge host MUST remain available throughout its geometric interval, independently of Scene mounting; it MUST stay inside the outgoing wrapper's stacking context. Wrappers grow with content, never clip and never create internal scrollbars.

Decision 6.3:

> The page's single presentation adapter MUST own tone publication and cleanup for its page instance. Tone comes from authored surfaces and geometry, independently of the active-Slide zone or effect selection. Zones and active-Slide authority remain unchanged.

Decision 7 and Backdrop description:

> Rear decoration MUST use `SlideBackdrop` and preserve clipping, pointer pass-through, assistive exclusion, mobile opt-in, print exclusion and pause duties. Wrapper-owned surface/effect hosts MUST NOT depend on the removable Backdrop or Scene subtree for their geometric lifetime.

Decision 8 and ladder:

> Within an isolating Slide wrapper, order MUST be surface, rear Backdrop decoration, primary Scene content, resolved outgoing edge effect, front decoration. All five are local rungs below page chrome; front decoration never rises above portal popovers, sheets or dialogs. Effects MUST NOT become an Episode overlay.

The ladder reconciliation must assign and document concrete local rungs in FE-009 without changing the existing page-chrome rungs: contents/non-modal drawer/talk player/trigger at 40, portal/header at 50, scrim at 60, sheets/mobile drawer at 70, native dialogs in the top layer. The proposed local rungs are surface at -20, rear Backdrop at -10, primary content at auto, edge effect at 10 and front decoration at 20, each contained by its isolating wrapper. Review verifies content cannot escape that ordering.

### Retained disciplines

- [FE-002](../../.archgate/adrs/FE-002-episode-page.md): one container, free JSX, typed kit, existing header modes, translation ownership and published anchors. Optional mechanics are not a Slide-type renderer.
- [FE-001](../../.archgate/adrs/FE-001-state-management.md): one history writer and active-Slide reader; presentation measurements are transient memory, with no new persistence key. An additive correlated lifecycle belongs to the existing URL authority.
- [FE-006](../../.archgate/adrs/FE-006-server-client-boundary.md), [FE-005](../../.archgate/adrs/FE-005-static-export-contract.md) and [FE-007](../../.archgate/adrs/FE-007-module-layering.md): leaf clients, serializable crossings, complete static output, downward imports and sealed Slide folders. Provider placement, hydration coordination and safe reattachment are implementation choices under those disciplines.
- [FE-011](../../.archgate/adrs/FE-011-design-tokens.md): live theme-aware colour tokens, governed type roles and Slide-local overrides. Surface overrides preserve authored contrast semantics or carry a matching tone declaration.
- [design-ADR-0012](0012-slide-header-and-play-once-motion.md): header/Scene entrance policy remains distinct from reversible surface transitions. Decorative slots do not introduce a second Scene entrance or change shared-header ownership.

No amendment to these retained disciplines is requested. Any implementation that needs a broader exception must stop for its own governance decision.

## Consequences and enforcement

- A winning declaration and its portable settings can belong to the incoming Slide while its rendering host belongs to the outgoing Slide. Configuration and host lifetime must both survive distant Scene unmounting.
- Effect-independent geometry adds work even on edges with no selected renderer; it keeps tone and Title departure meaningful.
- Navigation settlement requires reachable-position evidence, correlation and distinct terminal outcomes; a timer alone cannot certify arrival.
- Contract validation uses the parent's three confirmed public seams, with additive lifecycle cases at the existing authority. No private-helper tests or new browser suite are required.
- Document gates validate document shape, not architectural approval or rendered behaviour. A clean gate never grants the blocked implementation permission.
- UX taste remains a manual-review gap: restrained ToC motion and approximate header/ink alignment need human judgment on rendered pages in both themes. Browser smoothness requires measurement; a pure clock test cannot establish it.

## References

- [Slide presentation contracts](../features/slide-transitions.md) — proposed feature contract and downstream verification.
- [Product vision](../steering/product-vision.md) — architecture, agent legibility and escalation.
- [Domain docs](../agents/domain.md) — distinction between design-ADRs and binding Archgate records.
