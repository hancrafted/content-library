---
type: design-adr
status: accepted
---

# Source tree follows the product

The source tree followed technical tiers: `src/components/` mixed product records, page compositions, the landing page's parts and site chrome; `src/lib/` held 186 flat files whose name said nothing; `scripts/` held anything that ran on the repo; and the pipeline's Run log model lived in a skill that `src/` imported from, so an agent new to the repo could not tell what the product was, or where to go. The tree now follows the product as the horizons of `docs/steering/product-vision.md` grow it, and vision rule 2 (agent legibility) is the test for every layout choice.

Settled with Han on 2026-10-26 in a grilling while reviewing the Events and Playlists pull request (spec _Source tree follows the product_), revised the same day after an adversarial architecture review and its grilling, and amended on 2026-10-27 for four readings left open by the area rules. The enforceable part lives in the Archgate ADRs FE-007 _Module layering_ (who imports whom) and FE-004 _Slide architecture_ (the map); the content model it serves is design-ADR-0016.

## Layout

```text
src/
  app/                       routes: bind a URL to one template
  page-assembly/             one folder per page template, lib/, translations.ts
  episodes/                  <slug>/ by-event/ slide-pool/ tooling/ | components/ hooks/ lib/
  events/                    components/ lib/
  explorable-explanations/   one self-contained folder per explanation
  pipeline/                  components/ hooks/ lib/ (pipeline logic, Run log, dashboard)
  content-store/             records, refusals, catalogue/, featured.ts
  shared/                    components/ hooks/ lib/ i18n/ design-system/ page-chrome/
tools/                       verify/ codegen/ deploy/ demo/
skills/                      entry points only for new-episode and episode-promote
tests/                       post-build, browser and boundary suites
```

## Decisions

### Layers and areas

1. **Five layers, importing only downward:** routes, page assembly, product areas, the content store, shared. The product areas are Episodes, Events, Explorable explanations and the pipeline; each is named for what a reader of the vision would call it. `evidence/` arrives only when Concepts first render: no empty placeholder folders.
2. **Tier folders are named the same in every area:** `components/`, `lib/`, `hooks/`, as needed, so one rule pattern binds every area.
3. **Product areas never import each other.** Page assembly composes: it builds one area's parts and passes them to another as props, the one way two areas meet. The Event page hands its Playlist list ready-made Episode cards, so Events never learns what an Episode card is. The one exception is a Slide showing an Explorable explanation, so Slides keep their visuals.
4. **An Explorable explanation is a component, never a page.** Its area has no tier folders (one self-contained folder each), so page assembly reaches an explanation's folder as a Slide does. A standalone explanation page, when horizon 2 gives explanations their own URLs, is a page-assembly template that composes one.
5. **Page assembly reaches an area only through `components/` and `lib/`,** with no per-area barrel, so Slide and Episode internals stay sealed and no barrel bloats a client bundle.
6. **`shared/` knows nothing of the domain,** and is open to every layer and area alike, the pipeline included. It never reads the content store, schemas included; what page chrome needs from the domain (the language toggle's locales) arrives as props.
7. **Product areas and page assembly read the content store directly,** so page assembly stays thin and products stay deep. The store keeps exactly one upward edge: each Episode's metadata file.

### Page assembly

8. **Flat: one folder per template,** plus `lib/` for page metadata and structured data, and the Translation merge at its root. It is regrouped when the new navigation ships. Next.js reserves `src/pages/`, so the layer cannot take that name.
9. **A part one template uses sits beside it,** and is promoted into a product area only when a second template needs it.
10. **One Episode page template** serves an Episode's own page, a tooling page and an Event-scoped Episode page, branching on the page reference's kind.

### Content store and Episodes

11. **The store owns the delivery policy** in `content-store/catalogue/`: slug lists, the Episode id, record routes, the visibility predicate and the page catalogue. The rules deciding what the site shows change together; the Featured slots sit in `content-store/featured.ts` with a refusal of their own.
12. **The Episodes area keeps content apart from code:** `<slug>/`, `by-event/<event-slug>/<slug>/`, `slide-pool/<slide>/` and `tooling/<slug>/`, then the tier folders. Every reserved folder name is refused as a slug.
13. **An Event owns its copies** in its folder under `by-event/` (design-ADR-0016 decisions 3, 4 and 8). The Slide pool holds content Slides several Episodes compose as-is; copying stays the default.

### Tooling, skills and navigation

14. **`scripts/` becomes `tools/`,** one subfolder per purpose. Every `npm run` command keeps its name.
15. **A skill never houses machinery.** The new-episode and episode-promote skills keep only their entry points (argument reading, help, git and clock calls); everything else, the Run commands, the active-run marker, the dev and Spec servers and Spec assembly included, lives in `src/pipeline/lib/`. `src/` never imports `skills/` or `tools/`, and both reach `src/` only through an area's `lib/` or the store's entry; dependency-cruiser checks all three folders. Other skills follow as the opportunity arises; the principle is not an Archgate ADR.
16. **Every area and `tools/` carries a pointer-only `AGENTS.md`:** what the area is, which FE-007 section and dependency-cruiser rules govern its imports, named and never restated. A test checks that every path, ADR id, section and rule it names exists.
17. **Each owner keeps its own Translation files,** merged into one message set; a namespace two owners define fails loading it (FE-003).

## Considered options

| Option                                                                   | Why not                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Areas by horizon                                                         | A horizon is a delivery stage, not a product; the horizons grow areas, and an area would move folders when its horizon passes.                                                              |
| Areas that own their URLs (an area renders its own pages)                | A page showing two areas would make one import the other, and an Explorable explanation could not appear on the landing page without depending on Episodes; page assembly composes instead. |
| Assembly inside the route files                                          | Each page's layout would be written twice, once per locale tree, and routes would stop being thin.                                                                                          |
| Per-area `index.ts` barrels                                              | A barrel drags a whole area into a client bundle and unseals Slide and Episode internals.                                                                                                   |
| Page-assembly folders by navigation section                              | The navigation is not designed yet; seven templates need no grouping, and a menu fixed in the tree would have to move when it ships.                                                        |
| A flat Package tree under `src/packages/`                                | The router owns `src/app/` positions, and in the authored zone layers and tier folders already carry direction; a second positional law adds nothing.                                       |
| Visibility decided by an Episode's folder                                | Publishing a workshop recording would become a move and a rename; a field keeps flipping `visibility` the one edit.                                                                         |
| A copy slug `<organizer>__<date>__<slug>`, kept in step by refusals      | Date and organizer copy Event facts into the slug, and three refusals exist only to keep the copies honest; the folder states ownership instead.                                            |
| The full Event slug as a slug prefix                                     | Repeats the Event in every copy's slug; the `by-event/<event-slug>/` folder carries it once.                                                                                                |
| A hand-written Episode id                                                | One more field to keep in step with the folder; an id derived from the folder can never disagree with it.                                                                                   |
| A shared Episode presented by several Events                             | An Episode is a composition, and "its Event" would have no single answer; sharing content is the Slide pool's job, and a second Event copies the composition.                               |
| An unlisted Episode outside an Event, allowed when a Playlist lists it   | Gives an Event's copies two homes; work in progress stays public with `status: 'upcoming'`.                                                                                                 |
| A free-text organizer                                                    | A typo would pass; a closed list fails at load and is the first step to an Organization record.                                                                                             |
| A source pointer on copies                                               | The Episode record stays clean; in horizon 1 keeping copies right is Han's job, and the pool covers what must stay in step.                                                                 |
| Importing Slides from the original Episode                               | One Episode would import another's folder, and a fix to the original would change its copies unannounced; the Slide pool makes sharing a deliberate promotion (vision rule 4).              |
| `shared/` reading the store's schemas (the delivery policy in `shared/`) | A primitive would learn about Episodes and Events; the policy changes with the records, so it sits in the store's catalogue.                                                                |
| The store importing Featured slots and the tooling list from lib         | Two upward edges for data the store can own: `featured.ts` with a refusal, and a tooling list `npm run registry` generates.                                                                 |
| The Run log model in a skill, imported by `src/`                         | A two-way `src/` ↔ `skills/` edge no check saw; the pipeline area owns its core model and the skill keeps entry points.                                                                     |
| Site-wide Translation files                                              | Every text change touched one far-away file; an owner's words now sit in the folder that renders them.                                                                                      |
| Running `npm run registry` from `verify`, `dev` or `build`               | A gate checks, it does not generate files; the registry staleness test fails instead.                                                                                                       |
| The monorepo now (`apps/web/`, workspaces)                               | Horizon 3 needs it, not today; it has a ticket of its own (_Horizon 3: the repo becomes a monorepo_).                                                                                       |

## Consequences

- The top of `src/` names the product's areas, and a short `AGENTS.md` in each points at the rules that govern it.
- Every import rule runs in `npm run lint:boundaries` at pre-commit and in CI, over `src/`, `skills/` and `tools/`.
- A part one area builds for another travels through page assembly as props: a longer path than an import, and the price of areas that never know each other.
- The built site stayed the same page for page, except the moved Event copies, whose old URLs redirect with 301 in both locales.
- When the navigation ships, page assembly is regrouped and this record gains its section; when Concepts render, `evidence/` joins the areas.
