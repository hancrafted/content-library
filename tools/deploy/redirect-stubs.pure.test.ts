import { describe, expect, it } from 'vitest';
import { redirectStubHtml, redirectStubPlan } from './redirect-stubs.pure.ts';

const ORIGIN = 'https://hancrafted.net';

describe('redirectStubHtml', () => {
  it('refreshes at once and names the new URL as canonical', () => {
    // ARRANGE
    const target = `${ORIGIN}/de/`;
    // ACT
    const html = redirectStubHtml(target);
    // ASSERT
    expect(html).toContain(`<meta http-equiv="refresh" content="0; url=${target}">`);
    expect(html).toContain(`<link rel="canonical" href="${target}">`);
  });

  it('escapes a quote in the target so it cannot break out of the attribute', () => {
    // ARRANGE
    const target = `${ORIGIN}/a"b/`;
    // ACT
    const html = redirectStubHtml(target);
    // ASSERT
    expect(html).not.toContain('a"b');
    expect(html).toContain('a&quot;b');
  });
});

describe('redirectStubPlan', () => {
  it('maps each exported file to the same path on the new origin, with no old base path', () => {
    // ARRANGE
    const files = ['index.html', 'de/index.html', 'episodes/ai-token-economy/index.html'];
    const expected = [
      { file: 'index.html', target: `${ORIGIN}/` },
      { file: 'de/index.html', target: `${ORIGIN}/de/` },
      { file: 'episodes/ai-token-economy/index.html', target: `${ORIGIN}/episodes/ai-token-economy/` },
    ];
    // ACT
    const plan = redirectStubPlan(files, ORIGIN);
    // ASSERT
    expect(plan).toEqual(expected);
  });

  it('sends the 404 page to the home page and tolerates a trailing slash on the origin', () => {
    // ARRANGE
    const files = ['404.html'];
    // ACT
    const plan = redirectStubPlan(files, `${ORIGIN}/`);
    // ASSERT
    expect(plan).toEqual([{ file: '404.html', target: `${ORIGIN}/` }]);
  });

  it('skips files that are not pages', () => {
    // ARRANGE
    const files = ['_next/static/x.js', '_next/static/chunks/frame.html', 'favicon.ico', 'index.html'];
    // ACT
    const plan = redirectStubPlan(files, ORIGIN);
    // ASSERT
    expect(plan.map((entry) => entry.file)).toEqual(['index.html']);
  });
});
