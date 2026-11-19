import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// decision: docs/decision-records/0030-slide-surface-and-the-inverse-flag.md
const css = readFileSync(join(__dirname, '../../app/globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function block(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  return css.slice(start, css.indexOf('\n}', start));
}

function tokens(body: string): Map<string, string> {
  return new Map([...body.matchAll(/\n\s*--([\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
}

const light = tokens(block(':root'));
const dark = tokens(block('.dark'));
const themed = [...dark.keys()].filter((name) => !name.startsWith('inv-'));

describe('success cases', () => {
  it('carries every dark theme token as the inverse palette under :root', () => {
    // ARRANGE
    const expected = themed.map((name) => [name, dark.get(name)]);
    // ACT
    const carried = themed.map((name) => [name, light.get(`inv-${name}`)]);
    // ASSERT
    expect(carried).toEqual(expected);
  });

  it('carries every light theme token as the inverse palette under .dark', () => {
    // ARRANGE
    const expected = themed.map((name) => [name, light.get(name)]);
    // ACT
    const carried = themed.map((name) => [name, dark.get(`inv-${name}`)]);
    // ASSERT
    expect(carried).toEqual(expected);
  });

  it('swaps every theme token under the flag, and swaps back when the flag is nested', () => {
    // ARRANGE
    const swapped = tokens(block("[data-inverse],\nhtml[data-page-tone='inverse'] [data-testid='site-header']"));
    const restored = tokens(block('[data-inverse] [data-inverse]'));
    const expectedSwap = themed.map((name) => [name, `var(--inv-${name})`]);
    const expectedRestore = themed.map((name) => [name, `var(--org-${name})`]);
    // ACT
    const seenSwap = themed.map((name) => [name, swapped.get(name)]);
    const seenRestore = themed.map((name) => [name, restored.get(name)]);
    // ASSERT
    expect(seenSwap).toEqual(expectedSwap);
    expect(seenRestore).toEqual(expectedRestore);
  });
});

describe('failure cases', () => {
  it('keeps no retired tone selector', () => {
    // ARRANGE
    const retired = /data-tone|data-surface-tone|--tone-paper|--tone-ink/;
    // ACT
    const found = css.match(retired);
    // ASSERT
    expect(found).toBeNull();
  });
});

describe('edge cases', () => {
  it('makes the dark variant follow the flag', () => {
    // ARRANGE
    const variant = css.slice(
      css.indexOf('@custom-variant dark'),
      css.indexOf(');', css.indexOf('@custom-variant dark')),
    );
    // ACT
    const followsFlag = variant.includes('[data-inverse]');
    // ASSERT
    expect(followsFlag).toBe(true);
  });
});
