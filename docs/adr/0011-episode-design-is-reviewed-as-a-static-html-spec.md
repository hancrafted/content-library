---
type: design-adr
status: proposed
---

# Episode design is reviewed as a static HTML Spec

The Specification Stage writes one Spec, `docs/episodes/<slug>/spec/spec.html`: a static page that shows every Slide with two or three Options, styled with the site's own tokens, beside the Slide's title, Voice script and Speaker notes. Han ticks Options and dictates a note per Slide into the page, saves the review as a `feedback.md` round, and approves the Spec once every Slide has one pick. From that Gate on the Spec is the Episode's only source until Promotion. The markdown build spec and design spec it replaces showed the design as ASCII wireframes inside prose, so the design was approved unread. Issue #209.

## Decisions

1. **One page, two or three Options per Slide.** Each Option is a true alternative in layout, visual metaphor or chart type, with a visible id (`3b`), a mock, a figcaption with its reason and build cost (library entry, Master slide copy or Scene), and build notes naming parts, tokens, props and i18n keys. Exactly one Option per Slide is recommended; after the Gate exactly one is picked. Options are desktop width, light theme, English and static unless the Slide is about motion, and use token classes only (FE-011).
2. **The page is the frontmatter's equivalent.** A JSON meta block, `<script type="application/json" id="spec-meta">`, carries `type`, `title`, `status`, `generated`, `locale`, `brief` and `verified`, read with the gate tiers of design-ADR 0005.
3. **One shared review asset.** `skills/new-episode/assets/spec-review.html` is the review form, inlined verbatim between its `spec-review:start` and `spec-review:end` markers; the per-Slide fields join it by `form="spec-review"`: a checkbox `pick:<slide-slug>` per Option, a note `note:<slide-slug>` per Slide and one `note:visual-language`. Designers never write the form.
4. **The contract is a test, not markdown-harness.** A pure Spec check (`src/lib/episode-spec.pure.ts`), run from the staging-folder check over every Episode folder and the sample Episode, enforces the structure: Slides and Sections slugged as the Dossier's h3s and h2s before the Gate, Option counts and ids, the recommended and picked marks, figcaptions and build notes, Voice script items, resolving citations, no hex colour or arbitrary Tailwind value in an Option, the meta block, the asset and its fields, and no `dossier.md` beside an approved Spec. The `write-spec` rubric keeps the judgement lines.
5. **The Spec replaces the Dossier at its Gate.** The approval commit deletes `dossier.md`; Build reads the Spec alone, PR-loop changes land in it first, and Promotion writes each Slide's words from it into `slide.md`.

## Considered options

- **Keep markdown with images per Option:** rendering images is a step per Option and the words sit apart from the pictures. Rejected.
- **Pick inside the dashboard:** couples the review to a running app and a backend. Out of scope for now.

## Agent-decided (contest in review)

- Markup is addressed by `data-spec` attributes (`section`, `slide`, `option`, `mock`, `build-notes`, `voice-script`, `speaker-notes`, `visual-idea`), `data-number`, `data-option`, `data-recommended`, `data-picked` and `data-source`, so the check reads roles, not styling classes.
- The asset compares with whitespace collapsed, so Prettier may reformat a Spec under `docs/episodes/`.
- The sample Spec carries an inline fallback stylesheet in a CSS layer declared before `design.css`, so it reads in system colours when opened without the compiled tokens.

## Consequences

- During the expand step `spec/spec.md` and `spec/design-spec.md` and their markdown-harness rules stay; the pipeline cutover removes them with `write-design-spec`.
- Design-ADRs 0004 and 0008 are amended: feedback and Promotion read the Spec, and the Spec is one HTML file.
