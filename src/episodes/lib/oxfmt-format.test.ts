import { describe, expect, it } from 'vitest';
import { formatAsRepo } from './oxfmt-format.ts';

describe('success cases', () => {
  it('formats TypeScript with the repo options: single quotes, semicolons and a 120 column width', async () => {
    // ARRANGE
    const source = 'export const a = ["x"]\n';

    // ACT
    const out = await formatAsRepo('a.ts', source);

    // ASSERT
    expect(out).toBe("export const a = ['x'];\n");
  });

  it('formats JSON by the file name it is given', async () => {
    // ARRANGE
    const source = '{"a":[1,2]}';

    // ACT
    const out = await formatAsRepo('a.json', source);

    // ASSERT
    expect(out).toBe('{ "a": [1, 2] }\n');
  });
});

describe('failure cases', () => {
  it('throws when the source does not parse, so a script never writes a half-formatted file', async () => {
    // ARRANGE
    const source = 'export const = ;\n';

    // ACT
    const act = formatAsRepo('a.ts', source);

    // ASSERT
    await expect(act).rejects.toThrow();
  });
});

describe('edge cases', () => {
  it('keeps a call of 118 columns on one line, so printWidth is 120 and not oxfmt’s default of 100', async () => {
    // ARRANGE
    const source = `export const value = call(${'a'.repeat(40)}, ${'b'.repeat(40)}, ${'c'.repeat(6)});\n`;

    // ACT
    const out = await formatAsRepo('a.ts', source);

    // ASSERT
    expect(out).toBe(source);
  });
});
