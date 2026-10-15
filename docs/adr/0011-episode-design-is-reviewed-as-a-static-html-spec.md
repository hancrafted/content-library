---
type: design-adr
status: proposed
---

# Episode design is reviewed as a static HTML Spec

Han reviewed an Episode's design as a markdown build spec and a markdown design spec whose visuals were ASCII wireframes inside prose. That was slow to read, so the design got approved unread, and visual problems surfaced only after Build, where a redo costs a Section Job and a dev server. The Specification Stage now writes one Spec, a static HTML page that shows every Slide as two or three true-alternative Options, which Han picks from in a native form. From its Gate on, the Spec is the Episode's only source. Issue [#209](https://github.com/hancrafted/content-library/issues/209).

## Decisions

1. **One static page.** `write-spec` writes `docs/episodes/<slug>/spec/spec.html`, self-contained but for a sibling `design.css` compiled from the site's `globals.css`. It replaces `spec/spec.md` and `spec/design-spec.md` (amends design-ADR-0008 §5). It opens with a JSON meta block (the frontmatter equivalent), the Brief's Style, the Visual language and an Episode page section, then one section per Section and one per Slide, slugged as the Dossier headings. Each Slide carries its title, Visual idea, Voice script and Speaker notes with citations in full, beside its Options.
2. **Two or three true-alternative Options per Slide, at low to medium fidelity.** Options differ in layout, visual metaphor or chart type, never only in colour, spacing or copy. Each has a visible id (`3b`), a reason, a build cost and build notes, and exactly one per Slide is recommended. Options settle the on-screen title, layout, visual components, shapes, graphs and charts, and the hard UI calls (hierarchy, density, emphasis). They are shown at desktop width, light theme and English only, with token classes only and no motion unless the Slide is about motion. Dark mode, mobile, German, final body copy and exact spacing are left to Build.
3. **Review through a native form saved as a feedback round.** Per Slide Han ticks zero, one or several Options and dictates a note; a note is required when nothing is ticked. A small Spec server serves the page outside `src/` and the static export, and its form POST writes the next `feedback/<NN>/feedback.md`, in the PR loop's feedback format with `via: spec`. One feedback format serves both reviews and the style harvest.
4. **The Gate loops until every Slide has one pick.** A Slide with exactly one pick is locked. Slides with zero or several picks get a new `write-spec` Attempt that designs fresh Options from the note, for those Slides only. When every Slide has one pick, Han approves the Spec with `approve.ts`, which appends to the meta block's `verified` list.
5. **The Dossier is deleted at the Spec Gate.** The `Gate: approved spec` commit deletes `dossier.md`, so no second truth remains. The Voice script is written before the Spec, as designer context, and loses its own Gate: Han reworks it against the built Slides.
6. **After the Gate the Spec is the only source.** Build reads it alone. PR-loop changes, Voice script changes included, land in the Spec first, then in the implementation (amends design-ADR-0004 §1).
7. **Promotion moves the Spec's words into `slide.md`.** Each Slide's text goes from the Spec into its `slide.md`, and the Episode-level part into the Episode folder; the picked visual already exists as code. The Spec is deleted with Staging (amends design-ADR-0004 §2, and settles design-ADR-0008's open question on `spec/`).
8. **Governance moves from markdown-harness to a contract test plus a rubric.** The markdown-harness rules for the two spec files are removed. A pure Spec check, run from the staging-folder check in `npm run verify`, enforces the page's structure: Slides and slugs, Option count and recommendation, captions and build notes, Voice script items, resolving citations, no hex colours or arbitrary Tailwind values, the meta block and review asset, one pick per Slide once approved, no Dossier beside an approved Spec. The `write-spec` rubric carries the judgement: true alternatives, the Visual language, FE-007, FE-009 and FE-011.

## Considered options

- **Render a view of the Dossier as the review page**, keeping the Dossier the source. Rejected: the Options and their picks have no home in the Dossier, and a rendered view of one file next to two spec files keeps three truths alive.
- **Let the Spec coexist with the build spec and design spec as tickets.** Rejected: Build would read three files that can disagree, which is what the single source is meant to end.
- **Free-form HTML per Episode.** Rejected: designers would each invent a review form, and a reviewer agent could not check structure. One shared review asset and a contract test make every Episode's page behave the same.
- **Save the review by clipboard or the File System Access API.** Rejected: the clipboard needs a paste step that loses work, and File System Access is Chromium-only and asks for a folder each time. A native form posted to a local server writes the round with no copy and paste.
- **Promote the Spec whole** into the code folder. Rejected: a Slide is a self-contained folder (design-ADR-0001), and an Episode-wide Spec would claim text that a Slide copied into another Episode also carries. Promotion keeps one owner per Slide by moving the words into `slide.md`.

## Consequences

- Han's reviews per Episode become three: the Brief, the Spec and the PR loop. `customize-pipeline` keeps its Gate for a few more Runs.
- The pipeline template drops `write-design-spec`, and `write-voice-script` loses `gate: human`. Per-run pipelines already approved keep their own `pipeline.yml`.
- **Brief** and **Spine** are kept in step with the Dossier until the Spec Gate and with the Spec after it.
