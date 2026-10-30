---
type: feature-guide
title: Resources
stale_after: 2027-04-28T00:00:00Z
---

# Resources

Read before changing the header's Learn menu, the Resource index or the `/resources/` overview. Terms: `GLOSSARY.md` (Resource, Resource index, Template, Guide). Decision record: `docs/adr/0019-resources-overview.md`. Specs: #404, #450 (Guides).

A **Resource** is every public, listed item: an Episode, an Event, an Explorable page, a Guide, an Episode template or a Master slide.

## Learn menu

The header reads Explorables, Events, Learn (Episodes, Guides, Resources), then the Dashboard (English only).

- Learn is a trigger only; no `/learn/` route exists.
- It is built on shadcn's `navigation-menu` (Radix), beside the other components in `ui/`: it opens, moves and closes by keyboard and announces its links as links.
- Below `lg` Learn shows as a labelled group with its three links in the menu panel, with no nested toggle.
- Learn is active on Episode, Guide and Resource routes, reusing NavLink's section matching.
- Labels are Translation keys, `nav.explorables` ("Explorables" in both locales) and `nav.learn` ("Learn", "Lernen"); `nav.guides` ("Guides", "Anleitungen"); Episodes and Resources keep theirs.

## Resource index

A projection over the page catalogue's lists, never stored: `resourceIndex()` in `src/page-assembly/resources-overview/resource-index.ts` maps every listed page to one `ResourceEntry` per locale the page is exported in (shape in `resource-index.pure.ts`). Because it derives from the lists, it cannot hold a page the site does not list.

- Entry fields: `kind`, `slug`, `title`, `description`, `tags` (lead Tag first), `route` (locale-neutral path), `url` (`route` in the entry's `locale`), `locale`. Plain data, so a later machine-readable index serializes it as is.
- `kind` is one of `RESOURCE_KINDS`: `episode`, `event`, `explorable-page`, `guide`, `episode-template`, `master-slide` (a Template's kind is its type).
- Title and description are each composition's own words (Episode, Explorable page, Guide, Template) or the Event's own words (`eventCopy`); no second copy exists.
- An announced Episode with no page yet has no URL and is not in the index. Templates keep their URLs (`/episode-templates/<slug>/`, `/master-slides/<slug>/`).
- Tests: `resource-index.test.ts` (fast suite) holds the index to the catalogue's listed pages.

## Kind filter

`/resources/` (`ResourcesOverviewPage`, design-ADR 0019) renders the index for the visitor's locale as cards, with a search, a kind filter, Tag chips and a grid or list switch. The kind filter is the shared `TagToggles` chip control, one chip per kind with its count (`data-resource-kind-filter`); chips combine with OR within the kind group, and the search, kinds and Tags combine with AND (`resources-overview.pure.ts`). Every card is in the server HTML; filtering only toggles `hidden`. Tests: `tests/post-build/resources.build.test.ts` (every kind with a listed page, chips and counts, both locales) and `tests/browser/resources-filter.browser.test.ts` (a chip narrows to one kind). UX taste of the menu and the filter is held by review only, the product vision's known gap.

## Guides

A Guide (#450) is its own record kind: records in `src/content-store/guides/<slug>.ts`, compositions in `src/episodes/guides/<slug>/`, `npm run registry` regenerates `guide-registry.generated.ts`. `/guides/` (`src/page-assembly/guides-overview/`) lists every public Guide, and the Resource index lists it under the kind `guide` ("Guides", "Anleitungen"). A Guide's own page, `src/page-assembly/guide/` through the one Episode container at `/guides/<slug>/`, lands with the first Guide, together with its route pair and `guideVideo` in the store: static export refuses a dynamic route whose static params are empty. The steps: `skills/new-episode/references/implement-episode-init.md`, Guides. Tests: `tests/post-build/guides.build.test.ts`.

## Today

The Template record kind (#412) is `src/content-store/templates/` with compositions in `src/episodes/templates/`; `npm run registry` regenerates `template-registry.generated.ts`. The three Explorable pages live at `/explorables/` (`docs/features/explorables/README.md`). The Learn menu and the Resource index are built (#404, #413).
