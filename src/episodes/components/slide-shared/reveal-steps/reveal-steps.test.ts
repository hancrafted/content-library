import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function rules(): { selector: string; body: string }[] {
  const css = readFileSync(join(__dirname, 'reveal-steps.module.css'), 'utf8')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/@media[^{]*\{/g, '');
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector = '', body = '']) => ({
    selector: selector.replaceAll(/\s+/g, ' ').trim(),
    body,
  }));
}

const resting = () => rules().filter((rule) => rule.selector.startsWith('.wall[data-step] [data-reveal]'));

describe('success cases', () => {
  it('dims a step not yet revealed in a form the contrast check measures: text by colour, the rest by opacity', () => {
    // ARRANGE
    const expected = { text: true, figures: true };
    // ACT
    const dimming = {
      text: resting().some((rule) => /\*$/.test(rule.selector) && /color:\s*var\(--muted-foreground\)/.test(rule.body)),
      figures: resting().some((rule) => /svg$/.test(rule.selector) && /opacity:\s*0\.25/.test(rule.body)),
    };
    // ASSERT
    expect(dimming).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never hides a step not yet revealed, nor dims it with a filter', () => {
    // ARRANGE
    const expected = { filter: false, hidden: false };
    // ACT
    const found = {
      filter: rules().some((rule) => /filter\s*:/.test(rule.body)),
      hidden: resting().some((rule) => /visibility:\s*hidden|display:\s*none|opacity:\s*0(?![.\d])/.test(rule.body)),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('finds the resting rules, so an empty parse cannot pass', () => {
    // ARRANGE
    const none = 0;
    // ACT
    const found = resting().length;
    // ASSERT
    expect(found).toBeGreaterThan(none);
  });
});
