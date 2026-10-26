// The Harvest report: Promotion's gate page. The harvesters' proposals, as data, go into the report template
// (`skills/episode-promote/assets/harvest-report.html`), whose own script draws one card per proposal. Pure: template and harvest in, page
// out; `skills/episode-promote/scripts/harvest-report.ts` reads and writes the disk. The shapes below are what the template's renderer draws.

export type Tone = 'bad' | 'good' | 'muted';

interface Node {
  label: string;
  tone?: Tone;
}

/** A card's before or after picture: a chain of steps, a list of files, a quoted line, or one number. */
export type Visual =
  | { kind: 'flow'; nodes: Node[] }
  | { kind: 'stack'; items: Node[] }
  | { kind: 'quote'; text: string }
  | { kind: 'count'; value: number | string; unit: string };

/**
 * One proposal. The user decides it days after the Run, from the words alone: `title`, `happened`, `change` and `gain`
 * are plain language (references/harvest.md#plain-language); ids, rule numbers and line refs go in `evidence`.
 */
export interface Card {
  /** Section letter and number, `L1`, unique across the harvest; the user's decisions name it. */
  id: string;
  /** The decision, as one plain sentence. */
  title: string;
  /** How sure the harvester is: `weak` for a pick with no comment. */
  weight?: 'strong' | 'worth' | 'weak';
  /** The file the proposal changes. */
  changes?: string;
  /** What happened in the Run, so the user remembers it. */
  happened: string;
  /** What changes, and where. */
  change: string;
  /** What the user gets by keeping the card. */
  gain: string;
  before: Visual;
  after: Visual;
  evidence?: string;
  /** Cards proposing the same change from another side; the user keeps one. */
  overlaps?: string[];
  overlapNote?: string;
}

export interface Section {
  key: string;
  title: string;
  /** Where a kept card lands: a file, a folder, or `gh issue create`. */
  target: string;
  cards: Card[];
}

export interface Harvest {
  /** The Staging folder, repo-relative; it keys the page's saved decisions. */
  staging: string;
  episode: string;
  sections: Section[];
}

const KINDS = new Set(['flow', 'stack', 'quote', 'count']);
/** The fields the user decides on, which must read without the repo open. */
const PLAIN = ['title', 'happened', 'change', 'gain'] as const;
/** A rule id (`FE-010`, `ARCH-003`) or a section sign (`§3.2`): jargon the user cannot decide on days later. */
const JARGON = /\b[A-Z]{2,5}-\d{3}\b|§\d+(?:\.\d+)*/g;
const DATA_BLOCK = /(<script type="application\/json" id="harvest">)[\s\S]*?(<\/script>)/;

function duplicateIds(cards: readonly Card[]): string[] {
  const seen = new Set<string>();
  return cards.flatMap(({ id }) => {
    const twice = seen.has(id);
    seen.add(id);
    return twice ? [`${id} is used twice`] : [];
  });
}

function cardProblems(card: Card, ids: ReadonlySet<string>): string[] {
  const dangling = (card.overlaps ?? [])
    .filter((other) => !ids.has(other))
    .map((other) => `${card.id} overlaps ${other}, which is no card`);
  const unknown = (['before', 'after'] as const).flatMap((side) => {
    const kind = String((card[side] as { kind?: unknown } | undefined)?.kind);
    return KINDS.has(kind) ? [] : [`${card.id} ${side}: no visual kind "${kind}"`];
  });
  const jargon = PLAIN.flatMap((field) =>
    [...(card[field] ?? '').matchAll(JARGON)].map(
      ([word]) => `${card.id} ${field}: "${word}" is jargon; say it plainly`,
    ),
  );
  return [...dangling, ...unknown, ...jargon];
}

/** Every reason the page would draw `harvest` wrong: a duplicate id, a dangling overlap, an unknown visual. */
function problems(harvest: Harvest): string[] {
  const cards = harvest.sections.flatMap((section) => section.cards);
  const ids = new Set(cards.map(({ id }) => id));
  return [...duplicateIds(cards), ...cards.flatMap((card) => cardProblems(card, ids))];
}

/** The template with `harvest` as its data block; throws listing every problem the page would draw wrong. */
export function harvestReport(template: string, harvest: Harvest): string {
  const found = problems(harvest);
  if (found.length > 0) throw new Error(`the harvest has ${found.length} problem(s):\n- ${found.join('\n- ')}`);
  if (!DATA_BLOCK.test(template)) throw new Error('the template has no <script type="application/json" id="harvest">');
  // `<` written as a JSON unicode escape keeps a "</script>" inside the data from closing the block early;
  // JSON.parse reads it back.
  const json = JSON.stringify(harvest, null, 2).replace(/</g, '\\u003c');
  return template.replace(DATA_BLOCK, (_match, open: string, close: string) => `${open}\n${json}\n${close}`);
}
