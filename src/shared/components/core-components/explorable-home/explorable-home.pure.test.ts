import { describe, expect, it } from 'vitest';
import { explorableHomeSlugs } from './explorable-home.pure';

describe('success cases', () => {
  it('keeps each built Explorable page, so an Explorable links to the page of its own slug', () => {
    // ARRANGE
    const pages = ['context-window', 'ai-capability'];
    // ACT
    const slugs = explorableHomeSlugs(pages);
    // ASSERT
    expect(slugs).toEqual(pages);
  });

  it('leaves out the page being rendered, so a page does not link to itself', () => {
    // ARRANGE
    const pages = ['context-window', 'ai-capability'];
    // ACT
    const slugs = explorableHomeSlugs(pages, 'context-window');
    // ASSERT
    expect(slugs).toEqual(['ai-capability']);
  });
});

describe('failure cases', () => {
  it('has no home for an Explorable whose slug names no built page', () => {
    // ARRANGE
    const slugs = explorableHomeSlugs(['context-window']);
    // ACT
    const hasHome = slugs.includes('speech-bubble');
    // ASSERT
    expect(hasHome).toBe(false);
  });
});

describe('edge cases', () => {
  it('is empty when no page is built', () => {
    // ARRANGE
    const pages: string[] = [];
    // ACT
    const slugs = explorableHomeSlugs(pages, 'context-window');
    // ASSERT
    expect(slugs).toEqual([]);
  });
});
