/*
 * The Slide plan against the Staging folder's other files (design-ADR 0016, Pipeline and evidence rules 12 to 15): one
 * item per Slide the Brief numbers; a Dossier that writes words only for the Slides the plan does not reuse, a reused
 * one under the reused Slide's slug; a Spec that marks each reused and adapted Slide as the plan says, so a flip at the
 * Spec Gate shows on the next Spec; and a research plan that brings in, by Slide, each Research question a reused or
 * adapted Slide already cites. Every Dossier page Slide holds its three blocks unless the plan reuses it, with or
 * without a plan. Each rule reads file text; reading the disk is the caller's job.
 */

import { load } from 'cheerio';
import { PLAN_ATTRIBUTES } from './episode-spec-assemble-plan.pure.ts';
import { SLIDE, SPEC_FILE } from './episode-spec-page.pure.ts';
import { briefSource } from './episode-spec-source.pure.ts';
import { unless, type Finding } from './finding.pure.ts';
import { readResearchPlan } from './research-plan.pure.ts';
import { readSlidePlanLines, SLIDE_PLAN_FILE, type SlidePlanItem } from './slide-plan.pure.ts';
import { blocksOf, bodyLines } from './staging-markdown.pure.ts';

const WORDS = ['Visual', 'Speaker notes', 'Voice script'];

/** A Dossier page Slide in spine order: its slug and the h4 blocks under it. */
interface DossierSlide {
  slug: string;
  blocks: string[];
}

/** Where the Dossier walk stands: inside a slugged Section, and the page Slide whose blocks it collects. */
interface Walk {
  section: boolean;
  current: DossierSlide | undefined;
}

function openSlide(walk: Walk, slides: DossierSlide[], slug: string | null): Walk {
  const current = walk.section && slug !== null ? { slug, blocks: [] } : undefined;
  if (current !== undefined) slides.push(current);
  return { ...walk, current };
}

function step(walk: Walk, slides: DossierSlide[], heading: { level: number; slug: string | null; text: string }): Walk {
  if (heading.level <= 2) return { section: heading.level === 2 && heading.slug !== null, current: undefined };
  if (heading.level === 3) return openSlide(walk, slides, heading.slug);
  walk.current?.blocks.push(heading.text);
  return walk;
}

function dossierSlides(dossier: string): DossierSlide[] {
  const slides: DossierSlide[] = [];
  let walk: Walk = { section: false, current: undefined };
  for (const { heading } of blocksOf(bodyLines(dossier))) walk = step(walk, slides, heading);
  return slides;
}

/** A reused Slide keeps its words, so its Dossier entry holds none of them. */
function checkReused(slide: DossierSlide, pool: string): string[] {
  return unless(
    slide.blocks.every((block) => !WORDS.includes(block)),
    `The Dossier Slide {#${slide.slug}} is reused from ${pool} by the Slide plan, so it holds no Visual, Speaker notes or Voice script: a reused Slide keeps its words.`,
  );
}

/** The origin an adapted Slide's item names, or nothing for a reused or new one. */
const originOf = (item: SlidePlanItem | undefined) =>
  item !== undefined && item.outcome === 'adapt' ? item.slug : undefined;

function checkDossierSlide(slide: DossierSlide, item: SlidePlanItem | undefined): string[] {
  if (item !== undefined && item.outcome === 'reuse') return checkReused(slide, item.slug ?? '');
  const where = `The Dossier Slide {#${slide.slug}}`;
  const missing = WORDS.filter((block) => !slide.blocks.includes(block));
  const origin = originOf(item);
  return [
    ...unless(
      missing.length === 0,
      `${where} has no ${missing.map((block) => `#### ${block}`).join(', ')}: only a Slide the Slide plan reuses goes without its words.`,
    ),
    ...unless(
      origin !== slide.slug,
      `${where} adapts ${origin ?? ''} under its origin's slug: an instance takes a slug of its own, so the other Episodes keep the pool Slide.`,
    ),
  ];
}

/** What the plan says of a Slide, as a finding words it. */
const says = (item: SlidePlanItem | undefined) =>
  item === undefined ? 'has no item for it' : `says ${item.outcome} ${item.slug ?? ''}`.trim();

/** One Spec Slide: its id, its number and its attributes. */
interface SpecMarks {
  id: string;
  number: number;
  marks: (name: string) => string | undefined;
}

/** One Spec Slide's reused and adapted marks against its plan item. */
function markProblems({ id, number, marks }: SpecMarks, item: SlidePlanItem | undefined): string[] {
  return (['reuse', 'adapt'] as const).flatMap((outcome) => {
    const shown = marks(PLAN_ATTRIBUTES[outcome]);
    const planned = item?.outcome === outcome ? item.slug : undefined;
    return unless(
      shown === planned,
      `The Spec Slide ${number} {#${id}} shows ${PLAN_ATTRIBUTES[outcome]}="${shown ?? ''}", but the Slide plan ${says(item)}: assemble the Spec again.`,
    );
  });
}

/** Each Spec Slide marked reused or adapted exactly as the plan says. */
function checkSpecAgainstPlan(html: string, plan: ReadonlyMap<number, SlidePlanItem>): string[] {
  const $ = load(html);
  return $(SLIDE)
    .toArray()
    .flatMap((element) => {
      const slide = $(element);
      const number = Number(slide.attr('data-number'));
      const marks = (name: string) => slide.attr(name);
      return markProblems({ id: slide.attr('id') ?? '', number, marks }, plan.get(number));
    });
}

/** Each Research question a reused or adapted Slide cites, brought in by `Slide <n>: reuse <id>, …`. */
function checkResearchPlanAgainst(researchPlan: string, items: readonly SlidePlanItem[]): string[] {
  const reused = readResearchPlan(researchPlan).flatMap((item) =>
    item.kind === 'reuse' && item.slide !== undefined ? [`${item.slide} ${item.id}`] : [],
  );
  return items
    .filter(({ outcome }) => outcome !== 'new')
    .flatMap(({ number, cites }) =>
      cites
        .filter((id) => !reused.includes(`${number} ${id}`))
        .map(
          (id) =>
            `Slide ${number} keeps a Slide that cites ${id}: the research plan lists it under Reuse as \`Slide ${number}: reuse ${id}, confidence <value>, fresh until <date>\`.`,
        ),
    );
}

/** Each Brief Slide number covered once, and no number beyond the Brief's. */
function coverageProblems(numbers: readonly number[], count: number): string[] {
  const wanted = Array.from({ length: count }, (_, at) => at + 1);
  return [
    ...wanted
      .filter((number) => !numbers.includes(number))
      .map(
        (number) => `The Slide plan has no item for Slide ${number} of the Brief: decide reuse, adapt or new for it.`,
      ),
    ...numbers
      .filter((number, at) => !wanted.includes(number) || numbers.indexOf(number) !== at)
      .map((number) =>
        wanted.includes(number)
          ? `The Slide plan has more than one item for Slide ${number}.`
          : `The Slide plan has an item for Slide ${number}, which the Brief does not have.`,
      ),
  ];
}

function checkPlanItems(files: Readonly<Record<string, string>>, plan: string): string[] {
  const lines = readSlidePlanLines(plan);
  const items = lines.flatMap(({ item }) => (item ? [item] : []));
  const count = briefSource(files['brief.md'] ?? '').sections.reduce((sum, { slides }) => sum + slides.length, 0);
  return [
    ...lines
      .filter(({ item }) => item === undefined)
      .map(
        ({ text }) =>
          `"${text}" is none of \`Slide <n>: reuse <slug>; held by …; cites …\`, \`Slide <n>: adapt <slug>; held by …; cites …; changes <what>\` or \`Slide <n>: new\`.`,
      ),
    ...coverageProblems(
      items.map(({ number }) => number),
      count,
    ),
    ...items
      .filter(({ outcome, changes }) => outcome === 'adapt' && changes === undefined)
      .map(
        ({ number }) => `Slide ${number} is adapted but says not what changes: end its item with \`; changes <what>\`.`,
      ),
  ];
}

/** The Slide plan against the Brief, the Dossier, the Spec and the research plan; the Dossier's words with or without a plan. */
export function checkSlidePlanAgreement(files: Readonly<Record<string, string>>): Finding[] {
  const planText = files[SLIDE_PLAN_FILE];
  const items = readSlidePlanLines(planText ?? '').flatMap(({ item }) => (item ? [item] : []));
  const plan = new Map(items.map((item) => [item.number, item] as const));
  const dossier = files['dossier.md'];
  const spec = files[SPEC_FILE];
  const researchPlan = files['research-plan.md'];
  const finding =
    (file: string) =>
    (message: string): Finding => ({ kind: 'slide-plan', file, message });
  return [
    ...(planText === undefined ? [] : checkPlanItems(files, planText).map(finding(SLIDE_PLAN_FILE))),
    ...(dossier === undefined
      ? []
      : dossierSlides(dossier)
          .flatMap((slide, at) => checkDossierSlide(slide, plan.get(at + 1)))
          .map(finding('dossier.md'))),
    ...(spec === undefined || planText === undefined ? [] : checkSpecAgainstPlan(spec, plan).map(finding(SPEC_FILE))),
    ...(researchPlan === undefined
      ? []
      : checkResearchPlanAgainst(researchPlan, items).map(finding('research-plan.md'))),
  ];
}
