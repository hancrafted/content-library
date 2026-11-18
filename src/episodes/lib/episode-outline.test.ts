import { describe, expect, it } from 'vitest';
import { episodeOutline } from './episode-outline.ts';

describe('success cases', () => {
  describe('episodeOutline', () => {
    it('names a pool Slide with its pool text source, among the Episode own Slides in Section order', () => {
      // ARRANGE
      const expected = { slug: 'one-prompt', pool: true, textSource: 'src/episodes/slide-pool/one-prompt/i18n' };
      // ACT
      const slides = episodeOutline('onboard-ai-every-time').sections.flat();
      // ASSERT
      expect(slides).toContainEqual(expect.objectContaining(expected));
    });

    it('gives the Title slide the top anchor and each Section Slide its placed anchor', () => {
      // ARRANGE
      const outline = episodeOutline('ai-attention-span');
      // ACT
      const anchors = [outline.title?.anchor, outline.sections[0]?.[1]?.anchor];
      // ASSERT
      expect(anchors).toEqual(['top', 'thought-experiment--the-long-phone-call-story']);
    });
  });
});

describe('failure cases', () => {
  describe('episodeOutline', () => {
    it('refuses an Episode folder the registry wrote no outline for', () => {
      // ARRANGE
      const message = /No outline for the Episode folder "no-such-episode".*npm run registry/;
      // ACT
      const outline = () => episodeOutline('no-such-episode');
      // ASSERT
      expect(outline).toThrow(message);
    });
  });
});

describe('edge cases', () => {
  describe('episodeOutline', () => {
    it('finds an Event copy by its folder under by-event', () => {
      // ARRANGE
      const folder = 'by-event/2026-11-04-intro-hitl-workflows/ai-attention-span';
      // ACT
      const outline = episodeOutline(folder);
      // ASSERT
      expect(outline.sections.length).toBeGreaterThan(0);
    });
  });
});
