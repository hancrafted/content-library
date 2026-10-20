import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { EVENTS, FEEDBACK, SPEC } from './archive.fixture.ts';
import { archiveIndex, designArchive } from './archive.pure.ts';

const STAGING = 'docs/episodes/cash-first-run-2';
const INPUT = { staging: STAGING, spec: SPEC, feedback: FEEDBACK, events: EVENTS };

function page(pages: Record<string, string>, file: string) {
  const html = pages[file];
  if (html === undefined) throw new Error(`no page ${file}; pages: ${Object.keys(pages).join(', ')}`);
  return load(html);
}

function texts($: ReturnType<typeof load>, selector: string): string[] {
  return $(selector)
    .map((_, element) => $(element).text().trim())
    .get();
}

describe('designArchive', () => {
  describe('success cases', () => {
    it('writes one page per Slide, the Title slide as top, each holding only its own Options with the picked one marked', () => {
      // ARRANGE
      const files = [
        'cash-first/cash-left.html',
        'cash-first/index.html',
        'cash-first/top.html',
        'cash-first/watch-cash.html',
      ];
      const options = ['1a', '1b'];
      const [picked, recommended, pickedTitle] = ['1b', '1a', '0b'];

      // ACT
      const { pages } = designArchive(INPUT);
      const $ = page(pages, 'cash-first/watch-cash.html');

      // ASSERT
      expect(Object.keys(pages).sort()).toEqual(files);
      expect(
        $('figure[data-option]')
          .map((_, f) => $(f).attr('data-option'))
          .get(),
      ).toEqual(options);
      expect($('figure[data-picked]').attr('data-option')).toBe(picked);
      expect($('figure[data-recommended]').attr('data-option')).toBe(recommended);
      expect(page(pages, 'cash-first/top.html')('figure[data-picked]').attr('data-option')).toBe(pickedTitle);
    });

    it('files each feedback item under its Slide, labelled with its round, rounds in order', () => {
      // ARRANGE
      const watchCash = [
        'Round 1 · design — picked: 1b — 1b is simple, more like this',
        'Round 2 · design — use € everywhere',
      ];
      const top = ['Round 1 · design — picked: 0b'];
      const cashLeft = ['Round 1 · content — say "cash left"'];

      // ACT
      const { pages } = designArchive(INPUT);
      const feedback = (file: string) => texts(page(pages, file), '[data-archive="feedback"] li');

      // ASSERT
      expect(feedback('cash-first/watch-cash.html')).toEqual(watchCash);
      expect(feedback('cash-first/top.html')).toEqual(top);
      expect(feedback('cash-first/cash-left.html')).toEqual(cashLeft);
    });

    it('shows each designer prompt that names the Slide, its Section or its Options, newest attempt first, once each', () => {
      // ARRANGE
      const section =
        'Designer prompt · attempt 1: Draw Section `why-cash`: Slide 1 `watch-cash`, Slide 2 `cash-left`.';
      const retry = 'Designer prompt · attempt 2: - **1a and 1b:** use unsigned amounts.';
      const title = 'Designer prompt · attempt 1: Draw the Title slide Options 0a and 0b.';

      // ACT
      const { pages } = designArchive(INPUT);
      const prompts = (file: string) => {
        const $ = page(pages, file);
        return $('[data-archive="prompt"]')
          .map((_, d) => `${$(d).find('summary').text().trim()}: ${$(d).find('pre').text()}`)
          .get();
      };

      // ASSERT
      expect(prompts('cash-first/watch-cash.html')).toEqual([retry, section]);
      expect(prompts('cash-first/cash-left.html')).toEqual([section]);
      expect(prompts('cash-first/top.html')).toEqual([title]);
    });

    it('shows the Visual idea, not the words, and lists the design references the Slide cites, archive-relative', () => {
      // ARRANGE
      const visualIdea = 'A board of month columns.';
      const images = ['reference/deck/pages/page-03.jpg', 'reference/deck/pages/page-08.jpg'];

      // ACT
      const { pages, references } = designArchive(INPUT);
      const $ = page(pages, 'cash-first/watch-cash.html');

      // ASSERT
      expect($('[data-spec="visual-idea"]').text()).toBe(visualIdea);
      expect($('[data-spec="voice-script"]')).toHaveLength(0);
      expect(
        $('[data-archive="references"] img')
          .map((_, img) => $(img).attr('src'))
          .get(),
      ).toEqual(images);
      expect($.html()).not.toContain(`${STAGING}/`);
      expect(references).toEqual(images);
    });

    it("indexes the Episode's Slides in Spec order, each linked with its title and picked Option, under the Episode's title", () => {
      // ARRANGE
      const title = 'Cash first';
      const links = [
        'top.html Title slide and section slides · picked 0b',
        'watch-cash.html Watch cash · picked 1b',
        'cash-left.html Cash left · picked 2a',
      ];

      // ACT
      const $ = page(designArchive(INPUT).pages, 'cash-first/index.html');

      // ASSERT
      expect($('h1').text()).toBe(title);
      expect(
        $('li a')
          .map((_, a) => `${$(a).attr('href')} ${$(a).text()}`)
          .get(),
      ).toEqual(links);
    });

    it("carries the Spec's own styles, not its review scripts, and links each Slide page back to its Episode", () => {
      // ARRANGE
      const specStyle = '.spec-card{padding:1rem}';
      const [stylesheet, back] = ['design.css', 'index.html'];

      // ACT
      const $ = page(designArchive(INPUT).pages, 'cash-first/watch-cash.html');

      // ASSERT
      expect($('style').text()).toContain(specStyle);
      expect($('script')).toHaveLength(0);
      expect($('link[rel="stylesheet"]').attr('href')).toBe(stylesheet);
      expect($('nav a').attr('href')).toBe(back);
    });
  });

  describe('failure cases', () => {
    it('refuses a Spec whose h1 carries no Episode slug', () => {
      // ARRANGE
      const spec = SPEC.replace('<h1 id="cash-first">', '<h1>');
      const message = /no <h1 id>/;

      // ACT
      const archive = () => designArchive({ ...INPUT, spec });

      // ASSERT
      expect(archive).toThrow(message);
    });
  });

  describe('edge cases', () => {
    it('leaves out the feedback, prompts and references sections of a Slide that has none', () => {
      // ARRANGE
      const spec = SPEC.replace('<p>Design reference: reference/deck/design-reference.md#page-3</p>', '');
      const input = { ...INPUT, spec, feedback: {}, events: '' };
      const sections = ['[data-archive="feedback"]', '[data-archive="prompts"]', '[data-archive="references"]'];

      // ACT
      const $ = page(designArchive(input).pages, 'cash-first/cash-left.html');
      const found = sections.filter((selector) => $(selector).length > 0);

      // ASSERT
      expect(found).toEqual([]);
    });
  });
});

describe('archiveIndex', () => {
  describe('success cases', () => {
    it('links every archived Episode by its title, sorted by slug', () => {
      // ARRANGE
      const episodes = [
        { slug: 'zeta', title: 'Zeta' },
        { slug: 'cash-first', title: 'Cash first' },
      ];
      const links = ['cash-first/index.html Cash first', 'zeta/index.html Zeta'];

      // ACT
      const $ = load(archiveIndex(episodes));

      // ASSERT
      expect(
        $('li a')
          .map((_, a) => `${$(a).attr('href')} ${$(a).text()}`)
          .get(),
      ).toEqual(links);
    });
  });

  describe('failure cases', () => {
    it('escapes an Episode title that carries markup', () => {
      // ARRANGE
      const title = 'Cash <b>first</b>';

      // ACT
      const $ = load(archiveIndex([{ slug: 'cash-first', title }]));

      // ASSERT
      expect($('li a').text()).toBe(title);
    });
  });

  describe('edge cases', () => {
    it('renders an empty list when nothing is archived yet', () => {
      // ARRANGE
      const none: { slug: string; title: string }[] = [];

      // ACT
      const $ = load(archiveIndex(none));

      // ASSERT
      expect($('li')).toHaveLength(0);
    });
  });
});
