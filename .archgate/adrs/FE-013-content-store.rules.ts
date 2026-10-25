/// <reference path="../rules.d.ts" />

// FE-013 — Content Store. The parts of the decision that sit in file text: the
// content-model diagram names exactly the kinds with a schema, a record's type is
// inferred from its schema, and every schema field is described. Fail-closed
// loading and the refusals are held by the store's tests. Matched textually.
// Self-contained by design: archgate forbids imports between rules files.
//
// Dormant until the store's entry exists: the checks that read the store return
// early without it, while their tests pin every case. The store's first change
// deletes the guard (FE-013 Compliance, Known gap).

const STORE_ENTRY = 'src/content-store/store.ts';
const MODEL_FILE = 'docs/adr/0016-content-data-model.md';
const SCHEMA_GLOB = 'src/content-store/schemas/*.schema.ts';
const RECORD_GLOBS = ['src/content-store/**/*.ts', 'src/components/episodes/*/episode-metadata.ts'];

const STORE_LINE_RE = /^[ \t]*%%[ \t]*store:[ \t]*(.*)$/m;
const HAND_TYPE_RE = /\binterface\s+\w+|\btype\s+\w+(?:<[^>=]*>)?\s*=\s*\{/g;
const OBJECT_RE = /\bz\.(?:strict)?[oO]bject\(\s*\{/g;
const KEY_RE = /^\s*(?:readonly\s+)?(['"]?)([A-Za-z_$][\w$]*)\1\s*\??\s*:/;

async function storeExists(ctx: RuleContext): Promise<boolean> {
  return (await ctx.glob(STORE_ENTRY)).length > 0;
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

/** `EVENT` → `event`, `SHARED_SLIDE` → `shared-slide`: the schema file's basename. */
function kindFile(entity: string): string {
  return entity.trim().toLowerCase().replace(/_/g, '-');
}

function isTest(file: string): boolean {
  return /\.test\.tsx?$/.test(file);
}

/**
 * The top-level properties of the object literal opening at `open` (the index of
 * its `{`), each with its offset: split on commas at depth 0, skipping strings
 * and comments, so a comma inside `.describe('a, b')` or a nested call stays put.
 */
function properties(source: string, open: number): { text: string; at: number }[] {
  const parts: { text: string; at: number }[] = [];
  let depth = 0;
  let start = open + 1;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (c === "'" || c === '"' || c === '`') {
      for (i++; i < source.length && source[i] !== c; i++) if (source[i] === '\\') i++;
      continue;
    }
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      i = source.indexOf('*/', i + 2);
      if (i < 0) break;
      i++;
      continue;
    }
    if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') {
      depth--;
      if (depth === 0) {
        parts.push({ text: source.slice(start, i), at: start });
        break;
      }
    } else if (c === ',' && depth === 1) {
      parts.push({ text: source.slice(start, i), at: start });
      start = i + 1;
    }
  }
  return parts;
}

/** The text with every bracket's contents and every string emptied: what a field says at its own depth. */
function ownDepth(text: string): string {
  let out = '';
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "'" || c === '"' || c === '`') {
      for (i++; i < text.length && text[i] !== c; i++) if (text[i] === '\\') i++;
      if (depth === 0) out += c + c;
      continue;
    }
    if (c === ')' || c === '}' || c === ']') depth--;
    if (depth === 0) out += c;
    if (c === '(' || c === '{' || c === '[') depth++;
  }
  return out;
}

function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

export default {
  rules: {
    'model-matches-store': {
      description:
        "The content-model diagram's `%% store:` line names exactly the record kinds that have a schema file in the store.",
      severity: 'error',
      async check(ctx) {
        if ((await ctx.glob(MODEL_FILE)).length === 0) {
          ctx.report.violation({
            message: `${MODEL_FILE} is missing — its diagram's \`%% store:\` line names the record kinds; repoint this rule if it moved (FE-013 [model-matches-store]).`,
          });
          return;
        }
        const model = await ctx.readFile(MODEL_FILE);
        const line = STORE_LINE_RE.exec(model);
        if (!line) {
          ctx.report.violation({
            message: `The diagram in ${MODEL_FILE} has no \`%% store:\` line naming the record kinds (FE-013 [model-matches-store]).`,
            file: MODEL_FILE,
          });
          return;
        }
        if (!(await storeExists(ctx))) return;
        const modelled = line[1].split(',').map(kindFile).filter(Boolean);
        const schemas = (await ctx.glob(SCHEMA_GLOB)).map((file) => ({
          file,
          kind: file.slice(file.lastIndexOf('/') + 1, -'.schema.ts'.length),
        }));
        const modelLine = lineAt(model, line.index);
        for (const kind of modelled.filter((k) => !schemas.some((s) => s.kind === k))) {
          ctx.report.violation({
            message: `The diagram names ${kind.toUpperCase().replace(/-/g, '_')} as a stored record, but src/content-store/schemas/${kind}.schema.ts does not exist (FE-013 [model-matches-store]).`,
            file: MODEL_FILE,
            line: modelLine,
          });
        }
        for (const { file, kind } of schemas.filter((s) => !modelled.includes(s.kind))) {
          ctx.report.violation({
            message: `${file} has no entry on the diagram's \`%% store:\` line in ${MODEL_FILE}; add the entity or remove the schema (FE-013 [model-matches-store]).`,
            file,
          });
        }
      },
    },
    'type-from-schema': {
      description:
        'No hand-written interface or object type under src/content-store/ or in an Episode metadata file: a record type is z.infer of its schema.',
      severity: 'error',
      async check(ctx) {
        if (!(await storeExists(ctx))) return;
        const files = new Set<string>();
        for (const glob of RECORD_GLOBS) for (const file of await ctx.glob(glob)) if (!isTest(file)) files.add(file);
        for (const file of [...files].sort()) {
          const source = stripComments(await ctx.readFile(file));
          for (const match of source.matchAll(HAND_TYPE_RE)) {
            ctx.report.violation({
              message: `'${match[0].replace(/\s+/g, ' ')}' hand-writes a type where a record lives — infer it from the schema with z.infer (FE-013 [type-from-schema]).`,
              file,
              line: lineAt(source, match.index),
            });
          }
        }
      },
    },
    'field-described': {
      description: 'Every field of every z.object in a store schema carries .describe(.',
      severity: 'error',
      async check(ctx) {
        if (!(await storeExists(ctx))) return;
        for (const file of (await ctx.glob(SCHEMA_GLOB)).sort()) {
          const source = await ctx.readFile(file);
          for (const object of source.matchAll(OBJECT_RE)) {
            const open = object.index + object[0].length - 1;
            for (const prop of properties(source, open)) {
              const text = stripComments(prop.text);
              const key = KEY_RE.exec(text);
              if (!key || ownDepth(text).includes('.describe(')) continue;
              ctx.report.violation({
                message: `Field '${key[2]}' has no .describe() — say what it means to the site (FE-013 [field-described]).`,
                file,
                line: lineAt(source, prop.at + prop.text.search(/\S/)),
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
