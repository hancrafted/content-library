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
});
