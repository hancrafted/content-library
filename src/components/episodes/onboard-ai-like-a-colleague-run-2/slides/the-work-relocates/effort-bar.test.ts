import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EffortBar } from './effort-bar';

const SEGMENTS = [
  { slug: 'briefing', label: 'briefing', tone: 'human', weight: 2 },
  { slug: 'checking', label: 'checking', tone: 'human', weight: 2.5 },
  { slug: 'ai', label: 'AI', tone: 'ai', weight: 1 },
] as const;

/** One effort bar rendered to static markup, as the server sends it. */
function bar(props: Partial<Parameters<typeof EffortBar>[0]> = {}): string {
  return renderToStaticMarkup(createElement(EffortBar, { segments: SEGMENTS, ...props }));
}

/** The segments of the bar's row, in order, with their style and class. */
function segments(html: string) {
  return [...html.matchAll(/<span[^>]*data-segment="([^"]+)"[^>]*>/g)].map(([tag, slug]) => ({
    slug,
    style: /style="([^"]*)"/.exec(tag)?.[1],
    cls: /class="([^"]*)"/.exec(tag)?.[1] ?? '',
    hidden: tag.includes('aria-hidden="true"'),
  }));
}

describe('success cases', () => {
  it('draws one segment per entry, each growing by its weight', () => {
    // ARRANGE
    const expected = [
      { slug: 'briefing', style: 'flex-grow:2' },
      { slug: 'checking', style: 'flex-grow:2.5' },
      { slug: 'ai', style: 'flex-grow:1' },
    ];
    // ACT
    const drawn = segments(bar()).map(({ slug, style }) => ({ slug, style }));
    // ASSERT
    expect(drawn).toEqual(expected);
  });

  it('colours a segment by its tone: your judgement in human, the AI in ai, typing neutral', () => {
    // ARRANGE
    const typing = [{ slug: 'typing', label: 'typing it yourself', tone: 'typing', weight: 9 }] as const;
    // ACT
    const [briefing, , ai] = segments(bar());
    const [own] = segments(bar({ segments: typing }));
    // ASSERT
    expect(briefing.cls.split(' ')).toEqual(expect.arrayContaining(['bg-human/20', 'border-t-2', 'border-human']));
    expect(ai.cls.split(' ')).toContain('bg-ai');
    expect(own.cls.split(' ')).toEqual(expect.arrayContaining(['bg-muted', 'border', 'border-border']));
  });

  it('writes each label under the bar, never inside a segment', () => {
    // ARRANGE
    const expected = ['briefing', 'checking', 'AI'];
    // ACT
    const html = bar();
    const row = /<div[^>]*data-bar[^>]*>(.*?)<\/div>/.exec(html)?.[1] ?? '';
    // ASSERT
    for (const label of expected) expect(html).toContain(`>${label}<`);
    expect(row).not.toMatch(/>[^<]+</);
  });

  it('marks the bar as the Slide target it is given', () => {
    // ARRANGE
    const expected = 'data-target="relocated"';
    // ACT
    const html = bar({ 'data-target': 'relocated' });
    // ASSERT
    expect(html).toContain(expected);
  });
});

describe('failure cases', () => {
  it('carries no hidden typing segment when the bar is not animated', () => {
    // ARRANGE
    const expected = SEGMENTS.length;
    // ACT
    const drawn = segments(bar());
    // ASSERT
    expect(drawn).toHaveLength(expected);
    expect(drawn.some(({ hidden }) => hidden)).toBe(false);
  });
});

describe('edge cases', () => {
  it('prepends a hidden typing segment at rest weight 0 when animated, so the finished picture is the base', () => {
    // ARRANGE
    const expected = { slug: 'typing', hidden: true, style: 'flex-grow:0' };
    // ACT
    const [typing, ...rest] = segments(bar({ animated: true }));
    // ASSERT
    expect(typing).toMatchObject(expected);
    expect(rest.map(({ style }) => style)).toEqual(['flex-grow:2', 'flex-grow:2.5', 'flex-grow:1']);
  });
});
