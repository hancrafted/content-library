/*
 * The exchange file's writer (design-ADR 0024 §11): the reference build's `YAML.stringify`, line for line, so a
 * Download reads as flow.html's does: short maps and lists inline, a note as a comment above its key (`#path`) or
 * beside it (`path`), numbers to four decimals, a string quoted only when plain YAML would misread it. It writes; the
 * one YAML reader stays `use-case-file.ts`.
 */

type Value = unknown;
type Notes = Readonly<Record<string, string>>;

const RESERVED = /^(true|false|null|~|yes|no|on|off)$/i;
const PLAIN = /^[A-Za-zÀ-ž(][^:#[\]{},"\n]*$/;

const str = (s: string): string =>
  PLAIN.test(s) && !/\s$/.test(s) && !RESERVED.test(s) && !/: /.test(s) ? s : JSON.stringify(s);
const keyS = (k: string): string => (/^[A-Za-z_][\w-]*$/.test(k) ? k : JSON.stringify(k));
const sc = (v: Value): string =>
  v === null || v === undefined
    ? 'null'
    : typeof v === 'string'
      ? str(v)
      : typeof v === 'number'
        ? String(Math.round(v * 10000) / 10000)
        : String(v);
const isSc = (v: Value): boolean => v === null || typeof v !== 'object';

const inline = (v: Value): string => {
  if (isSc(v)) return sc(v);
  if (Array.isArray(v)) return `[${v.map(inline).join(', ')}]`;
  return `{ ${Object.entries(v as object)
    .map(([k, x]) => `${keyS(k)}: ${inline(x)}`)
    .join(', ')} }`;
};
const scList = (x: Value): boolean =>
  Array.isArray(x) && x.every((y) => isSc(y) || (Array.isArray(y) && y.every(isSc)));
const flat = (v: Value): boolean =>
  isSc(v) || (Array.isArray(v) ? v : Object.values(v as object)).every((x) => isSc(x) || scList(x));
const empty = (x: object): boolean => (Array.isArray(x) ? !x.length : !Object.keys(x).length);

/** A map or list under a key goes on the key's line when empty, or flat and short. */
const oneLine = (x: Value, used: number): boolean => empty(x as object) || (flat(x) && inline(x).length + used < 110);

interface At {
  readonly ind: number;
  readonly notes: Notes;
  readonly path: string;
}

const emitList = (v: readonly Value[], at: At): string[] => {
  const pad = ' '.repeat(at.ind),
    out: string[] = [];
  for (const x of v) {
    if (isSc(x) || (flat(x) && inline(x).length + at.ind < 120)) {
      out.push(`${pad}- ${inline(x)}`);
      continue;
    }
    const sub = emit(x, { ...at, ind: at.ind + 2, path: `${at.path}[]` });
    out.push(`${pad}- ${(sub[0] ?? '').trimStart()}`, ...sub.slice(1));
  }
  return out;
};

const emitEntry = (k: string, x: Value, at: At): string[] => {
  const pad = ' '.repeat(at.ind),
    p = at.path ? `${at.path}.${k}` : k;
  const above = at.notes[`#${p}`] ? [`${pad}# ${at.notes[`#${p}`]}`] : [],
    beside = at.notes[p] ? `  # ${at.notes[p]}` : '';
  if (isSc(x)) return [...above, `${pad}${keyS(k)}: ${sc(x)}${beside}`];
  if (oneLine(x, at.ind + k.length)) return [...above, `${pad}${keyS(k)}: ${inline(x)}${beside}`];
  return [...above, `${pad}${keyS(k)}:${beside}`, ...emit(x, { ...at, ind: at.ind + 2, path: p })];
};

function emit(v: Value, at: At): string[] {
  if (Array.isArray(v)) return emitList(v, at);
  return Object.entries(v as object).flatMap(([k, x]) => emitEntry(k, x, at));
}

/** One YAML document, its notes as comments keyed by path: `#path` above the key, `path` beside it. */
export const stringifyExchange = (doc: Readonly<Record<string, unknown>>, notes: Notes = {}): string =>
  `${emit(doc, { ind: 0, notes, path: '' }).join('\n')}\n`;
