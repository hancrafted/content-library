import { describe, expect, it } from 'vitest';
import { specBriefKeys, specSlideAnchors, specSlides, specTitleSlideOptions } from './episode-spec-page.pure';

/* A Spec page's Slides read off its markup alone: Section, slug and Option ids in page order. */

const PAGE = `<!doctype html><html><body>
<section id="visual-language"><h2>Visual language</h2></section>
<section data-spec="section" id="why">
  <article data-spec="slide" id="spent" data-number="1">
    <figure data-spec="option" data-option="1a" data-recommended data-picked></figure>
    <figure data-spec="option" data-option="1b"></figure>
  </article>
  <article data-spec="slide" id="middle" data-number="2">
    <figure data-spec="option" data-option="2a"></figure>
    <figure data-spec="option" data-option="2b" data-recommended></figure>
    <figure data-spec="option" data-option="2c"></figure>
  </article>
</section>
<section data-spec="section" id="fix">
  <article data-spec="slide" id="trim" data-number="3">
    <figure data-spec="option" data-option="3a" data-recommended></figure>
  </article>
</section>
</body></html>`;

describe('success cases', () => {
  it('reads the Brief card note keys in page order, none when the card is read-only', () => {
    // ARRANGE
    const open = `<section data-spec="brief-card"><textarea name="note:brief--style"></textarea><textarea name="note:brief--constraints"></textarea></section>`;
    const locked = `<section data-spec="brief-card" data-locked><p>Text</p></section>`;
    // ACT
    const keys = [specBriefKeys(open), specBriefKeys(locked)];
    // ASSERT
    expect(keys).toEqual([['brief--style', 'brief--constraints'], []]);
  });

  it('reads each Slide with its Section and its Option ids, in page order', () => {
    // ARRANGE
    const expected = [
      { section: 'why', slug: 'spent', options: ['1a', '1b'], number: 1 },
      { section: 'why', slug: 'middle', options: ['2a', '2b', '2c'], number: 2 },
      { section: 'fix', slug: 'trim', options: ['3a'], number: 3 },
    ];
    // ACT
    const slides = specSlides(PAGE);
    // ASSERT
    expect(slides).toEqual(expected);
  });

  it('keys each Slide as feedback items do, `<section>--<slide>`', () => {
    // ARRANGE
    const expected = ['why--spent', 'why--middle', 'fix--trim'];
    // ACT
    const anchors = specSlideAnchors(PAGE);
    // ASSERT
    expect(anchors).toEqual(expected);
  });

  it('reads the Title slide Option ids in page order, and none from a Spec without it', () => {
    // ARRANGE
    const title = `<article data-spec="title-slide" id="top">
  <figure data-spec="option" data-option="0a"></figure>
  <figure data-spec="option" data-option="0b"></figure>
  <figure data-spec="option" data-option="0c"></figure>
</article>`;
    const page = PAGE.replace(
      '<section data-spec="section" id="why">',
      `${title}<section data-spec="section" id="why">`,
    );
    const expected = { with: ['0a', '0b', '0c'], without: undefined };
    // ACT
    const found = { with: specTitleSlideOptions(page), without: specTitleSlideOptions(PAGE) };
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads no Slides from a page that marks none', () => {
    // ARRANGE
    const page = '<!doctype html><html><body><article id="spent"><figure></figure></article></body></html>';
    // ACT
    const slides = specSlides(page);
    // ASSERT
    expect(slides).toEqual([]);
  });
});

describe('edge cases', () => {
  it('skips a Slide that sits in no Section, since no feedback item can key it', () => {
    // ARRANGE
    const page = PAGE.replace(
      '</body>',
      '<article data-spec="slide" id="stray" data-number="4"><figure data-spec="option" data-option="4a"></figure></article></body>',
    );
    const expected = ['why--spent', 'why--middle', 'fix--trim'];
    // ACT
    const anchors = specSlideAnchors(page);
    // ASSERT
    expect(anchors).toEqual(expected);
  });
});
