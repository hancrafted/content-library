import { describe, expect, it } from 'vitest';
import { externalHref } from './external-link.pure';

describe('success cases', () => {
  it('passes an https URL through unchanged', () => {
    // ARRANGE
    const url = 'https://code.claude.com/docs/en/memory';
    // ACT
    const href = externalHref(url);
    // ASSERT
    expect(href).toBe('https://code.claude.com/docs/en/memory');
  });
});

describe('failure cases', () => {
  it.each(['http://example.com', 'javascript:alert(1)', '/de/episode', 'example.com'])('rejects %j', (url) => {
    // ARRANGE
    const required = /https/;
    // ACT
    const run = () => externalHref(url);
    // ASSERT
    expect(run).toThrow(required);
  });
});

describe('edge cases', () => {
  it('rejects ""', () => {
    // ARRANGE
    const required = /https/;
    // ACT
    const run = () => externalHref('');
    // ASSERT
    expect(run).toThrow(required);
  });
});
