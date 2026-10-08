import { describe, expect, it } from 'vitest';
import { episodeAnchors, type EpisodeOutline } from './episode.pure';

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
