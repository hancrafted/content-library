export type Tone = 'bad' | 'good' | 'muted';

interface Node {
  label: string;
  tone?: Tone;
}

export type Visual =
  | { kind: 'flow'; nodes: Node[] }
  | { kind: 'stack'; items: Node[] }
  | { kind: 'quote'; text: string }
  | { kind: 'count'; value: number | string; unit: string };

export interface Card {
  id: string;
  title: string;
  weight?: 'strong' | 'worth' | 'weak';
  changes?: string;
  happened: string;
  change: string;
  gain: string;
  before: Visual;
  after: Visual;
  evidence?: string;
  overlaps?: string[];
  overlapNote?: string;
}

export interface Section {
  key: string;
  title: string;
  target: string;
  cards: Card[];
}

export interface Harvest {
  staging: string;
  episode: string;
  sections: Section[];
}

const KINDS = new Set(['flow', 'stack', 'quote', 'count']);
const PLAIN = ['title', 'happened', 'change', 'gain'] as const;
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

function problems(harvest: Harvest): string[] {
  const cards = harvest.sections.flatMap((section) => section.cards);
  const ids = new Set(cards.map(({ id }) => id));
  return [...duplicateIds(cards), ...cards.flatMap((card) => cardProblems(card, ids))];
}

export function harvestReport(template: string, harvest: Harvest): string {
  const found = problems(harvest);
  if (found.length > 0) throw new Error(`the harvest has ${found.length} problem(s):\n- ${found.join('\n- ')}`);
  if (!DATA_BLOCK.test(template)) throw new Error('the template has no <script type="application/json" id="harvest">');
  const jsonThatCannotCloseItsScriptBlock = JSON.stringify(harvest, null, 2).replace(/</g, '\\u003c');
  return template.replace(
    DATA_BLOCK,
    (_match, open: string, close: string) => `${open}\n${jsonThatCannotCloseItsScriptBlock}\n${close}`,
  );
}
