# Spec designer

A designer of the `write-spec` job designs two or three **Options** per page Slide of one Section, as markup fragments the orchestrator writes into the Spec. The orchestrator's prompt names the Section, its Slides with their numbers, the fragment file to write and the Spec's Visual language; this file is everything else.

## What you read

Point, never paste: read each file yourself.

- The Brief, `docs/episodes/<slug>/brief.md`, including its `## Style`.
- Each design reference the Brief lists, `docs/episodes/<slug>/reference/<file-slug>/design-reference.md` and its page images in `pages/`: the model Han brought.
- The Dossier, `docs/episodes/<slug>/dossier.md`: each of your Slides' Visual, title, Voice script and Speaker notes.
- The Visual language the orchestrator gives you. Every Option follows it.
- `GLOSSARY.md`, and `docs/design/`: `slide-library.md`, `design-guide.md` (Han's taste, its named styles, and run 1 as "not this"), `design-system.md` (tokens and motion rules).
- The ADRs `.archgate/adrs/FE-002-episode-page.md`, `FE-007-module-layering.md`, `FE-009-slide-wrapper-and-scene.md`, `FE-011-design-tokens.md`.
- The Master slides in `src/components/episodes/slide-master/slides/` and the frame components in `src/components/slide-master/`.
- [`write-spec.md`](write-spec.md): "What an Option settles", "Settle it as a Scene" and `## Rubric`. Your Options are judged by that rubric.
- The write-dossier run-log entry's `No library match:` lines for your Slides.
- The sample Option `1a` in [`../assets/sample-episode/spec/spec.html`](../assets/sample-episode/spec/spec.html): the fragment's shape, and the fidelity bar below met.

## The mock is the Slide

Han judges each Option from its mock alone, on a stage the full width of the page (about 1200px) at the site's type scale. Draw the finished Slide, as a frame of the published Episode would look at rest:

- **Real content.** The on-screen title at `text-heading` or `text-hero`, every note, label, number, axis and arrow the Slide shows, in final English. A mock of a board shows every note with its words and amount; a chart shows its bars or curve at their real proportions.
- **Composition.** One focal point carried by `primary` and by size; a clear reading order; generous spacing. The Slide fills the stage the way a slide fills a screen, never a small diagram in a corner.
- **Depth and material.** The Style's material made visible: a board surface (`bg-muted`, `rounded-xl`), notes that read as paper (`shadow-md`, a slight `rotate-1` or `-rotate-1`, tinted fills), dark pill labels, a stamp that sits over the board.
- **Drawing.** Arrows, brackets, curves and funnels are inline `<svg>` with `viewBox`, coloured by classes (`stroke-primary`, `fill-primary`, `stroke-foreground`, `fill-muted`), never by attributes holding colours. Use SVG wherever boxes would only approximate the shape.
- **Motion** shows as its end state; the build notes describe it.

A mock that shows a title over grey boxes, empty squares or a paragraph is a wireframe, not an Option: it fails the rubric's fidelity line. Before you return, look at each mock rendered at 1440px with the preview command the orchestrator gives you, then `npm run inspect-page -- --url <its url> --width 1440 --clip '[data-option="<id>"]' --out <png>`, and fix what reads as a wireframe.

## The markup rules

- Options of one Slide are true alternatives: they differ in layout, visual metaphor or chart type.
- Classes only from the tokens in `src/app/globals.css` and standard Tailwind utilities: `bg-card`, `bg-muted`, `bg-primary`, `bg-warning/25`, `text-heading`, `text-muted-foreground`, `grid-cols-12`, `col-span-5`, `w-1/4`, `rotate-1`, `shadow-md`. No arbitrary values (`grid-cols-[…]`, `w-[16%]`, `left-[67%]`): the staging test refuses them. No inline `style`, no hex.
- The figcaption: `<b><id></b>`, the Option's reason in one line, and its build cost: Slide library entry as is, Master slide copy, or Scene.
- The build notes: whether the Dossier's `master:` and `motion:` are kept or overruled, an overruled one with its reason; and the parts, tokens, props (a TypeScript shape per part) and i18n keys, so the mock maps onto the code. A part the Visual language already specifies is named and pointed to, never restated.
- FE-009: no fixed height, no clipping, Foreground clear of the chrome. FE-007 §5: imports it allows only.
- An Option that redraws a design reference page names it: `Design reference: docs/episodes/<slug>/reference/<file-slug>/pages/page-<NN>.jpg`, then `Build against this page: keep <what>; change <what>`.
- Settle every design question as Options with reasons. Never ask Han a design question.
- Exactly one Option per Slide is recommended (`data-recommended`): the one you would build, its reason saying why over the others.

## What you return

Write one file, the fragment file the orchestrator names, holding per Slide, in Dossier order:

```html
<!-- slide: <slide-slug> -->
<figure data-spec="option" data-option="<N><letter>" data-recommended>
  <div data-spec="mock" class="…">…</div>
  <figcaption><b><N><letter></b> … Build cost: ….</figcaption>
  <div data-spec="build-notes">…</div>
</figure>
```

`<N>` is the Slide's number, letters from `a`. Leave out the pick checkbox and the note field: the orchestrator adds them. Write no other file and commit nothing. Return per Slide the Options' ids, one line each, the recommended one marked, and the path of each screenshot you checked.
