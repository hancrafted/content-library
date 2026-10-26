import { PURPOSES, RUNTIMES, TIERS } from './workflow-schema.types';

/*
 * The shape of a Workflow file as data: a descriptor tree and one walker that reports every field of the wrong type
 * or missing, one sentence each. Hand-written, no zod (ARCH-001). Meaning (ids, markers, samples) is checked after
 * this, by the loader, on a file whose shape already holds.
 */

type Spec =
  | { readonly t: 'str' | 'int' | 'bool' | 'strs' }
  | { readonly t: 'enum'; readonly of: readonly string[] }
  | { readonly t: 'list'; readonly of: Spec; readonly min: number }
  | { readonly t: 'rec'; readonly of: Spec; readonly keys?: readonly string[] }
  | { readonly t: 'obj'; readonly fields: Readonly<Record<string, Spec>>; readonly optional?: readonly string[] };

const str: Spec = { t: 'str' };
const int: Spec = { t: 'int' };
const bool: Spec = { t: 'bool' };
/** Text, or a non-empty list of texts. */
const strs: Spec = { t: 'strs' };
const enumOf = (of: readonly string[]): Spec => ({ t: 'enum', of });
const list = (of: Spec, min = 0): Spec => ({ t: 'list', of, min });
const obj = (fields: Record<string, Spec>, optional: readonly string[] = []): Spec => ({ t: 'obj', fields, optional });

const ids = list(str, 1);
const section = obj({ heading: str, purpose: enumOf(PURPOSES), explain: str, techniques: ids, text: str }, [
  'purpose',
  'explain',
  'techniques',
]);
const technique = obj({ id: str, tier: enumOf(TIERS), title: str, explain: str });
const slot = obj({ id: str, mode: enumOf(['single', 'multiple']), label: str, sample: strs, free: bool }, [
  'sample',
  'free',
]);
const limit = obj({ full: int, teaching: int });
const task = obj(
  {
    id: str,
    title: str,
    summary: str,
    goal: obj({ do: str, review: str }, ['review']),
    needs: ids,
    output: str,
    template: str,
    slots: list(slot),
    instructions: str,
    do: obj(Object.fromEntries(RUNTIMES.map((runtime) => [runtime, list(section, 1)]))),
    review: obj({ slots: list(slot, 1), checks: list(str, 1), instructions: str }, ['instructions']),
    limits: { t: 'rec', of: limit },
    details: obj({ why: str, example: strs, goodLooksLike: list(str, 1), techniques: ids }, ['techniques']),
  },
  ['summary', 'needs', 'output', 'review', 'instructions', 'limits'],
);
const stage = obj(
  {
    id: str,
    title: str,
    learningGoal: str,
    summary: str,
    foreach: obj({ over: str, teaching: int, item: str }, ['item']),
    move: enumOf(['B', 'R', 'I', 'E', 'F']),
    gate: int,
    card: obj({ label: str, lines: list(str), status: str }),
    jobs: list(task, 1),
  },
  ['summary', 'foreach', 'move', 'gate', 'card'],
);

/** The Spec of a whole Workflow file. */
export const FILE_SPEC: Spec = obj({
  id: str,
  title: str,
  scenario: obj({ summary: str, facts: list(str, 1) }),
  purposes: { t: 'rec', of: str, keys: PURPOSES },
  techniques: list(technique, 1),
  reviewer: obj({ sections: list(section, 1) }),
  templates: { t: 'rec', of: str },
  stages: list(stage, 1),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

type Walk = (value: unknown, spec: Spec, path: string) => string[];

const isText = (value: unknown): boolean => typeof value === 'string' && value.trim() !== '';

const SCALAR: Record<'str' | 'int' | 'bool' | 'strs', (value: unknown) => boolean> = {
  str: isText,
  bool: (value) => typeof value === 'boolean',
  strs: (value) => isText(value) || (Array.isArray(value) && value.length > 0 && value.every(isText)),
  int: (value) => typeof value === 'number' && Number.isInteger(value) && value >= 1,
};

const objectProblems: Walk = (value, spec, path) => {
  if (spec.t !== 'obj') return [];
  if (!isRecord(value)) return [`${path} must be a mapping.`];
  const known = Object.keys(spec.fields);
  const unknown = Object.keys(value).filter((key) => !known.includes(key));
  const here = (key: string) => (path ? `${path}.${key}` : key);
  return [
    ...unknown.map((key) => `${here(key)} is not a field of the schema.`),
    ...known.flatMap((key) => {
      const child = spec.fields[key] as Spec;
      if (value[key] === undefined) return spec.optional?.includes(key) ? [] : [`${here(key)} is missing.`];
      return walk(value[key], child, here(key));
    }),
  ];
};

const listProblems: Walk = (value, spec, path) => {
  if (spec.t !== 'list') return [];
  if (!Array.isArray(value)) return [`${path} must be a list.`];
  const short = value.length < spec.min ? [`${path} needs at least ${spec.min} entries.`] : [];
  return [...short, ...value.flatMap((item, at) => walk(item, spec.of, `${path}[${at}]`))];
};

const recordProblems: Walk = (value, spec, path) => {
  if (spec.t !== 'rec') return [];
  if (!isRecord(value)) return [`${path} must be a mapping.`];
  const missing = (spec.keys ?? []).filter((key) => !(key in value)).map((key) => `${path}.${key} is missing.`);
  const extra = spec.keys ? Object.keys(value).filter((key) => !spec.keys?.includes(key)) : [];
  const names = extra.map((key) => `${path}.${key} is not one of ${spec.keys?.join(', ')}.`);
  return [...missing, ...names, ...Object.entries(value).flatMap(([key, v]) => walk(v, spec.of, `${path}.${key}`))];
};

function enumProblems(value: unknown, spec: Spec, path: string): string[] {
  if (spec.t !== 'enum') return [];
  const ok = typeof value === 'string' && spec.of.includes(value);
  return ok ? [] : [`${path} is "${String(value)}", which is not one of ${spec.of.join(', ')}.`];
}

function scalarProblems(value: unknown, spec: Spec, path: string): string[] {
  if (spec.t !== 'str' && spec.t !== 'int' && spec.t !== 'bool' && spec.t !== 'strs') return [];
  const word = {
    str: 'text',
    int: 'a whole number of at least 1',
    bool: 'true or false',
    strs: 'text or a list of texts',
  }[spec.t];
  return SCALAR[spec.t](value) ? [] : [`${path} must be ${word}.`];
}

function walk(value: unknown, spec: Spec, path: string): string[] {
  const composite = { obj: objectProblems, list: listProblems, rec: recordProblems, enum: enumProblems } as Record<
    string,
    Walk
  >;
  return (composite[spec.t] ?? scalarProblems)(value, spec, path);
}

/** Every field of `value` that does not fit the Workflow file shape. */
export const shapeProblems = (value: unknown): string[] => walk(value, FILE_SPEC, '');
