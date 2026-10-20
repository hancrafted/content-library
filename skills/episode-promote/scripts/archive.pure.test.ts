import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { EVENTS, FEEDBACK, SPEC } from './archive.fixture.ts';
import { designArchive } from './archive.pure.ts';

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
    it('writes one page holding every Slide in Spec order, each with only its own Options and the picked one marked', () => {
      // ARRANGE
      const files = ['cash-first/index.html'];
      const slides = ['top', 'watch-cash', 'cash-left'];
      const options = ['1a', '1b'];
      const [picked, recommended, pickedTitle] = ['1b', '1a', '0b'];

      // ACT
      const { pages } = designArchive(INPUT);
      const $ = page(pages, 'cash-first/index.html');
      const watchCash = $('[data-archive-slide="watch-cash"]');

      // ASSERT
      expect(Object.keys(pages)).toEqual(files);
      expect(
        $('[data-archive-slide]')
          .map((_, slide) => $(slide).attr('data-archive-slide'))
          .get(),
      ).toEqual(slides);
      expect(
        watchCash
          .find('figure[data-option]')
          .map((_, f) => $(f).attr('data-option'))
          .get(),
      ).toEqual(options);
      expect(watchCash.find('figure[data-picked]').attr('data-option')).toBe(picked);
      expect(watchCash.find('figure[data-recommended]').attr('data-option')).toBe(recommended);
      expect($('[data-archive-slide="top"] figure[data-picked]').attr('data-option')).toBe(pickedTitle);
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
      const $ = page(designArchive(INPUT).pages, 'cash-first/index.html');
      const feedback = (slide: string) => texts($, `[data-archive-slide="${slide}"] [data-archive="feedback"] li`);

      // ASSERT
      expect(feedback('watch-cash')).toEqual(watchCash);
      expect(feedback('top')).toEqual(top);
      expect(feedback('cash-left')).toEqual(cashLeft);
    });

    it('shows each designer prompt that names the Slide, its Section or its Options, newest attempt first, once each', () => {
      // ARRANGE
      const section =
        'Designer prompt · attempt 1: Draw Section `why-cash`: Slide 1 `watch-cash`, Slide 2 `cash-left`.';
      const retry = 'Designer prompt · attempt 2: - **1a and 1b:** use unsigned amounts.';
      const title = 'Designer prompt · attempt 1: Draw the Title slide Options 0a and 0b.';

      // ACT
      const $ = page(designArchive(INPUT).pages, 'cash-first/index.html');
      const prompts = (slide: string) =>
        $(`[data-archive-slide="${slide}"] [data-archive="prompt"]`)
          .map((_, d) => `${$(d).find('summary').text().trim()}: ${$(d).find('pre').text()}`)
          .get();

      // ASSERT
      expect(prompts('watch-cash')).toEqual([retry, section]);
      expect(prompts('cash-left')).toEqual([section]);
      expect(prompts('top')).toEqual([title]);
    });

    it('shows the Visual idea untabbed and lists the design references the Slide cites, archive-relative', () => {
      // ARRANGE
      const visualIdea = 'A board of month columns.';
      const images = ['reference/deck/pages/page-03.jpg', 'reference/deck/pages/page-08.jpg'];

      // ACT
      const { pages, references } = designArchive(INPUT);
      const $ = page(pages, 'cash-first/index.html');
      const slide = $('[data-archive-slide="watch-cash"]');

      // ASSERT
      expect(slide.find('.spec-words > [data-panel="visual-idea"] [data-spec="visual-idea"]').text()).toBe(visualIdea);
      expect(
        slide
          .find('[data-archive="references"] img')
          .map((_, img) => $(img).attr('src'))
          .get(),
      ).toEqual(images);
      expect($.html()).not.toContain(`${STAGING}/`);
      expect(references).toEqual(images);
    });

    it("lays the page out in the Spec's frame: a masthead, an outline of in-page links grouped by Section, Sections titled", () => {
      // ARRANGE
      const title = 'Cash first';
      const [stylesheet, back] = ['design.css', '../index.html'];
      const specStyle = '.spec-card{padding:1rem}';
      const outline = [
        'Episode: #top 0 · Title slide and section slides',
        'Why cash: #watch-cash 1 · Watch cash, #cash-left 2 · Cash left',
      ];
      const picked = ['#top', '#watch-cash', '#cash-left'];
      const section = { title: 'Why cash', slides: ['watch-cash', 'cash-left'] };

      // ACT
      const $ = page(designArchive(INPUT).pages, 'cash-first/index.html');
      const groups = $('.spec-shell > nav.spec-outline > ol > li')
        .map((_, li) => {
          const links = $(li)
            .find('a')
            .map((_i, a) => `${$(a).attr('href')} ${$(a).text().trim()}`)
            .get();
          return `${$(li).find('.spec-outline-section').text()}: ${links.join(', ')}`;
        })
        .get();
      const sectionEl = $('main.spec-page section[data-spec="section"]#why-cash');

      // ASSERT
      expect($('main .spec-masthead h1').text()).toBe(title);
      expect($('.spec-masthead a').attr('href')).toBe(back);
      expect($('style').text()).toContain(specStyle);
      expect($('link[rel="stylesheet"]').attr('href')).toBe(stylesheet);
      expect(groups).toEqual(outline);
      expect(
        $('.spec-outline a[data-state="picked"]')
          .map((_, a) => $(a).attr('href'))
          .get(),
      ).toEqual(picked);
      expect(sectionEl.find('h2').first().text()).toBe(section.title);
      expect(
        sectionEl
          .find('[data-archive-slide]')
          .map((_, s) => $(s).attr('data-archive-slide'))
          .get(),
      ).toEqual(section.slides);
    });

    it('drops the review form, the picks, the notes and the words, and tabs the Options with one script of its own', () => {
      // ARRANGE
      const dropped = [
        'form',
        '.spec-pick',
        '.spec-note',
        '[data-panel="voice-script"]',
        '[data-panel="speaker-notes"]',
        '.spec-words > input',
        '.spec-words > label',
        '#spec-meta',
      ];
      const specScripts = ['/* option tabs */', '/* review form */'];

      // ACT
      const $ = page(designArchive(INPUT).pages, 'cash-first/index.html');
      const found = dropped.filter((selector) => $(selector).length > 0);
      const scripts = $('script')
        .map((_, script) => $(script).html() ?? '')
        .get();
      const carried = specScripts.filter((text) => scripts.some((script) => script.includes(text)));

      // ASSERT
      expect(found).toEqual([]);
      expect(scripts).toHaveLength(1);
      expect(carried).toEqual([]);
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
      const $ = page(designArchive(input).pages, 'cash-first/index.html');
      const found = sections.filter((selector) => $(`[data-archive-slide="cash-left"] ${selector}`).length > 0);

      // ASSERT
      expect(found).toEqual([]);
    });
  });
});
