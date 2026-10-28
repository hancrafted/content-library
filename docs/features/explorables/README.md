---
type: feature-guide
title: Explorables
stale_after: 2027-04-28T00:00:00Z
---

# Explorables

Read before building, changing or reviewing an Explorable or an Explorable page. Terms: `GLOSSARY.md` (Explorable, Explorable page, Preset). Binding code rules: the Archgate ADR on Explorable content (`.archgate/adrs/FE-012-explorable-explanation-content.md`). Spec: #404; what #404 builds is marked "planned, #404".

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

Test: one shared browser suite runs against the last Slide (every option on) of each Explorable page: fit at the Slide frame, 390px and 1440px with no horizontal overflow; axe clean; reduced motion shows the end state; renders with every off-origin request blocked. No per-Preset spec is required (planned, #404).

## Explorable page

A page behaves like an Episode: table of contents, Context drawer, Slide kit, Speaker notes citing a Research question or a high-trust Source, and a YouTube Video played from the Title slide (at most one per locale, the `youtube` field of the Episode). Its content is what makes it a product.

- **Slug.** The page's slug is its primary Explorable's folder slug. The content store refuses a page whose slug names no Explorable (planned, #404).
- **URL.** `/explorables/<slug>/`, listed on `/explorables/`, both locales, public, indexed, in the sitemap (planned, #404). Until then the three pages (Context window, Human in the loop, AI disciplines) sit under `/explorable-explanations/`.
- **Other Explorables.** Its Slides may show any Explorable; the product, not the code, decides what a page covers.
- **Home link.** An Explorable shown in any Slide links "Explore it →" to the page whose slug equals its own, when one exists. Derived, no stored pointer (planned, #404).
- **Sections.** A Section's section slide may be switched off, so the page does not repeat its title (`GLOSSARY.md`, Section). The Title slide stays: it plays the Video.

### Page convention

Convention, not enforced. The template is `/episode-templates/explorable-page/` (planned, #404):

1. Title slide whose title states the payoff.
2. A hook Section that lands the value in its first Slides.
3. What it is, why it matters, how to use it.
4. A last Slide that shows the primary Explorable with every option on, so the visitor plays with all of it after the story.

### Short framing

A page is the landing for a YouTube Short about its Explorable (`IND-2.6`, `docs/steering/product-requirements.md`). The Short is the 60-second version, so the page opens on it: the Title slide's title states the payoff, the hook Section's first Slides repeat what the Short showed, and the visitor reaches the Explorable without scrolling past an introduction.
