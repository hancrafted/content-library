---
type: feature-guide
title: Explorables
stale_after: 2027-04-28T00:00:00Z
---

# Explorables

Read before building, changing or reviewing an Explorable or an Explorable page. Terms: `GLOSSARY.md` (Explorable, Explorable page, Preset). Binding code rules: the Archgate ADR on Explorables (`.archgate/adrs/FE-012-explorables.md`). Spec: #404; what #404 builds is marked "planned, #404".

An **Explorable** is the reusable interactive component. An **Explorable page** is the product about one primary Explorable. The long form "Explorable explanation" is the name Wikipedia gives the genre (https://en.wikipedia.org/wiki/Explorable_explanation); this repo says Explorable.

## Per-Explorable guides

One feature doc per Explorable, in this folder:

- `context-window.md`: the context window.
- `human-in-the-loop.md`: the human-in-the-loop Explorable; `agentic-workflow.md` is the authoring guide for its Workflow files.
- `ai-disciplines.md`: the AI disciplines timeline.

## Explorable floor

Every Explorable meets all five, in a Slide, on a phone and on a wide screen:

1. **Data-driven Presets, both locales.** Each Slide's view is data, in English and German (bound by FE-012).
2. **Fits any container width.** It lays out from its container, never from the viewport.
3. **Keyboard and screen-reader usable.** Every control is labelled and reachable. Reduced motion shows the end state, without animating.
4. **No network, no backend.** It runs with every off-origin request blocked. Customization is a file the visitor uploads and downloads, as the human-in-the-loop Explorable does.
5. **Short mode is optional.** An Explorable MAY offer one (zoom, progressive disclosure, pagination, carousel) for a 60-second view; none is required.

Test: `tests/browser/explorable-floor.browser.test.ts` (`npm run test:browser`) runs against the last Slide (every option on) of each Explorable page: fit at the Slide frame, 390px and 1440px with no horizontal overflow; axe clean; reduced motion shows the end state; renders with every off-origin request blocked. A new Explorable page adds its slug to `PAGES` in that file and needs no new spec. A case a page fails and that is too large to fix goes in `EXPECTED_FAIL` there, keyed `<slug>:<case>`, with the follow-up issue's URL; delete the entry when the issue closes. Per-Explorable specs stay for corrected behaviour.

## Explorable page

Record: `src/content-store/explorable-pages/<slug>.ts` (slug, Tags, visibility, optional `youtube` with at most one id per locale, played from the Title slide). Composition: `src/episodes/explorable-pages/<slug>/`. Overview: `/explorables/`, a card per public page. `npm run registry` lists both and the Explorables.

A page behaves like an Episode: table of contents, Context drawer, Slide kit, Speaker notes citing a Research question or a high-trust Source, and a YouTube Video played from the Title slide (at most one per locale, the `youtube` field of the Episode). Its content is what makes it a product.

- **Slug.** The page's slug is its primary Explorable's folder slug. The content store refuses a page whose slug names no Explorable folder `src/explorables/<slug>/`, in a sentence naming the page.
- **URL.** `/explorables/<slug>/`, listed on `/explorables/`, both locales, public, indexed, in the sitemap. The three pages (Context window, Human in the loop, AI disciplines) live there; `/explorable-explanations/*` answers with a 301 to `/explorables/:splat` (`public/_redirects`).
- **Other Explorables.** Its Slides may show any Explorable; the product, not the code, decides what a page covers.
- **Home link.** An Explorable shown in a Slide renders "Explore it →" to the page whose slug equals its own, in the visitor's locale, when that page is built. Derived from the slug join, no stored pointer. The page whose primary it is shows none for itself; its Slides that show another Explorable keep the link. How: the page container (`episode-page-container.tsx`) reads the built pages from the content store and provides them, with the words (`explorableHome.exploreIt` in the container's `i18n/`), to the `ExploreItLink` leaf in `src/shared/components/core-components/explorable-home/`. Each Explorable's server entry (`Context`, `HumanInTheLoop`, `AiDisciplines`) places the link by its own slug; a new Explorable does the same, and no Slide passes anything. Build test: `tests/post-build/explorables.build.test.ts`.
- **Sections.** All three pages switch their section slide off, so a page does not repeat its title: wrap the Section list in `withoutSectionSlide([...])` (`src/episodes/components/slide-master/slide.ts`). The section slide stays the first entry, a Slide folder holding the Section's title, and is not rendered. The first page Slide takes the Section's anchor (`context-window`) and the table-of-contents entry; the Section's other Slides keep `<section>--<slide>`. The Title slide stays: it plays the Video. Pinned by `tests/post-build/section-slide.build.test.ts`.

### Page convention

Convention, not enforced. Start a new page from the Template at `/episode-templates/explorable-page/` (`src/episodes/templates/explorable-page/`): copy it, rename the folder to the page's slug, replace every placeholder word in both locales, and register the page record (above). It follows this list:

1. Title slide whose title states the payoff.
2. A hook Section that lands the value in its first Slides.
3. What it is, why it matters, how to use it.
4. A last Slide that shows the primary Explorable with every option on, so the visitor plays with all of it after the story. The template shows Context window as a stand-in: swap in the page's own Explorable and add the slug to `PAGES` in the browser suite.

The template switches the section slide off in its hook and how-to-use Sections (`withoutSectionSlide`), where it would repeat the title.

### Short framing

A page is the landing for a YouTube Short about its Explorable (`IND-2.6`, `docs/steering/product-requirements.md`). The Short is the 60-second version, so the page opens on it: the Title slide's title states the payoff, the hook Section's first Slides repeat what the Short showed, and the visitor reaches the Explorable without scrolling past an introduction.
