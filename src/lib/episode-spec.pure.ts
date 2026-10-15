/*
 * The Spec contract (design-ADR 0011): the structure of `spec/spec.html` a test
 * can hold, so a reviewer judges taste and the write-spec rubric instead. Each
 * rule reads the page's markup, never its looks:
 *
 * - a JSON meta block, `<script type="application/json" id="spec-meta">`, the
 *   frontmatter equivalent, whose `verified` list carries Han's approval;
 * - the review asset `skills/new-episode/assets/spec-review.html` inlined
 *   between its markers, and the fields its form posts: per Option a checkbox
 *   `pick:<slug>` valued by the Option id, per Slide a note `note:<slug>`, and
 *   one `note:visual-language`, each tied to the form by `form="spec-review"`;
 * - one `<section data-spec="section" id>` per Dossier h2 and one
 *   `<article data-spec="slide" id data-number>` per Dossier h3, slugged alike,
 *   until the Gate deletes the Dossier and the Spec's own Slides are the list;
 * - per Slide two or three `<figure data-spec="option" data-option="<n><letter>">`,
 *   each with a figcaption and build notes, exactly one `data-recommended`, at
 *   most one `data-picked` and exactly one once approved, and token classes
 *   only: no hex colour, no arbitrary Tailwind value;
 * - every Voice script item a `<strong>` title then its text, every Speaker
 *   note citation `[n]` resolved by a nested `data-source="n"`.
 */
import { load, type CheerioAPI } from 'cheerio';
import { checkSlide, FORM } from './episode-spec-slide.pure';
import { checkCitations, checkVoiceScripts } from './episode-spec-words.pure';
import { unless, type Finding } from './finding.pure';
import { metaGateTier } from './staging-file.pure';
import { blocksOf, bodyLines } from './staging-markdown.pure';

const SPEC_FILE = 'spec/spec.html';
const DOSSIER_FILE = 'dossier.md';
/** Where the review asset lives, as a finding names it. */
const REVIEW_ASSET_FILE = 'skills/new-episode/assets/spec-review.html';
const ASSET_START = '<!-- spec-review:start -->';
const ASSET_END = '<!-- spec-review:end -->';
const META_FIELDS = ['type', 'title', 'status', 'generated', 'locale', 'brief'];
const SLIDE = 'article[data-spec="slide"]';

/** The meta block's JSON as text, or undefined when the page has none. */
function metaText($: CheerioAPI): string | undefined {
  const block = $('script#spec-meta[type="application/json"]');
  return block.length === 0 ? undefined : block.text();
}

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

/** Markup with its whitespace collapsed and dropped beside tags, so a reformatted copy still compares equal. */
function normalized(markup: string): string {
  return markup
    .replace(/\s+/g, ' ')
    .replace(/\s*([<>])\s*/g, '$1')
    .trim();
}

function checkAsset(html: string, asset: string): string[] {
  const start = html.indexOf(ASSET_START);
  const end = start === -1 ? -1 : html.indexOf(ASSET_END, start);
  const inlined = end === -1 ? '' : html.slice(start, end + ASSET_END.length);
  return unless(
    inlined !== '' && normalized(inlined) === normalized(asset),
    `The Spec does not inline the review asset from ${REVIEW_ASSET_FILE}, between its ${ASSET_START} and ${ASSET_END} markers.`,
  );
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

function checkAgainstDossier($: CheerioAPI, dossier: string): string[] {
  const ids = (selector: string) =>
    $(selector)
      .toArray()
      .map((element) => $(element).attr('id') ?? '');
  return [
    ...checkSlugsAgree('Section', dossierSlugs(dossier, 2), ids('section[data-spec="section"]')),
    ...checkSlugsAgree('Slide', dossierSlugs(dossier, 3), ids(SLIDE)),
  ];
}

/**
 * Checks a staging folder's Spec page against the Spec contract, and against
 * the Dossier while one exists; nothing until `spec/spec.html` exists. `files`
 * maps a path relative to the folder to its text; `reviewAsset` is the text of
 * the shared review asset the page must inline.
 */
export function checkSpec(files: Readonly<Record<string, string>>, reviewAsset: string): Finding[] {
  const html = files[SPEC_FILE];
  if (html === undefined) return [];
  const $ = load(html);
  const meta = metaText($);
  const isApproved = metaGateTier(html) === 'approved';
  const dossier = files[DOSSIER_FILE];
  const messages = [
    ...checkMeta(meta),
    ...checkAsset(html, reviewAsset),
    ...(dossier === undefined || isApproved ? [] : checkAgainstDossier($, dossier)),
    ...$(SLIDE)
      .toArray()
      .flatMap((element, at) => checkSlide({ $, approved: isApproved }, element, at)),
    ...unless(
      $(`#visual-language textarea[form="${FORM}"][name="note:visual-language"]`).length === 1,
      `The Visual language has no <textarea form="${FORM}" name="note:visual-language">.`,
    ),
    ...checkVoiceScripts($),
    ...checkCitations($),
  ];
  const stale = unless(
    !isApproved || dossier === undefined,
    'dossier.md still sits beside the approved Spec: the Spec is the only source now, so delete it in the approval commit.',
  );
  return [
    ...messages.map((message): Finding => ({ kind: 'spec', file: SPEC_FILE, message })),
    ...stale.map((message): Finding => ({ kind: 'spec', file: DOSSIER_FILE, message })),
  ];
}
