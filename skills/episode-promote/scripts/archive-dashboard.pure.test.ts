import { load } from 'cheerio';
import { describe, expect, it } from 'vitest';
import { archivedEpisode, archiveIndex } from './archive-dashboard.pure.ts';
import { EVENTS, FEEDBACK, SPEC } from './archive.fixture.ts';
import { designArchive } from './archive.pure.ts';

const INPUT = { staging: 'docs/episodes/cash-first-run-2', spec: SPEC, feedback: FEEDBACK, events: EVENTS };
const PAGE = 'cash-first/index.html';

function texts($: ReturnType<typeof load>, selector: string): string[] {
  return $(selector)
    .map((_, element) => $(element).text().trim())
    .get();
}

describe('archivedEpisode', () => {
  describe('success cases', () => {
    it("reads the Episode's title, Slide and Option counts and its picks back from its page", () => {
      // ARRANGE
      const expected = { slug: 'cash-first', title: 'Cash first', slides: 3, options: 5, picked: ['0b', '1b', '2a'] };

      // ACT
      const episode = archivedEpisode('cash-first', designArchive(INPUT).pages[PAGE] ?? '');

      // ASSERT
      expect(episode).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('reads a page with no Slides as an empty Episode', () => {
      // ARRANGE
      const expected = { slug: 'stray', title: '', slides: 0, options: 0, picked: [] };

      // ACT
      const episode = archivedEpisode('stray', '<html><body></body></html>');

      // ASSERT
      expect(episode).toEqual(expected);
    });
  });

  describe('edge cases', () => {
    it('reads a Slide with no picked Option as no pick', () => {
      // ARRANGE
      const spec = SPEC.replace('data-option="2a" data-picked', 'data-option="2a"');
      const picked = ['0b', '1b'];

      // ACT
      const page_ = designArchive({ ...INPUT, spec }).pages[PAGE] ?? '';
      const episode = archivedEpisode('cash-first', page_);

      // ASSERT
      expect(episode.picked).toEqual(picked);
    });
  });
});

describe('archiveIndex', () => {
  const ZETA = { slug: 'zeta', title: 'Zeta', slides: 2, options: 4, picked: ['0a', '1b'] };
  const CASH = { slug: 'cash-first', title: 'Cash first', slides: 3, options: 5, picked: ['0b'] };

  describe('success cases', () => {
    it('cards every archived Episode, sorted by slug, with its counts and picks, under the totals', () => {
      // ARRANGE
      const cards = [
        'cash-first/index.html Cash first | 3 Slides · 5 Options | 0b',
        'zeta/index.html Zeta | 2 Slides · 4 Options | 0a 1b',
      ];
      const totals = ['2 Episodes', '5 Slides', '9 Options'];

      // ACT
      const $ = load(archiveIndex([ZETA, CASH]));
      const shown = $('.episode a')
        .map((_, a) => {
          const card = $(a);
          const picks = card
            .find('.picked li')
            .map((_i, li) => $(li).text())
            .get();
          return `${card.attr('href')} ${card.find('h2').text()} | ${card.find('.counts').text()} | ${picks.join(' ')}`;
        })
        .get();

      // ASSERT
      expect(shown).toEqual(cards);
      expect(
        $('.stats li')
          .map((_, li) => `${$(li).find('b').text()} ${$(li).find('span').text()}`)
          .get(),
      ).toEqual(totals);
    });
  });

  describe('failure cases', () => {
    it('escapes an Episode title that carries markup', () => {
      // ARRANGE
      const title = 'Cash <b>first</b>';

      // ACT
      const $ = load(archiveIndex([{ ...CASH, title }]));

      // ASSERT
      expect($('.episode h2').text()).toBe(title);
    });
  });

  describe('edge cases', () => {
    it('shows an empty state and zero totals when nothing is archived yet', () => {
      // ARRANGE
      const none: (typeof CASH)[] = [];
      const totals = ['0', '0', '0'];

      // ACT
      const $ = load(archiveIndex(none));

      // ASSERT
      expect($('.episode')).toHaveLength(0);
      expect($('.empty')).toHaveLength(1);
      expect(texts($, '.stats b')).toEqual(totals);
    });
  });
});
