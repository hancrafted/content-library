---
type: design-adr
title: Event navigation is a derived outline
status: accepted
---

# Event navigation is a derived outline

An Event-scoped Episode's table of contents can show its Event without becoming a reader of Event records. Page assembly derives one localized Event → Episode → Section → Slide outline at build time, using the existing Playlist, composition registry and anchor placement; page chrome receives only titles, routes and outlines, never Scenes or another content registry.

## Navigation contract

- Include each navigable Episode once, in first-occurrence Playlist order; omit repeats and entries without pages.
- Section and Slide links land directly on their anchors, preserving the Event-scoped route and locale.
- Support both Zoom (Episode → Section at Event scale, Section → Slide at Episode scale) and Tree (Episode → Section → Slide) over that same outline.
- Start in Zoom at the current Episode; one central constant sets the default. The vertical-ellipsis menu changes presentation as transient page state, never a saved preference. Changing presentation or scale does not move the reader.
- Event navigation exists only under Event-scoped URLs; standalone pages retain their hierarchy. Keep the existing footer Playlist walk and the one Episode container.
- Offer an explicit back-to-top action in the table of contents, including its collapsed form; pages without one use a separate site-wide control after scrolling.

## Trade-off

Two presentations cost two sets of interaction checks, but they share ordering and destinations. Deriving the outline in page assembly keeps Events and Episodes independent, avoids shipping other Episodes' Scenes to the browser, and avoids a second registry that could drift.
