---
type: feature-guide
title: Resources
stale_after: 2027-04-28T00:00:00Z
---

# Resources

Read before changing the header's Learn menu, the Resource index or the `/resources/` overview. Terms: `GLOSSARY.md` (Resource, Resource index, Template). Decision record: `docs/adr/0019-resources-overview.md`. Spec: #404; what #404 builds is marked "planned, #404".

A **Resource** is every public, listed item: an Episode, an Event, an Explorable page, an Episode template or a Master slide.

## Learn menu

The header reads Explorables, Events, Learn (Episodes, Resources), then the Dashboard (English only).

- Learn is a trigger only; no `/learn/` route exists.
- It is built on shadcn's `navigation-menu` (Radix), beside the other components in `ui/`: it opens, moves and closes by keyboard and announces its links as links.
- Below `lg` Learn shows as a labelled group with its two links in the menu panel, with no nested toggle.
- Learn is active on Episode and Resource routes, reusing NavLink's section matching.
- Labels are Translation keys, `nav.explorables` ("Explorables" in both locales) and `nav.learn` ("Learn", "Lernen"); Episodes and Resources keep theirs.

## Resource index (planned, #404)

A projection over the page catalogue, never stored: every listed page maps to one serializable `ResourceEntry` (kind, title, description, Tags, URL, locale). Title and description are each composition's or Event's own words. Because it derives from the catalogue, it cannot list a page the site does not list. Templates keep their URLs (`/episode-templates/<slug>/`, `/master-slides/<slug>/`).

## Kind filter (planned, #404)

`/resources/` renders the index with a kind filter: Episodes, Events, Explorable pages, Episode templates, Master slides. UX taste of the menu and the filter is held by review only, the product vision's known gap.

## Today

`/resources/` lists the Templates (Episode templates and Master slides) under the header item "Resources", with a type filter, as `docs/adr/0019-resources-overview.md` decided. The three Explorable pages left it for `/explorables/` (`docs/features/explorables/README.md`); the umbrella listing is planned, #404.
