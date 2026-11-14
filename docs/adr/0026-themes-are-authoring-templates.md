---
type: design-adr
title: Themes are authoring Templates
status: accepted
---

# Themes are authoring Templates

Han approved Option A of the Ice berg architecture decision on 2026-11-14: a **Theme** is a Template type, a coherent visual vocabulary authors reuse, not a new record kind. Its composition lives with the other Templates, its route is `/themes/<slug>/`, and the existing catalogue, Resource index and Episode container supply listing, locale pairs, metadata, navigation and the Context drawer. No Theme enters an Episode list.

The first Theme, Ice berg, gives each of the ten items in the Waterline cast gallery its own exploration Slide, with the real shared figures and their variants, localized explanations and usage examples. The shared `slide-shared/figure-gallery/` presentation part provides specimen cards and transient pause/replay controls; Scenes still author their own JSX, without a visual schema. These controls are for authoring Templates only: the teaching Episode's motion-on-entry contract remains unchanged. Loops still pause outside the active Slide, while hidden and under reduced motion.

A distinct Theme record kind was rejected: no separate lifecycle is required, and it would repeat the Template store and registry integration. A hard-coded Resource card was rejected: the Resource index remains a projection of listed catalogue pages.
