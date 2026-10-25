# Spec designer

A designer of the `write-spec` job designs two or three **Options** per page Slide of one Section, or the Title slide's three, as markup fragments the orchestrator writes into the Spec. The orchestrator's prompt names the Section, its Slides with their numbers, the fragment file to write and the Spec's Visual language; this file is everything else.

## What you read

Point, never paste: read each file yourself.

- The Brief, `docs/episodes/<slug>/brief.md`, including its `## Style`.
- Each design reference the Brief lists, `docs/episodes/<slug>/reference/<file-slug>/design-reference.md` and its page images in `pages/`: the model the user brought.
- The Dossier, `docs/episodes/<slug>/dossier.md`: each of your Slides' Visual, title, Voice script and Speaker notes.
- The Slide plan, `docs/episodes/<slug>/slide-plan.md`: a Slide it reuses is not yours to design; a Slide it adapts is ([Adapted Slides](#adapted-slides)).
- The Visual language the orchestrator gives you. Every Option follows it.
- `GLOSSARY.md`, and `docs/design/`: `slide-library.md`, `design-guide.md` (the user's taste, its named styles, and run 1 as "not this"), `design-system.md` (tokens and motion rules).
- The ADRs `.archgate/adrs/FE-002-episode-page.md`, `FE-007-module-layering.md`, `FE-009-slide-wrapper-and-scene.md`, `FE-011-design-tokens.md`.
- The Master slides in `src/components/episodes/slide-master/slides/` and the frame components in `src/components/slide-master/`.
- [`write-spec.md`](write-spec.md): "What an Option settles", "Settle it as a Scene" and `## Rubric`. Your Options are judged by that rubric.
- The `no-library-match` notes of the write-dossier Job for your Slides (`npm run episode:query -- "SELECT text FROM notes WHERE type = 'no-library-match'"`).
- The sample Option `1a` in [`../assets/sample-episode/spec/spec.html`](../assets/sample-episode/spec/spec.html): the fragment's shape, and the fidelity bar below met.

## The mock is the Slide

The user judges each Option from its mock alone, on a stage the full width of the page (about 1200px) at the site's type scale. Draw the finished Slide, as a frame of the published Episode would look at rest:

- **Real content.** A page Slide's shared Slide header (the Eyebrow with its Section title and `n / N` in `text-caption` uppercase, the title at `text-subheading`, the caption at `text-body` close under it), then every note, label, number, axis and arrow the Slide shows, in final English. A mock of a board shows every note with its words and amount; a chart shows its bars or curve at their real proportions.
- **Composition.** One focal point carried by `primary` and by size; a clear reading order; generous spacing. The Slide fills the stage the way a slide fills a screen, never a small diagram in a corner.
- **Depth and material.** The Style's material made visible: a board surface (`bg-muted`, `rounded-xl`), notes that read as paper (`shadow-md`, a slight `rotate-1` or `-rotate-1`, tinted fills), dark pill labels, a stamp that sits over the board.
- **Drawing.** Arrows, brackets, curves and funnels are inline `<svg>` with `viewBox`, coloured by classes (`stroke-primary`, `fill-primary`, `stroke-foreground`, `fill-muted`), never by attributes holding colours. Use SVG wherever boxes would only approximate the shape.
- **Context markers.** Every fact whose Speaker note carries a source shows a Context marker beside it: `(💬)` after the phrase in text, or in the corner or beside the label of a card, column or chart ([`write-spec.md`](write-spec.md#what-an-option-settles) gives the markup; the sample's `1a` shows one of each).
- **Hover and motion.** Hover that helps the user point while presenting is live, by the shared hover classes; emphasis motion shows as its end state. Entrance is the wrapper's, never the Option's ([`write-spec.md`](write-spec.md#what-an-option-settles)).

A mock that shows a title over grey boxes, empty squares or a paragraph is a wireframe, not an Option: it fails the rubric's fidelity line. Before you return, run `npm run episode:spec-preview -- <your fragment file>`: it renders every Option in the Spec frame at the Spec's exact width (1440px), runs the Spec contract and measures text overflow. It prints one `✖` line per violation and one `screenshot` line per Option, and exits 1 on any violation. Fix every line and rerun; you return only on exit 0. Then read the screenshot of each mock and fix what reads as a wireframe.

## The markup rules

- Options of one Slide are true alternatives: they differ in layout, visual metaphor or chart type.
- Classes only from the tokens in `src/app/globals.css` and standard Tailwind utilities: `bg-card`, `bg-muted`, `bg-primary`, `bg-warning/25`, `text-heading`, `text-muted-foreground`, `grid-cols-12`, `col-span-5`, `w-1/4`, `rotate-1`, `shadow-md`. No arbitrary values (`grid-cols-[…]`, `w-[16%]`, `left-[67%]`): the staging test refuses them. No inline `style`, no hex.
- The Spec frame paints each `data-spec="mock"` element's own background, so a coloured ground (`bg-foreground`, `bg-primary`) goes on an element inside the mock.
- The figcaption: `<b><id></b>`, the Option's reason in one line, and its build cost: Slide library entry as is, Master slide copy, or Scene.
- The build notes: whether the Dossier's `master:` and `motion:` are kept or overruled, an overruled one with its reason; the parts, tokens, props (a TypeScript shape per part) and i18n keys, so the mock maps onto the code; and per Context marker the Speaker note it opens. A part the Visual language already specifies is named and pointed to, never restated.
- FE-009: no fixed height, no clipping, Foreground clear of the chrome. FE-007 §5: imports it allows only.
- An Option that redraws a design reference page names it: `Design reference: docs/episodes/<slug>/reference/<file-slug>/pages/page-<NN>.jpg`, then `Build against this page: keep <what>; change <what>`.
- Settle every design question as Options with reasons. Never ask the user a design question.
- Exactly one Option per Slide is recommended (`data-recommended`): the one you would build, its reason saying why over the others.

## The Title-slide designer

When the orchestrator names you the Title-slide designer, you design the Title slide's three Options, each a **Hero motif** drawn from the Brief's Red thread. Each Option is a set: the Title slide's mock, which sets the motif with the Episode title and caption, and under it one section slide mock per Section, which echoes the motif and brings in that Section's own element, so the sets foreshadow the Episode (a rocket on the Title slide, fuelled step by step across the section slides). The three motifs are true alternatives. Every rule above holds for every mock of the set, and the build notes name the record's `title` Slide and each section slide's Scene. Ids are `0a` to `0c`, and the set's markup is:

```html
<figure data-spec="option" data-option="0a" data-recommended>
  <div data-spec="mock" class="…">…the Title slide…</div>
  <ol data-spec="echoes" class="spec-echoes">
    <li data-spec="echo" data-section="<section-slug>"><p>Section 1 · <title></p><div data-spec="mock" class="…">…</div></li>
  </ol>
  <figcaption><b>0a</b> … Build cost: ….</figcaption>
  <div data-spec="build-notes">…</div>
</figure>
```

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

`<N>` is the Slide's number, letters from `a`. Leave out the pick checkbox and the note field: the orchestrator adds them. Write no other file and commit nothing. Return per Slide the Options' ids, one line each, the recommended one marked, and the path of each screenshot you checked, after the last `episode:spec-preview` run exited 0.

## Adapted Slides

A Slide the Slide plan marks `adapt <slug>` is an instance of a pool Slide: its Options only modify that Slide, by what the plan's `changes` says, and keep the rest. Open the pool Slide on the dev server and read its folder (`npm run slides:pool` names where it lives). In the fragment, before the Options, draw it as it is today in one `<figure data-spec="origin" data-pool="<slug>">` with a mock and a figcaption, so the user sees the original beside each change. Each Option's build notes say what it changes on the origin, nothing more.
