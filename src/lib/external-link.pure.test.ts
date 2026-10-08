import { describe, expect, it } from 'vitest';
import { externalHref } from './external-link.pure';

describe('externalHref', () => {
  it('passes an https URL through unchanged', () => {
    expect(externalHref('https://code.claude.com/docs/en/memory')).toBe('https://code.claude.com/docs/en/memory');
  });

  it.each(['http://example.com', 'javascript:alert(1)', '/de/episode', 'example.com', ''])('rejects %j', (url) => {
    expect(() => externalHref(url)).toThrow(/https/);
  });
});
