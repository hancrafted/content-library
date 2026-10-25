/// <reference path="../rules.d.ts" />

// FE-013 — Content Store. The parts of the decision that sit in file text: the
// content-model diagram names exactly the kinds the store loads, a record's type is
// inferred from its schema, and every schema field is described. Fail-closed
// loading and the refusals are held by the store's tests. Self-contained by
// design: archgate forbids imports between rules files.
//
// `field-described` walks the AST. `type-from-schema` matches text: archgate
// transpiles TypeScript before parsing, so interfaces and type aliases never reach
// the tree; strings and comments are blanked first, so prose never matches.

const STORE_ENTRY = 'src/content-store/store.ts';
const MODEL_FILE = 'docs/adr/0016-content-data-model.md';
const SCHEMA_GLOB = 'src/content-store/schemas/*.schema.ts';
const SOURCE_GLOB = 'src/**/*.{ts,tsx}';
const EPISODE_METADATA_RE = /^src\/components\/episodes\/[^/]+\/episode-metadata\.ts$/;

const MERMAID_RE = /```mermaid\n([\s\S]*?)```/g;
const STORE_LINE_RE = /^[ \t]*%%[ \t]*store:[ \t]*([^\n%]*)/m;
const OBJECT_FACTORIES = new Set(['object', 'strictObject', 'looseObject']);
const SHAPE_METHODS = new Set(['extend', 'safeExtend']);

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

function isTest(file: string): boolean {
  return /\.test\.tsx?$/.test(file);
}

/** `EVENT` → `event`, `SHARED_SLIDE` → `shared-slide`: the schema file's basename. */
function kindFile(entity: string): string {
  return entity.trim().toLowerCase().replace(/_/g, '-');
}

/** `SHARED_SLIDE` → `SharedSlide`: the name a hand-written type for the kind would carry. */
function kindType(entity: string): string {
  return entity
    .trim()
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** The `%% store:` line inside the model's mermaid blocks: its kinds and its offset in the file. */
function storeLine(model: string): { kinds: string[]; at: number } | undefined {
  for (const block of model.matchAll(MERMAID_RE)) {
    const line = STORE_LINE_RE.exec(block[1]);
    if (line) {
      const kinds = line[1]
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      return { kinds, at: block.index + '```mermaid\n'.length + line.index };
    }
  }
  return undefined;
}

/** The source with every comment, string and template literal blanked, offsets and line breaks kept. */
function blankText(source: string): string {
  const blank = (text: string) => text.replace(/[^\n]/g, ' ');
  let out = '';
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    let stop = i + 1;
    if (c === '/' && source[i + 1] === '/') {
      stop = source.indexOf('\n', i);
      if (stop < 0) stop = source.length;
      out += blank(source.slice(i, stop));
    } else if (c === '/' && source[i + 1] === '*') {
      stop = source.indexOf('*/', i + 2);
      stop = stop < 0 ? source.length : stop + 2;
      out += blank(source.slice(i, stop));
    } else if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < source.length && source[j] !== c) j += source[j] === '\\' ? 2 : 1;
      stop = Math.min(j + 1, source.length);
      out += c + blank(source.slice(i + 1, Math.min(j, source.length))) + (j < source.length ? c : '');
    } else out += c;
    i = stop;
  }
  return out;
}

/** Hand-written record shapes: `interface Episode…`, `type …Record = {`, `= Readonly<{`, `satisfies {`. */
function handTypes(text: string, names: RegExp, metadataFile: boolean): { at: number; what: string }[] {
  const found: { at: number; what: string }[] = [];
  const declared = /\b(interface|type)\s+([A-Za-z_$][\w$]*)(?:<[^>=]*>)?\s*(=\s*(?:Readonly\s*<\s*)?\{)?/g;
  for (const m of text.matchAll(declared)) {
    const objectShaped = m[1] === 'interface' || m[3] !== undefined;
    if (objectShaped && names.test(m[2])) found.push({ at: m.index, what: `${m[1]} ${m[2]}` });
  }
  if (metadataFile)
    for (const m of text.matchAll(/\bsatisfies\s*\{/g)) found.push({ at: m.index, what: 'satisfies {…}' });
  return found;
}

type Node = EsTreeNode;

function isNode(value: unknown): value is Node {
  return typeof value === 'object' && value !== null && typeof (value as Node).type === 'string';
}

function walk(node: Node, visit: (node: Node) => void): void {
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'range' || key === 'parent') continue;
    if (Array.isArray(value)) for (const child of value) if (isNode(child)) walk(child, visit);
    if (isNode(value)) walk(value, visit);
  }
}

function memberName(callee: Node): { object: Node; name: string } | undefined {
  if (callee.type !== 'MemberExpression' || callee.computed) return undefined;
  const property = callee.property as Node;
  return property.type === 'Identifier' ? { object: callee.object as Node, name: property.name as string } : undefined;
}

/** The shape argument of `z.object({…})`, `z.strictObject`, `z.looseObject`, `x.extend({…})`, `x.safeExtend({…})`. */
function shapeArgument(node: Node): Node | undefined | null {
  if (node.type !== 'CallExpression') return undefined;
  const member = memberName(node.callee as Node);
  if (!member) return undefined;
  const isFactory =
    OBJECT_FACTORIES.has(member.name) && member.object.type === 'Identifier' && member.object.name === 'z';
  if (!isFactory && !SHAPE_METHODS.has(member.name)) return undefined;
  const [shape] = node.arguments as Node[];
  return shape ?? null;
}

/** Whether `.describe(` sits on the field's own chain — `z.string().describe('…').optional()` — not inside an argument. */
function describedChain(value: Node): boolean {
  let node: Node | undefined = value;
  while (node) {
    if (node.type === 'CallExpression') {
      const member = memberName(node.callee as Node);
      if (!member) return false;
      if (member.name === 'describe') return true;
      node = member.object;
    } else if (node.type === 'MemberExpression') node = node.object as Node;
    else if (node.type === 'TSAsExpression' || node.type === 'TSSatisfiesExpression') node = node.expression as Node;
    else return false;
  }
  return false;
}

/**
 * archgate's TypeScript tree is transpiled, so its lines drift up wherever types were
 * erased. The real line is the first match of `pattern` at or below the hint.
 */
function sourceLine(source: string, hint: number | undefined, pattern: RegExp): number | undefined {
  if (hint === undefined) return undefined;
  const lines = source.split('\n');
  for (let i = hint - 1; i < lines.length; i++) if (pattern.test(lines[i])) return i + 1;
  return hint;
}

function propertyPattern(key: string): RegExp {
  const name = key.replace(/[$]/g, '\\$&');
  return new RegExp(`(?:^|[{,\\s])['"]?${name}['"]?\\s*[:,}]|^\\s*${name}\\s*$`);
}

function keyName(property: Node): string {
  const key = property.key as Node;
  if (key.type === 'Identifier') return key.name as string;
  if (key.type === 'Literal') return String(key.value);
  return '[computed]';
}

export default {
  rules: {
    'model-matches-store': {
      description:
        "The content-model diagram's `%% store:` line names exactly the record kinds that have a schema file in the store, and the store's entry imports each one.",
      severity: 'error',
      async check(ctx) {
        if ((await ctx.glob(MODEL_FILE)).length === 0) {
          ctx.report.violation({
            message: `${MODEL_FILE} is missing — its diagram's \`%% store:\` line names the record kinds; repoint this rule if it moved (FE-013 [model-matches-store]).`,
          });
          return;
        }
        const model = await ctx.readFile(MODEL_FILE);
        const line = storeLine(model);
        if (!line) {
          ctx.report.violation({
            message: `No mermaid block in ${MODEL_FILE} carries a \`%% store:\` line naming the record kinds (FE-013 [model-matches-store]).`,
            file: MODEL_FILE,
          });
          return;
        }
        if ((await ctx.glob(STORE_ENTRY)).length === 0) {
          ctx.report.violation({
            message: `${STORE_ENTRY} is missing — every record enters the site through the store's one entry; repoint this rule if it moved (FE-013 [model-matches-store]).`,
          });
          return;
        }
        const modelled = line.kinds.map(kindFile);
        const modelLine = lineAt(model, line.at);
        const entry = await ctx.readFile(STORE_ENTRY);
        const schemas = (await ctx.glob(SCHEMA_GLOB)).map((file) => ({
          file,
          kind: file.slice(file.lastIndexOf('/') + 1, -'.schema.ts'.length),
        }));
        for (const kind of modelled.filter((k) => !schemas.some((s) => s.kind === k))) {
          ctx.report.violation({
            message: `The diagram names ${kind.toUpperCase().replace(/-/g, '_')} as a stored record, but src/content-store/schemas/${kind}.schema.ts does not exist (FE-013 [model-matches-store]).`,
            file: MODEL_FILE,
            line: modelLine,
          });
        }
        for (const { file, kind } of schemas) {
          if (!modelled.includes(kind)) {
            ctx.report.violation({
              message: `${file} has no entry on the diagram's \`%% store:\` line in ${MODEL_FILE}; add the entity, or move a shared fragment to schemas/fields.ts (FE-013 [model-matches-store]).`,
              file,
            });
          } else if (!new RegExp(`['"]\\./schemas/${kind}\\.schema['"]`).test(entry)) {
            ctx.report.violation({
              message: `${STORE_ENTRY} never imports ./schemas/${kind}.schema — a modelled kind the store does not load (FE-013 [model-matches-store]).`,
              file: STORE_ENTRY,
            });
          }
        }
      },
    },
    'type-from-schema': {
      description:
        'No hand-written interface or object type for a record anywhere under src/ — named after a stored kind or ending in Metadata or Record — and no `satisfies {…}` in an Episode metadata file: a record type is z.infer of its schema.',
      severity: 'error',
      async check(ctx) {
        const model = (await ctx.glob(MODEL_FILE)).length > 0 ? await ctx.readFile(MODEL_FILE) : '';
        const kinds = (storeLine(model)?.kinds ?? []).map(kindType);
        const names = new RegExp(`^(?:${[...kinds, '\\w*Metadata', '\\w*Record'].join('|')})$`);
        for (const file of (await ctx.glob(SOURCE_GLOB)).filter((f) => !isTest(f)).sort()) {
          const source = await ctx.readFile(file);
          for (const hit of handTypes(blankText(source), names, EPISODE_METADATA_RE.test(file))) {
            ctx.report.violation({
              message: `'${hit.what}' hand-writes a record's type — import the z.infer type from src/content-store/schemas/ (FE-013 [type-from-schema]).`,
              file,
              line: lineAt(source, hit.at),
            });
          }
        }
      },
    },
    'field-described': {
      description:
        'Every field of every object shape in a store schema — z.object, z.strictObject, z.looseObject, .extend, .safeExtend — is written inline and carries .describe( on its own chain.',
      severity: 'error',
      async check(ctx) {
        for (const file of (await ctx.glob(SCHEMA_GLOB)).sort()) {
          const tree = await ctx.ast(file, 'typescript');
          const source = await ctx.readFile(file);
          walk(tree, (node) => {
            const shape = shapeArgument(node);
            if (shape === undefined) return;
            const line = sourceLine(source, node.loc?.start.line, /\b(?:z\.\w*[oO]bject|\.(?:safeE|e)xtend)\s*\(/);
            if (shape === null || shape.type !== 'ObjectExpression') {
              ctx.report.violation({
                message: `An object shape is passed by reference — write it inline so each field's .describe() is checked (FE-013 [field-described]).`,
                file,
                line,
              });
              return;
            }
            for (const property of shape.properties as Node[]) {
              if (property.type !== 'Property' || describedChain(property.value as Node)) continue;
              ctx.report.violation({
                message: `Field '${keyName(property)}' has no .describe() on its own chain — say what it means to the site (FE-013 [field-described]).`,
                file,
                line: sourceLine(source, property.loc?.start.line, propertyPattern(keyName(property))),
              });
            }
          });
        }
      },
    },
  },
} satisfies RuleSet;
