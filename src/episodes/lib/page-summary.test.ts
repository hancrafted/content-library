import { episodeRef } from '@/content-store/catalogue/episode-id.pure';
import { describe, expect, it } from 'vitest';
import { summaryOf } from './page-summary';
import { anchorTitleAt } from './page-summary.pure';

/*
 * The light summary (FE-004 §4): what a page says of itself, read without importing its Slides. That it says exactly
 * what its composition says, for every composed page, and names a Playlist anchor as the composition does, is an
 * Episode-level check (`composed-page-checks.ts`), run by each page folder's own `episode-checks.test.ts`.
 */

describe('success cases', () => {
  it("reads an Episode's German title without its Slides", () => {
    // ARRANGE
    const expected = 'Warum KI eine seltsame Aufmerksamkeitsspanne hat, die Du managen lernen musst';
    // ACT
    const { title } = summaryOf(episodeRef('ai-attention-span')).de;
    // ASSERT
    expect(title).toBe(expected);
  });

  it('names a page Slide by its own title when the anchor is that Slide', () => {
    // ARRANGE
    const expected = 'Make it a skill';
    const summary = {
      title: '',
      caption: '',
      description: '',
      minutes: 0,
      sections: [
        {
          id: 'hands-on',
          title: 'Hands-on',
          minutes: 0,
          items: [{ id: 'hands-on--make-it-a-skill', title: expected, minutes: 0 }],
        },
      ],
    };
    // ACT
    const title = anchorTitleAt(summary, 'hands-on--make-it-a-skill');
    // ASSERT
    expect(title).toBe(expected);
  });
});

describe('failure cases', () => {
  it('throws for an Episode the summaries do not hold', () => {
    // ARRANGE
    const unregistered = 'non-existent-episode';
    // ACT
    // @ts-expect-error
    const lookup = () => summaryOf(episodeRef(unregistered));
    // ASSERT
    expect(lookup).toThrow(unregistered);
  });

  it('names no Section for an anchor the page does not have', () => {
    // ARRANGE
    const anchor = 'no-such-section';
    // ACT
    const title = anchorTitleAt(summaryOf(episodeRef('onboard-ai-every-time')).en, anchor);
    // ASSERT
    expect(title).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('names the titled Slide an untitled Slide is folded into', () => {
    // ARRANGE
    const expected = 'Titled';
    const summary = {
      title: '',
      caption: '',
      description: '',
      minutes: 0,
      sections: [
        {
          id: 'section',
          title: expected,
          minutes: 0,
          items: [
            { id: 'section--titled', title: 'Titled', minutes: 0, unlisted: [{ id: 'section--quiet', minutes: 0 }] },
          ],
        },
      ],
    };
    // ACT
    const title = anchorTitleAt(summary, 'section--quiet');
    // ASSERT
    expect(title).toBe(expected);
  });

  it('keeps a Template apart from an Episode of the same slug', () => {
    // ARRANGE
    const template = 'workshop-template';
    // ACT
    // @ts-expect-error
    const lookup = () => summaryOf(episodeRef(template));
    // ASSERT
    expect(lookup).toThrow(template);
  });
});
