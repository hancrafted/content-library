import { describe, expect, it } from 'vitest';
import {
  readSpec,
  specBriefKeys,
  specSectionSlugs,
  specSlideAnchors,
  specTitleSlideOptions,
  type Spec,
} from './episode-spec-page.pure';
import { appendMetaVerified } from './staging-file.pure';

function specOf(html: string): Spec {
  return readSpec({ 'spec/spec.html': html });
}

const META = `<script type="application/json" id="spec-meta">
{ "type": "spec", "title": "Budget", "generated": { "by": "process:spec-assemble", "at": "2026-11-01T10:00:00Z" } }
</script>`;

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
    const keys = [specBriefKeys(specOf(open)), specBriefKeys(specOf(locked))];
    // ASSERT
    expect(keys).toEqual([['brief--style', 'brief--constraints'], []]);
  });

  it('reads each Slide with its Section and its Option ids, in page order', () => {
    // ARRANGE
    const expected = [
      { section: 'why', slug: 'spent', options: ['1a', '1b'] },
      { section: 'why', slug: 'middle', options: ['2a', '2b', '2c'] },
      { section: 'fix', slug: 'trim', options: ['3a'] },
    ];
    // ACT
    const { slides } = specOf(PAGE);
    // ASSERT
    expect(slides).toEqual(expected);
  });

  it('keys each Slide as feedback items do, `<section>--<slide>`', () => {
    // ARRANGE
    const expected = ['why--spent', 'why--middle', 'fix--trim'];
    // ACT
    const anchors = specSlideAnchors(specOf(PAGE));
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
    const found = { with: specTitleSlideOptions(specOf(page)), without: specTitleSlideOptions(specOf(PAGE)) };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('reads one page, the Spec file, and the whole-Spec facts from its meta block', () => {
    // ARRANGE
    const html = `<!doctype html><html><head>${META}</head><body></body></html>`;
    const expected = {
      files: ['spec/spec.html'],
      main: 'spec/spec.html',
      approved: false,
      meta: expect.stringContaining('"type": "spec"'),
    };
    // ACT
    const spec = specOf(html);
    const found = {
      files: spec.pages.map(({ file }) => file),
      main: spec.main.file,
      approved: spec.approved,
      meta: spec.meta,
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('reads a Spec approved once Han verified its meta block', () => {
    // ARRANGE
    const html = appendMetaVerified(`<!doctype html><html><head>${META}</head><body></body></html>`, {
      by: 'human:han',
      at: '2026-11-02T10:00:00Z',
    });
    // ACT
    const { approved } = specOf(html);
    // ASSERT
    expect(approved).toBe(true);
  });

  it('reads the Section slugs in page order', () => {
    // ARRANGE
    const expected = ['why', 'fix'];
    // ACT
    const slugs = specSectionSlugs(specOf(PAGE));
    // ASSERT
    expect(slugs).toEqual(expected);
  });

  it('reads the Options stage from a page with Options', () => {
    // ARRANGE
    const expected = 'options';
    // ACT
    const { stage } = specOf(PAGE);
    // ASSERT
    expect(stage).toBe(expected);
  });
});

describe('failure cases', () => {
  it('reads no Spec from a staging folder without spec/spec.html', () => {
    // ARRANGE
    const files = { 'dossier.md': '# Budget {#budget}\n' };
    // ACT
    const spec = readSpec(files);
    // ASSERT
    expect(spec).toBeUndefined();
  });

  it('reads no meta block and no approval from a page without one', () => {
    // ARRANGE
    const expected = { meta: undefined, approved: false };
    // ACT
    const { meta, approved } = specOf(PAGE);
    // ASSERT
    expect({ meta, approved }).toEqual(expected);
  });

  it('reads no Slides from a page that marks none', () => {
    // ARRANGE
    const page = '<!doctype html><html><body><article id="spent"><figure></figure></article></body></html>';
    // ACT
    const { slides } = specOf(page);
    // ASSERT
    expect(slides).toEqual([]);
  });
});

describe('edge cases', () => {
  it('reads the early stage from Slides without Options or Title slide, and the Options stage from no Slide at all', () => {
    // ARRANGE
    const early = '<section data-spec="section" id="why"><article data-spec="slide" id="spent"></article></section>';
    const empty = '<!doctype html><html><body></body></html>';
    const expected = { early: 'early', empty: 'options' };
    // ACT
    const found = { early: specOf(early).stage, empty: specOf(empty).stage };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('skips a Slide that sits in no Section, since no feedback item can key it', () => {
    // ARRANGE
    const page = PAGE.replace(
      '</body>',
      '<article data-spec="slide" id="stray" data-number="4"><figure data-spec="option" data-option="4a"></figure></article></body>',
    );
    const expected = ['why--spent', 'why--middle', 'fix--trim'];
    // ACT
    const anchors = specSlideAnchors(specOf(page));
    // ASSERT
    expect(anchors).toEqual(expected);
  });
});
