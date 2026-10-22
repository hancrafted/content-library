import { parse } from 'yaml';

/*
 * The handoff format: a fenced `handoff` block holding YAML with a `kind`. It is what one chat hands to the next, and
 * what a Workflow's example inputs and outputs are written in. This reads and checks it; the Workflow loader asks it
 * whether an example parses for its kind, and the renderers of each kind read the same shapes.
 */

/** The kinds a job output may have. `text` is the plain fallback. */
export const HANDOFF_KINDS = ['text', 'requirements', 'spec', 'tickets', 'research', 'comparison'] as const;
export type HandoffKind = (typeof HANDOFF_KINDS)[number];

/** A ticket of a `tickets` handoff: `blockedBy` lists ids of tickets in the same handoff. */
export interface Ticket {
  readonly id: string;
  readonly title: string;
  readonly acceptance: readonly string[];
  readonly blockedBy: readonly string[];
}

/** One parsed handoff block, a union by `kind`. */
export type Handoff =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'requirements'; readonly items: readonly string[] }
  | {
      readonly kind: 'spec';
      readonly goal: string;
      readonly requirements: readonly string[];
      readonly outOfScope: readonly string[];
      readonly slices: readonly string[];
    }
  | { readonly kind: 'tickets'; readonly tickets: readonly Ticket[] }
  | { readonly kind: 'research'; readonly subject: string; readonly summary: string; readonly facts: readonly string[] }
  | {
      readonly kind: 'comparison';
      readonly criteria: readonly string[];
      readonly ranking: readonly { readonly name: string; readonly why: string }[];
    };

export type HandoffRead = { readonly handoff: Handoff } | { readonly problem: string };

const FENCE = /^```handoff[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*$/gm;

/** The body of each fenced `handoff` block of a text, in order. */
export function handoffBlocks(text: string): string[] {
  return [...text.matchAll(FENCE)].map((match) => match[1] ?? '');
}

type Body = Readonly<Record<string, unknown>>;

/** Field readers over one block's mapping that collect what is missing instead of throwing. */
function fields(body: Body) {
  const problems: string[] = [];
  const text = (key: string): string => {
    const value = body[key];
    if (typeof value === 'string' && value.trim() !== '') return value;
    problems.push(`"${key}" must be text`);
    return '';
  };
  const list = (key: string): string[] => {
    const value = body[key];
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value as string[];
    problems.push(`"${key}" must be a list of text`);
    return [];
  };
  const mappings = (key: string): Body[] => {
    const value = body[key];
    if (Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null)) {
      return value as Body[];
    }
    problems.push(`"${key}" must be a list of entries`);
    return [];
  };
  return { problems, text, list, mappings };
}

function ticketsOf(body: Body): { problems: string[]; tickets: Ticket[] } {
  const f = fields(body);
  const tickets = f.mappings('tickets').map((entry): Ticket => {
    const t = fields(entry);
    const ticket = {
      id: t.text('id'),
      title: t.text('title'),
      acceptance: t.list('acceptance'),
      blockedBy: t.list('blockedBy'),
    };
    f.problems.push(...t.problems.map((problem) => `a ticket's ${problem}`));
    return ticket;
  });
  const ids = new Set(tickets.map((ticket) => ticket.id));
  for (const ticket of tickets)
    for (const other of ticket.blockedBy)
      if (!ids.has(other)) f.problems.push(`ticket "${ticket.id}" is blocked by "${other}", which is not a ticket`);
  return { problems: f.problems, tickets };
}

function rankingOf(body: Body): { problems: string[]; ranking: { name: string; why: string }[] } {
  const f = fields(body);
  const ranking = f.mappings('ranking').map((entry) => {
    const r = fields(entry);
    const row = { name: r.text('name'), why: r.text('why') };
    f.problems.push(...r.problems.map((problem) => `a ranking row's ${problem}`));
    return row;
  });
  return { problems: f.problems, ranking };
}

interface Built {
  readonly problems: string[];
  readonly handoff: Handoff;
}

const BUILDERS: Readonly<Record<HandoffKind, (body: Body) => Built>> = {
  text: (body) => {
    const f = fields(body);
    return { handoff: { kind: 'text', text: f.text('text') }, problems: f.problems };
  },
  requirements: (body) => {
    const f = fields(body);
    return { handoff: { kind: 'requirements', items: f.list('items') }, problems: f.problems };
  },
  spec: (body) => {
    const f = fields(body);
    const handoff = {
      kind: 'spec',
      goal: f.text('goal'),
      requirements: f.list('requirements'),
      outOfScope: f.list('outOfScope'),
      slices: f.list('slices'),
    } as const;
    return { handoff, problems: f.problems };
  },
  tickets: (body) => {
    const { problems, tickets } = ticketsOf(body);
    return { handoff: { kind: 'tickets', tickets }, problems };
  },
  research: (body) => {
    const f = fields(body);
    const handoff = {
      kind: 'research',
      subject: f.text('subject'),
      summary: f.text('summary'),
      facts: f.list('facts'),
    } as const;
    return { handoff, problems: f.problems };
  },
  comparison: (body) => {
    const f = fields(body);
    const { problems, ranking } = rankingOf(body);
    return {
      handoff: { kind: 'comparison', criteria: f.list('criteria'), ranking },
      problems: [...f.problems, ...problems],
    };
  },
};

/** Reads one block body (the YAML inside the fence) as a handoff, or says what is wrong with it. */
export function parseHandoff(body: string): HandoffRead {
  let doc: unknown;
  try {
    doc = parse(body);
  } catch {
    return { problem: 'the block is not valid YAML' };
  }
  if (typeof doc !== 'object' || doc === null || Array.isArray(doc))
    return { problem: 'the block must be a mapping with a "kind"' };
  const mapping = doc as Body;
  const kind = HANDOFF_KINDS.find((known) => known === mapping.kind);
  if (!kind) return { problem: `the kind "${String(mapping.kind)}" is not one of ${HANDOFF_KINDS.join(', ')}` };
  const { handoff, problems } = BUILDERS[kind](mapping);
  return problems.length > 0 ? { problem: `a ${kind} handoff: ${problems.join('; ')}` } : { handoff };
}

/**
 * Problems of a chat text that should hold one handoff block per expected kind, in order: a block missing, a surplus
 * block, a block that does not parse, a block of another kind. One sentence each.
 */
export function handoffProblems(text: string, expected: readonly HandoffKind[]): string[] {
  const blocks = handoffBlocks(text);
  const count =
    blocks.length === expected.length
      ? []
      : [`expected ${expected.length} handoff block(s) (${expected.join(', ') || 'none'}), found ${blocks.length}`];
  const each = blocks.flatMap((block, at) => {
    const read = parseHandoff(block);
    if ('problem' in read) return [`handoff block ${at + 1}: ${read.problem}`];
    const want = expected[at];
    return want === undefined || read.handoff.kind === want
      ? []
      : [`handoff block ${at + 1} is a ${read.handoff.kind} but ${want} is expected`];
  });
  return [...count, ...each];
}
