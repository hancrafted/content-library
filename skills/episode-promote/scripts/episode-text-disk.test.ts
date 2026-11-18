import { episodeRef } from '@/episodes/lib/episode-folders';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeTextOf } from './episode-text-disk.ts';

const ROOT = path.resolve(__dirname, '../../..');

describe('success cases', () => {
  describe('episodeTextOf', () => {
    it('reads an Episode that composes a pool Slide, naming the pool Slide among its Slides', () => {
      // ARRANGE
      const poolSlide = 'one-prompt';
      // ACT
      const text = episodeTextOf(ROOT, 'onboard-ai-every-time', 'en');
      // ASSERT
      expect(text).toContain(poolSlide);
    });
  });
});

describe('failure cases', () => {
  describe('episodeTextOf', () => {
    it('refuses a folder the registry knows no outline for, telling the reader to run `npm run registry`', () => {
      // ARRANGE
      const folder = 'ai-attention-span';
      // ACT
      const read = () => episodeTextOf(ROOT, `${folder}-gone`, 'en');
      // ASSERT
      expect(read).toThrow();
    });
  });
});

describe('edge cases', () => {
  describe('episodeTextOf', () => {
    it('reads the German text of the same Episode from the same text sources', () => {
      // ARRANGE
      const english = episodeTextOf(ROOT, 'onboard-ai-every-time', 'en');
      // ACT
      const german = episodeTextOf(ROOT, 'onboard-ai-every-time', 'de');
      // ASSERT
      expect(german).not.toBe(english);
    });
  });
  describe('episodeTextOf on an Episode instance', () => {
    it('prints the Base Episode title for the 10-23 copy that has no i18n/ of its own', () => {
      // ARRANGE
      const copy = episodeRef('ai-gives-you-more-work', '2026-10-23-axel-agentic-workflow');
      const title = 'Will AI reduce your work? It adds work: managing it.';
      // ACT
      const text = episodeTextOf(ROOT, `by-event/${copy.event}/${copy.slug}`, 'en');
      // ASSERT
      expect(text.split('\n')[0]).toBe(`# ${title}`);
    });
  });
});
