/*
 * The Spec contract (design-ADR 0011): the structure of `spec/spec.html` a test
 * can hold, so a reviewer judges taste and the write-spec rubric instead. Each
 * rule reads the page's markup, never its looks:
 *
 * - a JSON meta block, `<script type="application/json" id="spec-meta">`, the
 *   frontmatter equivalent, whose `verified` list carries Han's approval;
 * - the fields the review form posts: per Option a checkbox `pick:<slug>`
 *   valued by the Option id, per Slide a note `note:<slug>`, and one
 *   `note:visual-language`, each tied to the form by `form="spec-review"`. The
 *   form itself comes from the Spec template (assets/spec-template.html), which
 *   the assembler fills, so no page is held to a copy of it: a Spec assembled
 *   before the form moved into the template stays valid;
 * - one `<section data-spec="section" id>` per Dossier h2 and one
 *   `<article data-spec="slide" id data-number>` per Dossier h3, slugged alike,
 *   until the Gate deletes the Dossier and the Spec's own Slides are the list;
 * - one `<article data-spec="title-slide" id="top">` with three Options ided
 *   `0a` to `0c`, each the Title slide's mock and one section slide per Section
 *   (episode-spec-title.pure.ts), checked as a Slide's Options are;
 * - per Slide two or three `<figure data-spec="option" data-option="<n><letter>">`,
 *   each with a figcaption and build notes, exactly one `data-recommended`, at
 *   most one `data-picked` and exactly one once approved, whose checkbox alone
 *   carries `checked` so a locked Slide needs nothing in the next round,
 *   token classes only (no hex colour, no arbitrary Tailwind value, no type size outside the FE-011 roles), and each
 *   `data-spec="context-marker"` naming a Speaker note of its Slide in `data-note`;
 * - every Voice script item a `<strong>` title then its text, every Speaker
 *   note citation `[n]` resolved by a nested `data-source="n"`.
 */
import { SECTION, SLIDE, type Spec, type SpecPage, type SpecStage } from './episode-spec-page.pure.ts';
import { checkSlide, FORM } from './episode-spec-slide.pure.ts';
import { checkTitleSlide } from './episode-spec-title.pure.ts';
import { checkCitations, checkVoiceScripts } from './episode-spec-words.pure.ts';
import { unless, type Finding } from './finding.pure.ts';
import { blocksOf, bodyLines } from './staging-markdown.pure.ts';

/** The Dossier, relative to the Episode's staging folder. */
export const DOSSIER_FILE = 'dossier.md';
const META_FIELDS = ['type', 'title', 'status', 'generated', 'locale', 'brief'];

function checkMeta(text: string | undefined): string[] {
  if (text === undefined)
    return ['The Spec has no meta block: a <script type="application/json" id="spec-meta"> in its head.'];
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return ['The meta block is not valid JSON.'];
  }
  const meta = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  const missing = META_FIELDS.filter((field) => meta[field] === undefined);
  if (missing.length > 0) return [`The meta block lacks "${missing.join('", "')}".`];
  return unless(meta.type === 'spec', `The meta block's type is ${JSON.stringify(meta.type)}, not "spec".`);
}

function dossierSlugs(dossier: string, level: number): string[] {
  return blocksOf(bodyLines(dossier)).flatMap(({ heading }) =>
    heading.level === level && heading.slug !== null ? [heading.slug] : [],
  );
}

/** Each Dossier slug the Spec lacks, then each Spec slug the Dossier lacks. */
function checkSlugsAgree(kind: 'Section' | 'Slide', wanted: readonly string[], present: readonly string[]): string[] {
  const [element, level] =
    kind === 'Slide' ? ['an <article data-spec="slide"', 3] : ['a <section data-spec="section"', 2];
  return [
    ...wanted
      .filter((slug) => !present.includes(slug))
      .map((slug) => `The Dossier ${kind} {#${slug}} has no ${kind} in the Spec: give it ${element} id="${slug}">.`),
    ...present
      .filter((slug) => !wanted.includes(slug))
      .map(
        (slug) =>
          `The Spec ${kind} {#${slug}} is no ${kind} in the Dossier: its id must be the Dossier h${level} slug.`,
      ),
  ];
}

function checkAgainstDossier(spec: Spec, dossier: string): string[] {
  const ids = (selector: string) =>
    spec.pages.flatMap(({ $ }) =>
      $(selector)
        .toArray()
        .map((element) => $(element).attr('id') ?? ''),
    );
  return [
    ...checkSlugsAgree('Section', dossierSlugs(dossier, 2), ids(SECTION)),
    ...checkSlugsAgree('Slide', dossierSlugs(dossier, 3), ids(SLIDE)),
  ];
}

/** The rules held once for the whole Spec: its Title slide and its Visual language, both on its main page. */
function checkWholeSpec(spec: Spec): string[] {
  return [
    ...checkTitleSlide(spec),
    ...unless(
      spec.main.$(`#visual-language textarea[form="${FORM}"][name="note:visual-language"]`).length === 1,
      `The Visual language has no <textarea form="${FORM}" name="note:visual-language">.`,
    ),
  ];
}

/** The Slides and the words of one page, its first Slide the `first`-th in Spec order. */
function checkPage(page: SpecPage, approved: boolean, first: number): string[] {
  const { $ } = page;
  return [
    ...$(SLIDE)
      .toArray()
      .flatMap((element, at) => checkSlide(page, approved, { element, at: first + at })),
    ...checkVoiceScripts($),
    ...checkCitations($),
  ];
}

/** Each page's findings, its Slides numbered on from the pages before it. */
function checkPages(spec: Spec): { file: string; messages: string[] }[] {
  const firsts = spec.pages.map((_, index) =>
    spec.pages.slice(0, index).reduce((count, { $ }) => count + $(SLIDE).length, 0),
  );
  return spec.pages.map((page, index) => ({
    file: page.file,
    messages: checkPage(page, spec.approved, firsts[index]),
  }));
}

/** The Dossier left beside an approved Spec, which the approval commit deletes. */
function staleDossier(isApproved: boolean, dossier: string | undefined): string[] {
  return unless(
    !isApproved || dossier === undefined,
    'dossier.md still sits beside the approved Spec: the Spec is the only source now, so delete it in the approval commit.',
  );
}

/**
 * Checks a Spec against the Spec contract, and against the Dossier while one exists (`dossier`, its text). The stage
 * is the Spec's own; Spec assembly passes the stage it assembled to instead. Whole-Spec findings name the main page,
 * Slide and word findings the page they sit on.
 */
export function checkSpec(spec: Spec, dossier: string | undefined, stage: SpecStage = spec.stage): Finding[] {
  const main = spec.main.file;
  const finding =
    (file: string) =>
    (message: string): Finding => ({ kind: 'spec', file, message });
  return [
    ...checkMeta(spec.meta).map(finding(main)),
    ...(dossier === undefined || spec.approved ? [] : checkAgainstDossier(spec, dossier)).map(finding(main)),
    ...(stage === 'early'
      ? []
      : [
          ...checkWholeSpec(spec).map(finding(main)),
          ...checkPages(spec).flatMap(({ file, messages }) => messages.map(finding(file))),
        ]),
    ...staleDossier(spec.approved, dossier).map(finding(DOSSIER_FILE)),
  ];
}
