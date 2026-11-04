---
type: design-adr
title: Slide presentation and a domain-free transition clock
status: accepted
---

# Slide presentation and a domain-free transition clock

Reusable Slide presentation needs independent authored capabilities and one geometry clock, while Scenes retain creative freedom. Episode composition resolves neighbouring declarations; the outgoing wrapper owns rendering, and the existing navigation authority owns intent. A domain-free clock supplies presentation measurements to independent consumers.

## Human acceptance

**Approver:** Han. **Decision:** “approved”, in response to “Please approve design-ADR 0022 and its FE-004/FE-009 reconciliation in #488 so implementation can proceed.”

**Evidence:** explicit approval supplied in the orchestration session and recorded in [PR #488's approval comment](https://github.com/hancrafted/content-library/pull/488#issuecomment-6613041527). The evidence comment is dated `2026-11-03T19:09:43Z`; it is not a separate GitHub review. The approved proposal is commit `793ba1b2edfc96d04d8ce11aab9ccb16574bf28b`.

**Scope:** shared Slide configuration, geometry-driven tone beyond the Title slide, presentation lifetime outside removable Scenes, and the local layer ladder. The owning binding records below express that accepted boundary. Acceptance authorizes compliant implementation; it does not certify feature completion, rendered behaviour, code-review passage or permission to merge.

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

## Binding governance

The owning Archgate records are authoritative. Feature contracts do not waive their disciplines, checks or review duties.

### FE-004: architecture and configuration

[FE-004](../../.archgate/adrs/FE-004-slide-architecture.md) owns the architecture map: optional presentation types and composition adapters (§3), the single geometry-driven page-tone channel (§5), and the approved presentation boundary within the ADR requirement for module/shared-shape changes (§6). Its diagrams describe these responsibilities without prescribing React transport or a new container.

### FE-009: hosts, Backdrop and layers

[FE-009](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md) owns stable server geometry and outgoing host lifetime (§1, §3, §4), page-instance tone publication/cleanup (§6), Backdrop safety (§7) and the concrete stacking ladder (§8). Its ladder is the single source of numeric rungs for local presentation and page chrome.

### Retained disciplines

- [FE-002](../../.archgate/adrs/FE-002-episode-page.md): one container, free JSX, typed kit, existing header modes, translation ownership and published anchors. Optional mechanics are not a Slide-type renderer.
- [FE-001](../../.archgate/adrs/FE-001-state-management.md): one history writer and active-Slide reader; presentation measurements are transient memory, with no new persistence key. An additive correlated lifecycle belongs to the existing URL authority.
- [FE-006](../../.archgate/adrs/FE-006-server-client-boundary.md), [FE-005](../../.archgate/adrs/FE-005-static-export-contract.md) and [FE-007](../../.archgate/adrs/FE-007-module-layering.md): leaf clients, serializable crossings, complete static output, downward imports and sealed Slide folders. Provider placement, hydration coordination and safe reattachment are implementation choices under those disciplines.
- [FE-011](../../.archgate/adrs/FE-011-design-tokens.md): live theme-aware colour tokens, governed type roles and Slide-local overrides. Surface overrides preserve authored contrast semantics or carry a matching tone declaration.
- [design-ADR-0012](0012-slide-header-and-play-once-motion.md): header/Scene entrance policy remains distinct from reversible surface transitions. Decorative slots do not introduce a second Scene entrance or change shared-header ownership.

These disciplines remain binding. Any implementation that needs a broader exception must stop for its own governance decision.

## Consequences and enforcement

- A winning declaration and its portable settings can belong to the incoming Slide while its rendering host belongs to the outgoing Slide. Configuration and host lifetime must both survive distant Scene unmounting.
- Effect-independent geometry adds work even on edges with no selected renderer; it keeps tone and Title departure meaningful.
- Navigation settlement requires reachable-position evidence, correlation and distinct terminal outcomes; a timer alone cannot certify arrival.
- Contract validation uses the parent's three confirmed public seams, with additive lifecycle cases at the existing authority. No private-helper tests or new browser suite are required.
- Document gates validate document shape, not human acceptance or rendered behaviour. Passing checks alone never grant an architectural exception.
- UX taste remains a manual-review gap: restrained ToC motion and approximate header/ink alignment need human judgment on rendered pages in both themes. Browser smoothness requires measurement; a pure clock test cannot establish it.

## References

- [Shared Anchor geometry and composed Title selection](0023-shared-anchor-geometry-and-composed-title-selection.md) — accepted follow-up design; shared measurements and composition-owned compatibility, not an implementation claim.
- [Slide presentation contracts](../features/slide-transitions.md) — accepted feature contract and downstream verification.
- [Product vision](../steering/product-vision.md) — architecture, agent legibility and escalation.
- [Domain docs](../agents/domain.md) — distinction between design-ADRs and binding Archgate records.
