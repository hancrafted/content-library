import { describe, expect, it } from 'vitest';
import { episodeAnchors, targetAnchor, titleAnchor, type EpisodeOutline } from './episode.pure';

describe('success cases', () => {
  it('lists every slide anchor in page order, a slideless section included', () => {
    // ARRANGE
    const outline: EpisodeOutline = [
      { slug: 'foundations', slides: ['why-a-template', 'three-pillars'] },
      { slug: 'interlude', slides: [] },
      { slug: 'next-steps', slides: ['recap'] },
    ];
    const expected = [
      'foundations',
      'foundations--why-a-template',
      'foundations--three-pillars',
      'interlude',
      'next-steps',
      'next-steps--recap',
    ];
    // ACT
    const anchors = episodeAnchors(outline);
    // ASSERT
    expect(anchors).toEqual(expected);
  });
  it('joins a Slide anchor and an element name with a double hyphen, never equal to a two-part Slide anchor', () => {
    // ARRANGE
    const expected = 'foundations--why--prose';
    const slideAnchor = 'foundations--why';
    // ACT
    const anchor = targetAnchor(slideAnchor, 'prose');
    // ASSERT
    expect(anchor).toBe(expected);
    expect(anchor).not.toBe(slideAnchor);
  });
});

describe('failure cases', () => {
  it('rejects two slides sharing a slug within a section', () => {
    // ARRANGE
    const outline: EpisodeOutline = [{ slug: 'next-steps', slides: ['recap', 'recap'] }];
    const duplicate = 'next-steps--recap';
    // ACT
    const build = () => episodeAnchors(outline);
    // ASSERT
    expect(build).toThrow(duplicate);
  });

  it('rejects a slug that is not lowercase kebab-case', () => {
    // ARRANGE
    const badSlug = 'Why A Template';
    const outline: EpisodeOutline = [{ slug: 'foundations', slides: [badSlug] }];
    // ACT
    const build = () => episodeAnchors(outline);
    // ASSERT
    expect(build).toThrow(badSlug);
  });
  it('rejects an element name that is not kebab-case', () => {
    // ARRANGE
    const bad = 'Not Kebab';
    // ACT
    const build = () => targetAnchor('foundations--why', bad);
    // ASSERT
    expect(build).toThrow(bad);
  });
});

describe('edge cases', () => {
  it('rejects a double hyphen, which would collide with a section--slide anchor', () => {
    // ARRANGE
    const outline: EpisodeOutline = [
      { slug: 'next', slides: ['steps'] },
      { slug: 'next--steps', slides: [] },
    ];
    const badSlug = 'next--steps';
    // ACT
    const build = () => episodeAnchors(outline);
    // ASSERT
    expect(build).toThrow(badSlug);
  });
});

describe('the Title slide anchor', () => {
  it('is `top`, the one id no Section or Slide may take', () => {
    // ARRANGE / ACT
    const anchor = titleAnchor();
    // ASSERT
    expect(anchor).toBe('top');
  });

  it('rejects `top` as a Section slug, which would collide with the Title slide', () => {
    // ARRANGE
    const outline: EpisodeOutline = [{ slug: 'top', slides: [] }];
    // ACT
    const build = () => episodeAnchors(outline);
    // ASSERT
    expect(build).toThrow('top');
  });

  it('rejects `top` as a Slide slug', () => {
    // ARRANGE
    const outline: EpisodeOutline = [{ slug: 'intro', slides: ['top'] }];
    // ACT
    const build = () => episodeAnchors(outline);
    // ASSERT
    expect(build).toThrow('top');
  });
});
