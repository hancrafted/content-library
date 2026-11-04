import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { exportedPage } from './exported-pages';

const PLACEMENT = {
  episode: 'left',
  'explorable-page': 'top',
  event: 'left',
  guide: 'none',
  'episode-template': 'none',
  'master-slide': 'none',
} as const;

describe.each(LOCALES)('B1 Resource cards in %s', (locale) => {
  it('places Episode, Event and Explorable artwork in panels and labels every Open cue', () => {
    // ARRANGE
    const $ = exportedPage(localizePath('/resources', locale));
    const open = locale === 'en' ? 'Open' : 'Öffnen';
    const artworkOf = (kind: string) => (kind === 'explorable-page' ? '[data-drift-still]' : '[data-card-artwork]');
    // ACT
    const cards = $('[data-resource-card]').toArray();
    const misplaced = cards.filter((node) => {
      const card = $(node);
      const kind = card.attr('data-resource-kind') as keyof typeof PLACEMENT;
      const position = PLACEMENT[kind];
      const panels = card.find('[data-card-visual]');
      return (
        card.attr('data-card-visual-position') !== position ||
        panels.length !== (position === 'none' ? 0 : 1) ||
        (position !== 'none' && panels.find(artworkOf(kind)).length !== 1) ||
        card.find('[data-card-body] [data-ink-primary]').text() !== open
      );
    });
    // ASSERT
    expect(cards.length).toBeGreaterThan(0);
    expect(misplaced.map((node) => $(node).attr('data-resource-card'))).toEqual([]);
    expect($('[data-resource-card] [data-card-media]').length).toBe(0);
  });
});
