import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TitleSlide } from './title-slide';

const TEXT = { title: 'Page template', caption: 'The smallest Episode.' };

function render(hero?: string) {
  const props = {
    ...TEXT,
    mode: 'shared' as const,
    entrance: 'none' as const,
    appearance: { inverse: false },
  };
  return renderToStaticMarkup(
    createElement(TitleSlide, hero === undefined ? props : { ...props, hero: createElement('figure', null, hero) }),
  );
}

describe('success cases', () => {
  it.each(['shared', 'authored'] as const)(
    'places an Event notice inside the Title slide above its title on %s headers',
    (mode) => {
      // ARRANGE
      const notice = 'The Event has already taken place.';
      const props = {
        ...TEXT,
        mode,
        entrance: 'none' as const,
        appearance: { inverse: false },
        notice: createElement('p', { 'data-past-notice': true }, notice),
      };
      // ACT
      const $ = load(renderToStaticMarkup(createElement(TitleSlide, props)));
      const slide = $('[data-slot="title-slide"]');
      const order = slide
        .find('[data-past-notice], h1')
        .map((_, element) => element.tagName)
        .get();
      // ASSERT
      expect(slide.find('[data-past-notice]').text()).toBe(notice);
      expect(order).toEqual(['p', 'h1']);
    },
  );

  it('sets an authored hero directly under the h1 and caption, the pair centred in the slide', () => {
    // ARRANGE
    const hug = 'data-headed="hug"';
    // ACT
    const html = render('board');
    // ASSERT
    expect(html).toContain(hug);
    expect(html).toMatch(/data-slot="slide-header"[^>]*class="[^"]*\bmt-auto\b/);
    expect(html).toMatch(/<\/h1>.*<figure>board<\/figure>/);
  });

  it('marks its wrapper with the declared inverse flag', () => {
    // ARRANGE
    const props = {
      ...TEXT,
      mode: 'shared' as const,
      entrance: 'none' as const,
      appearance: { inverse: true, presentation: { inverse: true } },
    };
    // ACT
    const html = renderToStaticMarkup(createElement(TitleSlide, props));
    // ASSERT
    expect(html).toMatch(
      /data-slot="title-slide"[^>]*data-inverse="true"|data-inverse="true"[^>]*data-slot="title-slide"/,
    );
  });
});

describe('failure cases', () => {
  it('does not flip a Title whose presentation declares no inverse flag', () => {
    // ARRANGE
    const props = {
      ...TEXT,
      mode: 'shared' as const,
      entrance: 'none' as const,
      appearance: { inverse: false, presentation: {} },
    };
    // ACT
    const html = renderToStaticMarkup(createElement(TitleSlide, props));
    // ASSERT
    expect(html).not.toContain('data-inverse');
  });
  it('never lets an authored hero fill the slide, which would push it to the bottom', () => {
    // ARRANGE
    const fill = 'data-headed="fill"';
    // ACT
    const html = render('board');
    // ASSERT
    expect(html).not.toContain(fill);
  });
});

describe('edge cases', () => {
  it('centres the h1 and caption over the shared glow when there is no hero', () => {
    // ARRANGE
    const glow = 'hero-glow';
    // ACT
    const html = render();
    // ASSERT
    expect(html).toContain(glow);
    expect(html).toMatch(/data-slot="slide-header"[^>]*class="[^"]*\bmy-auto\b/);
  });

  it('carries no retired tone mark', () => {
    // ARRANGE
    const retired = /data-tone|data-surface-tone/;
    // ACT
    const html = render('board');
    // ASSERT
    expect(html).not.toMatch(retired);
  });
});
