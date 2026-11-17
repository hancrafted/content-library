// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { SECTION, SLIDE, type Spec, type SpecPage, type SpecStage } from './episode-spec-page.pure.ts';
import { checkSlide, FORM } from './episode-spec-slide.pure.ts';
import { checkTitleSlide } from './episode-spec-title.pure.ts';
import { checkCitations, checkVoiceScripts } from './episode-spec-words.pure.ts';
import { unless, type Finding } from './finding.pure.ts';
import { blocksOf, bodyLines } from './staging-markdown.pure.ts';

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

function checkWholeSpec(spec: Spec): string[] {
  return [
    ...checkTitleSlide(spec),
    ...unless(
      spec.main.$(`#visual-language textarea[form="${FORM}"][name="note:visual-language"]`).length === 1,
      `The Visual language has no <textarea form="${FORM}" name="note:visual-language">.`,
    ),
  ];
}

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

function checkPages(spec: Spec): { file: string; messages: string[] }[] {
  const firsts = spec.pages.map((_, index) =>
    spec.pages.slice(0, index).reduce((count, { $ }) => count + $(SLIDE).length, 0),
  );
  return spec.pages.map((page, index) => ({
    file: page.file,
    messages: checkPage(page, spec.approved, firsts[index]),
  }));
}

function staleDossier(isApproved: boolean, dossier: string | undefined): string[] {
  return unless(
    !isApproved || dossier === undefined,
    'dossier.md still sits beside the approved Spec: the Spec is the only source now, so delete it in the approval commit.',
  );
}

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
