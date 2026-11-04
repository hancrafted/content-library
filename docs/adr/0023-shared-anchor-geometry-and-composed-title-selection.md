---
type: design-adr
title: Shared Anchor geometry and composed Title selection
status: accepted
---

# Shared Anchor geometry and composed Title selection

Navigation and Slide presentation independently interpret browser geometry, while legacy-versus-authored Title selection is spread across composition, rendering and clock setup. Share Anchor geometry meaning in a dedicated domain-free module and resolve Title compatibility once during Episode composition. This gives measurement rules and compatibility decisions locality without combining navigation and transition policies.

## Human acceptance

Han selected a dedicated shared geometry module, identical normalization and composition-owned Title selection during the architecture grill following [Reusable Slide backgrounds, enter/leave transitions and a decoupled transition clock (#480)](https://github.com/hancrafted/content-library/issues/480). He confirmed the complete shared understanding with "ok" on `2026-11-04T15:32:01.990+08:00`.

This accepts the design, not its implementation or rendered behavior. The reviewed implementation was `cee1dcc7`; the refactor has not been implemented by this record.

## Decision

1. A dedicated module under `src/shared/lib/` owns the shared interpretation of measured Anchor geometry and achievable landing calculations. Browser adapters supply measured values; the domain-free implementation reads no DOM or browser globals.
2. Navigation arrival policy remains in the existing URL-state authority. Transition start/end adjustments, range normalization and progress remain clock policy. Neither policy moves into the shared geometry module.
3. Both adapters use identical normalization: preserve valid finite values, including valid negative lengths; resolve percentage scroll padding against viewport height; interpret `auto` padding as zero; fall back to zero for invalid values. This removes adapter-specific permissive parsing, not valid browser behavior.
4. Episode composition resolves legacy-versus-authored Title selection once. The Title renderer and clock setup consume the resolved result rather than reconstructing the selection from authored declarations.
5. Existing Episode declarations and legacy Title behavior remain compatible. Non-Title presentation and explicit Table of contents settings independently retain their ability to enable the clock. The landing page remains unchanged.
6. Test the shared geometry through its interface and Title selection through real Episode composition. Retain existing navigation, static rendering and interactive browser checks; pure calculations alone do not establish browser behavior.

## Alternatives and cost

- Sharing only CSS-length parsing leaves achievable landing agreement distributed across adapters.
- Housing shared geometry in the surface-clock module makes navigation depend on a transition-oriented module rather than neutral geometry.
- A separately consulted Title-policy module shares implementation but leaves downstream callers coordinating selection inputs. Composition already resolves transitions and can own the compatibility decision without another module.
- Migrating legacy Episode declarations to remove their rendering path expands the refactor into content migration; compatibility is retained instead.

The chosen design costs one shared module and an internal resolved composition result. Its leverage comes from two existing browser adapters using one geometry interpretation, not a hypothetical adapter framework.

## Relationship to the accepted presentation architecture

This is a bounded refinement of [Slide presentation and a domain-free transition clock](0022-slide-presentation-and-transition-clock.md), providing the design record required by [FE-004-slide-architecture](../../.archgate/adrs/FE-004-slide-architecture.md) for the new module and internal composition shape. It does not waive binding rules or change tiers, authored Slide configuration, Scene freedom, the one container, retained outgoing hosts, navigation authority or the single page-tone publisher.
