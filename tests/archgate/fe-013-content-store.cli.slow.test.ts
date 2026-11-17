// decision: GEN-001 §2
// decision: ARCH-003 §4.4
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const REPO = path.resolve(import.meta.dirname, '../..');
const ARCHGATE = path.join(REPO, 'node_modules/.bin/archgate');
const RULE_FILES = [
  '.archgate/config.json',
  '.archgate/adrs/FE-013-content-store.md',
  '.archgate/adrs/FE-013-content-store.rules.ts',
];
const roots: string[] = [];

interface Violation {
  message: string;
  file?: string;
  line?: number;
}

function checkFE013ThroughCliInFixtureRoot(files: Record<string, string>): Violation[] {
  const root = mkdtempSync(path.join(tmpdir(), 'fe013-'));
  roots.push(root);
  for (const file of RULE_FILES) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    cpSync(path.join(REPO, file), path.join(root, file));
  }
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  let out: string;
  try {
    out = execFileSync(ARCHGATE, ['check', '--adr', 'FE-013', '--output', 'json'], { cwd: root, encoding: 'utf8' });
  } catch (nonZeroExitOnViolation) {
    out = (nonZeroExitOnViolation as { stdout: string }).stdout;
  }
  return (JSON.parse(out) as { results: { violations: Violation[] }[] }).results.flatMap((r) => r.violations);
}

afterAll(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

describe('field-described through the archgate CLI', () => {
  it('reports each undescribed field at its source line, after an erased type shifts the transpiled lines', () => {
    // ARRANGE
    const schemaFile = 'src/content-store/schemas/event.schema.ts';
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
    // ACT
    const violations = checkFE013ThroughCliInFixtureRoot({
      'docs/decision-records/0016-content-data-model.md': '# M\n\n```mermaid\nerDiagram\n    %% store: EVENT\n```\n',
      'src/content-store/store.ts': "import './schemas/event.schema';\n",
      [schemaFile]: source,
    });
    // ASSERT
    const fields = violations.filter((v) => v.file === schemaFile).map((v) => [v.line, v.message.split("'")[1]]);
    expect(fields.sort((a, b) => Number(a[0]) - Number(b[0]) || String(a[1]).localeCompare(String(b[1])))).toEqual(
      expected,
    );
  });
});
