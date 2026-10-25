/// <reference path="../rules.d.ts" />

// Sibling test for FE-013-content-store.rules.ts — the executable spec the store
// ticket turns green: pass and fail for each rule, the dormant state before the
// store's entry exists, and the edges: a moved diagram, nested objects, commas
// and braces inside descriptions, and a type that is not a record's.

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-013-content-store.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

// Stands in for archgate's RuleContext over an in-memory file set. Globs resolve
// exact paths and the `*` / `**` forms the rules use.
function makeCtx(files: Record<string, string>) {
  const violations: Reported[] = [];
  const toRegExp = (glob: string) =>
    new RegExp(
      `^${glob
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*\//g, '\u0000')
        .replace(/\*/g, '[^/]*')
        .replace(/\u0000/g, '(?:.*/)?')}$`,
    );
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      const re = toRegExp(pattern);
      return Object.keys(files).filter((f) => re.test(f));
    },
    async readFile(path: string) {
      if (path in files) return files[path];
      throw new Error(`ENOENT: ${path}`);
    },
    report: {
      violation: (detail: Reported) => violations.push(detail),
      warning: () => {},
      info: () => {},
    },
  } as unknown as RuleContext;
  return { ctx, violations };
}

const STORE = 'src/content-store/store.ts';
const MODEL = 'docs/adr/0016-content-data-model.md';
const schema = (kind: string) => `src/content-store/schemas/${kind}.schema.ts`;
const diagram = (line: string) =>
  `# Content data model\n\n\`\`\`mermaid\nerDiagram\n    ${line}\n    %% planned: SHARED_SLIDE\n\`\`\`\n`;
const DESCRIBED = `import { z } from 'zod';\nexport const s = z.object({\n  slug: z.string().describe('The URL name.'),\n});\nexport type S = z.infer<typeof s>;\n`;

describe('model-matches-store', () => {
  const rule = ruleSet.rules['model-matches-store'];
  const PROVENANCE = '(FE-013 [model-matches-store])';

  it('passes when the store line and the schema files name the same kinds', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram('%% store: EVENT, PLAYLIST, EPISODE'),
      [STORE]: '',
      [schema('event')]: DESCRIBED,
      [schema('playlist')]: DESCRIBED,
      [schema('episode')]: DESCRIBED,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('maps SHARED_SLIDE to shared-slide.schema.ts', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram('%% store: SHARED_SLIDE'),
      [STORE]: '',
      [schema('shared-slide')]: DESCRIBED,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails a kind the diagram names that has no schema', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram('%% store: EVENT, TAG'),
      [STORE]: '',
      [schema('event')]: DESCRIBED,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => [v.file, v.line])).toEqual([[MODEL, 5]]);
    expect(violations[0]?.message).toContain('tag.schema.ts');
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('fails a schema the diagram does not name', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [MODEL]: diagram('%% store: EVENT'),
      [STORE]: '',
      [schema('event')]: DESCRIBED,
      [schema('tag')]: DESCRIBED,
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => v.file)).toEqual([schema('tag')]);
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

  it('fails a moved or deleted model file, even before the store exists', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({});
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0]?.message).toContain(MODEL);
  });

  it('stays dormant on the schemas while the store entry does not exist', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [MODEL]: diagram('%% store: EVENT, PLAYLIST, EPISODE') });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });
});

describe('type-from-schema', () => {
  const rule = ruleSet.rules['type-from-schema'];
  const PROVENANCE = '(FE-013 [type-from-schema])';

  it('passes a type inferred from its schema and a plain metadata record', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [STORE]: 'export function list(options?: { drafts?: boolean }) { return options; }\n',
      [schema('event')]: DESCRIBED,
      'src/components/episodes/probe/episode-metadata.ts':
        "import type { EpisodeInput } from '@/content-store/schemas/episode.schema';\nexport const episodeMetadata = { slug: 'probe' } as const satisfies EpisodeInput;\n",
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails a hand-written interface and object type in the store and in Episode metadata', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [STORE]: '',
      [schema('event')]: `${DESCRIBED}export interface EventRecord {\n  slug: string;\n}\n`,
      'src/content-store/refusals.ts': 'type Problem<T> = {\n  record: T;\n};\n',
      'src/components/episodes/probe/episode-metadata.ts': 'type Meta = { slug: string };\n',
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => [v.file, v.line])).toEqual([
      ['src/components/episodes/probe/episode-metadata.ts', 1],
      ['src/content-store/refusals.ts', 1],
      [schema('event'), 6],
    ]);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('ignores tests and a type named only in a comment', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      [STORE]: '// never write interface EventRecord {}\n',
      'src/content-store/store.test.ts': 'interface Fixture { a: 1 }\n',
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('stays dormant while the store entry does not exist', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({
      'src/components/episodes/probe/episode-metadata.ts': 'interface Meta { slug: string }\n',
    });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });
});

describe('field-described', () => {
  const rule = ruleSet.rules['field-described'];
  const PROVENANCE = '(FE-013 [field-described])';

  it('passes described fields, multi-line chains, and commas or braces inside a description', async () => {
    // ARRANGE
    const source = [
      "import { z } from 'zod';",
      'export const eventSchema = z.object({',
      "  slug: z.string().describe('<date>-<name>, as in 2026-10-23-axel.'),",
      '  date: isoDate',
      "    .describe('The day, {local} time.'),",
      "  meta: z.object({ a: z.string().describe('a') }).describe('Nested, described.'),",
      '  ...base.shape,',
      '});',
    ].join('\n');
    const { ctx, violations } = makeCtx({ [STORE]: '', [schema('event')]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('fails each undescribed field, the outer one of a nested object included', async () => {
    // ARRANGE
    const source = [
      "import { z } from 'zod';",
      'export const eventSchema = z.object({',
      '  slug: z.string(),',
      "  meta: z.object({ a: z.string().describe('a'), b: z.number() }),",
      "  date: isoDate.describe('The day.'),",
      '});',
    ].join('\n');
    const { ctx, violations } = makeCtx({ [STORE]: '', [schema('event')]: source });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations.map((v) => [v.line, v.message.split("'")[1]]).sort()).toEqual([
      [3, 'slug'],
      [4, 'b'],
      [4, 'meta'],
    ]);
    expect(violations[0]?.message).toContain(PROVENANCE);
  });

  it('stays dormant while the store entry does not exist', async () => {
    // ARRANGE
    const { ctx, violations } = makeCtx({ [schema('event')]: 'export const s = z.object({ slug: z.string() });\n' });
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });
});
