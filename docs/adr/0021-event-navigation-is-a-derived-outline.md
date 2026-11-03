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
- Start in Zoom at the current Episode; one central constant sets the default. The top-right vertical-ellipsis menu holds collapse/expand, the applicable zoom command, and an options group with a **Show as Tree** checkbox. Presentation and scope stay transient, never saved preferences; changing either does not move the reader.
- Event navigation exists only under Event-scoped URLs; standalone pages retain their hierarchy. Keep the existing footer Playlist walk and the one Episode container.
- Page assembly supplies the current page's title and route plus an optional localized back label and destination, alongside the outline. Back returns to the current Event from an Event Episode, or the Episodes overview from a standalone Episode; shared chrome never derives that context from URLs, history or canonical Episode records.
- The heading shows the back link above the left-aligned page title; the title returns to the document top. A collapsed rail keeps separate back, menu and up-arrow controls. Pages without a table of contents use a separate site-wide top action.
- Reading progress follows the current Episode, clockwise around the panel border from top-centre. It is normalized to the current perimeter, so changing panel dimensions preserves the percentage; no measurable reading time leaves the border neutral.

## Contextual header

The back destination belongs to the page's navigation context, not to an Episode's content or its Event outline. The same Episode may appear standalone and under different Events; an overview need not be a node in that outline. Passing plain title/back data keeps the chrome's layout, collapsed behavior and accessibility in one place; rendered heading slots would spread those responsibilities across page templates.

## Trade-off

Two presentations cost two sets of interaction checks, but they share ordering and destinations. Deriving the outline in page assembly keeps Events and Episodes independent, avoids shipping other Episodes' Scenes to the browser, and avoids a second registry that could drift.
