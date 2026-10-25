/*
 * The Slide plan slide-retrieval writes, `docs/episodes/<slug>/slide-plan.md` (design-ADR 0016, Pipeline and evidence
 * rules 12 to 15): one item per Slide the Brief names, in its numbering, deciding whether an existing Slide is reused
 * by reference, adapted as an instance, or a new one built. Han flips any item at the Spec Gate:
 *
 *   - Slide <n>: reuse <slug>; held by <episode>, …; cites <id>, … | none[; moves from <episode>].
 *   - Slide <n>: adapt <slug>; held by <episode>, …; cites <id>, … | none[; moves from <episode>]; changes <what>.
 *   - Slide <n>: new[; closest <slug>; held by <episode>, …; cites <id>, … | none].
 *
 * `held by` and `cites` are the pool listing's (`npm run slides:pool`) for the candidate; `moves from` names the
 * Episode whose folder the candidate still lives in, which its first reuse moves to the Slide pool; `closest` keeps a
 * near miss beside a new Slide so it can be flipped to reuse or adapt. Imports nothing, so the new-episode scripts run
 * it under bare node.
 */

export type SlideOutcome = 'reuse' | 'adapt' | 'new';

export const SLIDE_OUTCOMES: readonly SlideOutcome[] = ['reuse', 'adapt', 'new'];

/** One item of the plan, as slide-retrieval or a flip wrote it. */
export interface SlidePlanItem {
  /** The Brief's number for the Slide. */
  readonly number: number;
  readonly outcome: SlideOutcome;
  /** The candidate Slide's slug: the one reused or adapted, or the closest one beside a new Slide. */
  readonly slug: string | undefined;
  readonly heldBy: readonly string[];
  readonly cites: readonly string[];
  readonly movesFrom: string | undefined;
  /** What an adapted Slide changes. */
  readonly changes: string | undefined;
}

/** The plan's file, relative to the Staging folder. */
export const SLIDE_PLAN_FILE = 'slide-plan.md';

const SLIDES = /^## Slides$/;
const ITEM = /^Slide (\d+): (reuse|adapt|new)(?: ([a-z0-9]+(?:-[a-z0-9]+)*))?(.*)$/;
const NONE = 'none';

/** The plan's list items under `## Slides`, each without its bullet. */
function itemLines(markdown: string): string[] {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => SLIDES.test(line.trim()));
  if (start === -1) return [];
  const end = lines.findIndex((line, at) => at > start && /^#{1,2} /.test(line));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .filter((line) => /^[-*] /.test(line))
    .map((line) => line.replace(/^[-*] /, '').trim());
}

/** The `; <field> <value>` parts before `changes`, or nothing when one is unknown or repeated. */
function headFields(head: string, fields: Map<string, string>): Map<string, string> | undefined {
  if (head === '') return fields;
  if (!head.startsWith('; ')) return undefined;
  for (const part of head.slice(2).split('; ')) {
    const match = /^(closest|held by|cites|moves from) (\S.*)$/.exec(part.trim());
    if (match === null || fields.has(match[1])) return undefined;
    fields.set(match[1], match[2].trim());
  }
  return fields;
}

/** The `; <field> <value>` parts after the outcome; `changes` takes the rest of the line. */
function fieldsOf(rest: string): Map<string, string> | undefined {
  const text = rest.replace(/\.$/, '');
  const at = text.indexOf('; changes ');
  if (at === -1) return headFields(text, new Map());
  return headFields(text.slice(0, at), new Map([['changes', text.slice(at + '; changes '.length).trim()]]));
}

const listOf = (value: string | undefined): string[] =>
  value === undefined || value === NONE ? [] : value.split(',').map((part) => part.trim());

/** A new Slide names no slug after its outcome, a candidate comes with its holders and citations, only adapt changes. */
function wellFormed(item: SlidePlanItem, named: string | undefined, fields: ReadonlyMap<string, string>): boolean {
  const complete = fields.has('held by') && fields.has('cites');
  return (
    (item.outcome === 'new') === (named === undefined) &&
    (item.slug !== undefined) === complete &&
    (item.outcome === 'adapt' || !fields.has('changes'))
  );
}

/** One line as an item, or nothing when it is of no known form. */
function readItem(text: string): SlidePlanItem | undefined {
  const match = ITEM.exec(text);
  const fields = match === null ? undefined : fieldsOf(match[4]);
  if (match === null || fields === undefined) return undefined;
  const [, number, outcome, named] = match;
  const item: SlidePlanItem = {
    number: Number(number),
    outcome: outcome as SlideOutcome,
    slug: outcome === 'new' ? fields.get('closest') : named,
    heldBy: listOf(fields.get('held by')),
    cites: listOf(fields.get('cites')),
    movesFrom: fields.get('moves from'),
    changes: fields.get('changes'),
  };
  return wellFormed(item, named, fields) ? item : undefined;
}

/** Each item line of the plan as written, with what it reads as: nothing for a line of no known form. */
export function readSlidePlanLines(markdown: string): { text: string; item: SlidePlanItem | undefined }[] {
  return itemLines(markdown).map((text) => ({ text, item: readItem(text) }));
}

/** The plan's items that read as one of the three forms. */
export function readSlidePlan(markdown: string): SlidePlanItem[] {
  return readSlidePlanLines(markdown).flatMap(({ item }) => (item ? [item] : []));
}

const written = (values: readonly string[]) => (values.length === 0 ? NONE : values.join(', '));

/** The outcome and its slug: `reuse <slug>`, `adapt <slug>`, `new` or `new; closest <slug>`. */
function headOf({ outcome, slug }: SlidePlanItem): string[] {
  if (outcome !== 'new') return [`${outcome} ${slug ?? ''}`];
  return slug === undefined ? ['new'] : ['new', `closest ${slug}`];
}

/** One item written back in its form. */
export function writeSlidePlanItem(item: SlidePlanItem): string {
  const candidate = item.slug === undefined ? [] : [`held by ${written(item.heldBy)}`, `cites ${written(item.cites)}`];
  const moves = item.movesFrom === undefined ? [] : [`moves from ${item.movesFrom}`];
  const changes = item.outcome === 'adapt' && item.changes !== undefined ? [`changes ${item.changes}`] : [];
  return `Slide ${item.number}: ${[...headOf(item), ...candidate, ...moves, ...changes].join('; ')}.`;
}

/** Han's flip of one Slide at the Spec Gate: its Brief number, the outcome he chose, and his note. */
export interface SlideFlip {
  readonly number: number;
  readonly to: SlideOutcome;
  readonly note: string;
}

/**
 * The plan with each flip applied to its Slide's item, every other line as it was. A flip to adapt takes Han's note as
 * what changes; a flip to new keeps the candidate as `closest`, so it can be flipped back. A flip of a Slide the plan
 * holds no candidate for, or to adapt without a note, is left out: the review refuses it before it gets here.
 */
export function flipSlidePlan(markdown: string, flips: readonly SlideFlip[]): string {
  return markdown
    .split('\n')
    .map((line) => flipLine(line, flips))
    .join('\n');
}

/** One line of the plan as an item, or nothing for any other line. */
function itemOfLine(line: string): SlidePlanItem | undefined {
  return /^[-*] /.test(line) ? readItem(line.replace(/^[-*] /, '').trim()) : undefined;
}

/** Whether the flip applies: the item names a candidate, and a flip to adapt says what changes. */
const applies = (item: SlidePlanItem, flip: SlideFlip) =>
  item.slug !== undefined && (flip.to !== 'adapt' || flip.note !== '');

/** One line of the plan, flipped when it is an item a flip names and can apply to. */
function flipLine(line: string, flips: readonly SlideFlip[]): string {
  const item = itemOfLine(line);
  const flip = flips.find(({ number }) => number === item?.number);
  if (item === undefined || flip === undefined || !applies(item, flip)) return line;
  const changes = flip.to === 'adapt' ? flip.note : undefined;
  return `- ${writeSlidePlanItem({ ...item, outcome: flip.to, changes })}`;
}
