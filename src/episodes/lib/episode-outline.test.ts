import { describe, expect, it } from 'vitest';
import { episodeOutline } from './episode-outline.ts';

describe('success cases', () => {
  describe('episodeOutline', () => {
    it('names a pool Slide with its pool text layers, among the Episode own Slides in Section order', () => {
      // ARRANGE
      const expected = { pool: true, layers: ['src/episodes/slide-pool/one-prompt/i18n/en.json'] };
      // ACT
      const slide = episodeOutline('onboard-ai-every-time')
        .sections.flat()
        .find(({ slug }) => slug === 'one-prompt');
      // ASSERT
      expect({ pool: slide?.pool, layers: slide?.text.en }).toEqual(expected);
    });

    it("gives an Episode instance its Base Episode's text first and its own override after", () => {
      // ARRANGE
      const folder = 'by-event/2026-11-04-intro-hitl-workflows/ai-gives-you-more-work';
      const expected = ['src/episodes/ai-gives-you-more-work/i18n/en.json', `src/episodes/${folder}/i18n/en.json`];
      // ACT
      const layers = episodeOutline(folder).text.en;
      // ASSERT
      expect(layers).toEqual(expected);
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
