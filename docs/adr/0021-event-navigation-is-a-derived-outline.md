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
- Support two scopes over that same outline: the current Episode's Section → Slide view, or the full Event Episode → Section → Slide tree. There is no separate presentation setting.
- Start at the current Episode; one central constant sets the default scope. The zoom icon beside the top-right ellipsis controls the transient scope, with a tooltip above it naming the destination scope. The menu contains collapse/expand with its matching icon, not a duplicate Playlist control. Switching scope never saves a preference, scrolls or navigates.
- Event navigation exists only under Event-scoped URLs; standalone pages retain their hierarchy. Keep the existing footer Playlist walk and the one Episode container.
- Page assembly supplies the current page's title and route plus an optional localized back label and destination, alongside the outline. Back names and returns to the current Event from an Event Episode, the Episodes overview from a standalone Episode, or the Guides overview from a Guide; shared chrome never derives that context from URLs, history or canonical Episode records.
- The heading shows a back arrow and muted, single-line parent label above the left-aligned page title; overflow truncates with an ellipsis, while the link retains the full accessible name. The page title returns to the document top. Omit visible remaining-time text and a redundant Event-title link. A collapsed rail hides the parent text and keeps separate back, scope, menu and up-arrow controls. Pages without a table of contents use a separate site-wide top action.
- Reading progress follows the current Episode, clockwise around the panel border from top-centre. It is normalized to the current perimeter, so changing panel dimensions preserves the percentage. With reading time it is time-weighted; the total includes the Title slide's script even though the outline does not: credit that elapsed time once a body Slide is active. Without reading time, each body Slide (including untitled Slides) has equal weight and progresses with its active-Slide fraction, without inventing minutes. Both reach 100% at completion, not on entry to the last Slide. The full border transitions to the success green token, respecting reduced motion.

## Contextual header

The back destination belongs to the page's navigation context, not to an Episode's content or its Event outline. The same Episode may appear standalone and under different Events; an overview need not be a node in that outline. Passing plain title/back data keeps the chrome's layout, collapsed behavior and accessibility in one place; rendered heading slots would spread those responsibilities across page templates.

## Trade-off

Two scopes share ordering and destinations, with one control for one state. Deriving the outline in page assembly keeps Events and Episodes independent, avoids shipping other Episodes' Scenes to the browser, and avoids a second registry that could drift. Equal Slide weights keep progress useful on scriptless pages without presenting a guessed reading duration.
