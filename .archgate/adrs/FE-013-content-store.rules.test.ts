/// <reference path="../rules.d.ts" />

// Sibling test for FE-013-content-store.rules.ts — the executable spec the store
// ticket turned green: pass and fail for each rule, a missing store entry, and the edges: a moved diagram, a `%% store:` line outside
// the diagram, nested and extended shapes, prose naming a type, and helper types.

import ts from 'typescript';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';
import ruleSet from './FE-013-content-store.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

/** A glob as a RegExp: `**​/`, `*` and `{a,b}`, the forms the rules use. */
function globRegExp(glob: string): RegExp {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (glob.startsWith('**/', i)) {
      re += '(?:.*/)?';
      i += 2;
    } else if (c === '*') re += '[^/]*';
    else if (c === '{') re += '(?:';
    else if (c === '}') re += ')';
    else if (c === ',') re += '|';
    else re += c.replace(/[.+^$()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

// Stands in for archgate's RuleContext over an in-memory file set. `ast` parses
// the transpiled output with typescript-eslint, as archgate does: types are erased, so
// the tree's lines drift from the source's, and the rule must map them back.
function makeCtx(files: Record<string, string>) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      const re = globRegExp(pattern);
      return Object.keys(files).filter((f) => re.test(f));
    },
    async readFile(path: string) {
      if (path in files) return files[path];
      throw new Error(`ENOENT: ${path}`);
    },
    async ast(path: string) {
      const source = await this.readFile(path);
      const js = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
      }).outputText;
      return tseslint.parser.parseForESLint(js, { loc: true, range: true }).ast;
    },
    report: {
      violation: (detail: Reported) => violations.push(detail),
      warning: () => {},
      info: () => {},
    },
  } as unknown as RuleContext;
  return { ctx, violations };
}

/** Orders `[line, field]` pairs numerically by line, then by field name. */
function byLineThenField(a: (number | string | undefined)[], b: (number | string | undefined)[]): number {
  return Number(a[0]) - Number(b[0]) || String(a[1]).localeCompare(String(b[1]));
}

const STORE = 'src/content-store/store.ts';
const MODEL = 'docs/adr/0016-content-data-model.md';
const schema = (kind: string) => `src/content-store/schemas/${kind}.schema.ts`;
const diagram = (line: string) =>
  `# Content data model\n\n\`\`\`mermaid\nerDiagram\n    ${line}\n    %% planned: SHARED_SLIDE\n\`\`\`\n`;
const entryImporting = (...kinds: string[]) =>
  kinds.map((kind) => `import { ${kind.replace(/-/g, '')}Schema } from './schemas/${kind}.schema';`).join('\n');
const DESCRIBED = `import { z } from 'zod';\nexport const s = z.object({\n  slug: z.string().describe('The URL name.'),\n});\nexport type S = z.infer<typeof s>;\n`;
const KINDS = ['event', 'playlist', 'episode'];
const STORE_LINE = '%% store: EVENT, PLAYLIST, EPISODE';

describe('model-matches-store', () => {
  const rule = ruleSet.rules['model-matches-store'];
  const PROVENANCE = '(FE-013 [model-matches-store])';

  it('passes when the store line, the schema files and the entry name the same kinds', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram(STORE_LINE),
      [STORE]: entryImporting(...KINDS),
      ...Object.fromEntries(KINDS.map((kind) => [schema(kind), DESCRIBED])),
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('maps SHARED_SLIDE to shared-slide.schema.ts and ignores a trailing %% comment', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram('%% store: SHARED_SLIDE %% loaded since horizon 2'),
      [STORE]: entryImporting('shared-slide'),
      [schema('shared-slide')]: DESCRIBED,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails a kind the diagram names that has no schema, at the store line', async () => {
    // ARRANGE
    const storeLineNumber = 5;
    const missing = 'tag.schema.ts';
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram('%% store: EVENT, TAG'),
      [STORE]: entryImporting('event'),
      [schema('event')]: DESCRIBED,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => [v.file, v.line])).toEqual([[MODEL, storeLineNumber]]);
    expect(violations[0]?.message).toContain(missing);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('fails a schema the diagram does not name, such as a shared fragment', async () => {
    // ARRANGE
    const fragment = schema('iso-date');
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram('%% store: EVENT'),
      [STORE]: entryImporting('event'),
      [schema('event')]: DESCRIBED,
      [fragment]: DESCRIBED,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual([fragment]);
  });

  it('fails a modelled schema the entry never imports', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram('%% store: EVENT, PLAYLIST'),
      [STORE]: entryImporting('event'),
      [schema('event')]: DESCRIBED,
      [schema('playlist')]: DESCRIBED,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual([STORE]);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('fails a diagram without a store line, even before the store exists', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [MODEL]: diagram('%% planned: TAG') });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual([MODEL]);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('reads the store line only inside a mermaid block, never from prose', async () => {
    // ARRANGE
    const prose = `Write the line as \`%% store: TAG\`.\n\n${diagram(STORE_LINE)}`;
    const { ctx, violations } = makeCtx({
      [MODEL]: prose,
      [STORE]: entryImporting(...KINDS),
      ...Object.fromEntries(KINDS.map((kind) => [schema(kind), DESCRIBED])),
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails a moved or deleted model file, even before the store exists', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({});
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0]?.message).toContain(MODEL);
  });

  it('fails a moved or deleted store entry, never passing the schemas silently', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [MODEL]: diagram(STORE_LINE) });
    const expected = 'src/content-store/store.ts is missing';
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0]?.message).toContain(expected);
  });
});

describe('type-from-schema', () => {
  const rule = ruleSet.rules['type-from-schema'];
  const PROVENANCE = '(FE-013 [type-from-schema])';
  const METADATA = 'src/episodes/probe/episode-metadata.ts';

  it('passes inferred types, helper types, other components and prose that names a type', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram(STORE_LINE),
      [STORE]:
        'type Problem<T> = { record: T };\nexport function list(options?: { drafts?: boolean }) { return options; }\n',
      [schema('event')]: `${DESCRIBED}export type Event = z.infer<typeof s>;\n`,
      [METADATA]:
        "import { episodeSchema } from '@/content-store/schemas/episode.schema';\nexport const episodeMetadata = episodeSchema.parse({ slug: 'probe' });\n",
      'src/episodes/components/episode-card/episode-card.tsx': 'interface EpisodeCardProps { slug: string }\n',
      'src/content-store/schemas/fields.ts':
        "export const language = z.enum(['en']).describe('The interface Episode = { spoken }.');\n",
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails hand-written record types anywhere under src/, and satisfies {…} in Episode metadata', async () => {
    // ARRANGE
    const expected = [
      ['src/content-store/refusals.ts', 1],
      ['src/episodes/lib/episode-metadata.pure.ts', 1],
      ['src/episodes/lib/episode-metadata.pure.ts', 2],
      ['src/episodes/probe/episode-metadata.ts', 1],
      ['src/page-assembly/sitemap/sitemap.pure.ts', 1],
    ];
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram(STORE_LINE),
      [STORE]: '',
      'src/content-store/refusals.ts': 'export type Playlist = Readonly<{ episodes: string[] }>;\n',
      'src/episodes/lib/episode-metadata.pure.ts':
        'export interface PublishedEpisodeMetadata { slug: string }\nexport type WorkshopRecord = { slug: string };\n',
      'src/page-assembly/sitemap/sitemap.pure.ts': 'interface Episode { slug: string }\n',
      [METADATA]: "export const episodeMetadata = { slug: 'probe' } as const satisfies { slug: string };\n",
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => [v.file, v.line])).toEqual(expected);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('ignores tests and a type named only in a comment', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram(STORE_LINE),
      [STORE]: '// never write interface EventRecord {}\n',
      'src/content-store/store.test.ts': 'interface EventRecord { a: 1 }\n',
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('checks every source file even while the store entry is missing', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram(STORE_LINE),
      'src/episodes/lib/episode-metadata.pure.ts': 'export interface EpisodeMetadata { slug: string }\n',
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual(['src/episodes/lib/episode-metadata.pure.ts']);
  });
});

describe('field-described', () => {
  const rule = ruleSet.rules['field-described'];
  const PROVENANCE = '(FE-013 [field-described])';

  it('passes described fields on every shape form, chained before or after other calls', async () => {
    // ARRANGE
    const source = [
      "import { z } from 'zod';",
      'export const eventSchema = z.object({',
      "  slug: z.string().regex(/^[a-z']+$/).describe('<date>-<name>, as in 2026-10-23-axel.'),",
      "  date: isoDate.describe('The day, {local} time.').optional(),",
      "  meta: z.strictObject({ a: z.string().describe('a') }).describe('Nested, described.'),",
      '  ...base.shape,',
      '});',
      "export const loose = z.looseObject({ b: z.number().describe('b') });",
      "export const more = eventSchema.extend({ c: z.boolean().describe('c') }).merge(loose);",
    ].join('\n');
    const { ctx, violations } = makeCtx({ [STORE]: '', [schema('event')]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails each undescribed field: plain, shorthand, nested, extended, and described only inside an argument', async () => {
    // ARRANGE
    const expected = [
      [5, 'slug'],
      [6, 'date'],
      [7, 'b'],
      [7, 'meta'],
      [8, 'tags'],
      [10, 'c'],
    ];
    const source = [
      "import { z } from 'zod';",
      'type Erased = string;',
      '',
      'export const eventSchema = z.object({',
      '  slug: z.string(),',
      '  date,',
      "  meta: z.object({ a: z.string().describe('a'), b: z.number() }),",
      "  tags: z.array(z.string().describe('A Tag.')),",
      '});',
      'export const more = eventSchema.safeExtend({ c: z.boolean() });',
    ].join('\n');
    const { ctx, violations } = makeCtx({ [STORE]: '', [schema('event')]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => [v.line, v.message.split("'")[1]]).sort(byLineThenField)).toEqual(expected);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('fails a shape passed by reference, since its fields cannot be checked', async () => {
    // ARRANGE
    const referenceLine = 3;
    const source = "import { z } from 'zod';\nconst shape = { slug: z.string() };\nexport const s = z.object(shape);\n";
    const { ctx, violations } = makeCtx({ [STORE]: '', [schema('event')]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.line)).toEqual([referenceLine]);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('checks every schema even while the store entry is missing', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [schema('event')]: 'export const s = z.object({ slug: z.string() });\n' });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual([schema('event')]);
  });
});
