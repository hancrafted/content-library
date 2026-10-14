import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DealBoard, type DealBoardProps, type DealColumn } from './deal-board';

const COLUMNS: readonly DealColumn[] = [
  {
    slug: 'new',
    title: 'New',
    summary: '2 · $14k',
    cards: [
      { slug: 'brightfold', name: 'Brightfold', value: '$8k' },
      { slug: 'talvik', name: 'Talvik Energy', value: '$6k' },
    ],
  },
  { slug: 'meeting', title: 'Meeting', summary: '0 · $0', cards: [] },
  {
    slug: 'proposal',
    title: 'Proposal',
    summary: '1 · $12k',
    cards: [
      { slug: 'harbor-and-pine', name: 'Harbor & Pine', value: '$12k', target: { 'data-target': 'proposal-card' } },
    ],
  },
];

function render(overrides: Partial<DealBoardProps> = {}): string {
  return renderToStaticMarkup(createElement(DealBoard, { label: 'A deal board', columns: COLUMNS, ...overrides }));
}

/** The text of every visible card, tags stripped, in document order. */
function cardTexts(html: string): string[] {
  return [...html.matchAll(/<li\b(?![^>]*aria-hidden)[^>]*>(.*?)<\/li>/g)].map(([, inner]) =>
    inner
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

describe('success cases', () => {
  it('prints each card with its name and value, column by column', () => {
    // ARRANGE
    const props = {};
    // ACT
    const cards = cardTexts(render(props));
    // ASSERT
    expect(cards).toEqual(['Brightfold $8k', 'Talvik Energy $6k', 'Harbor &amp; Pine $12k']);
  });

  it('names the board group by its label and each column group by its title, with its summary', () => {
    // ARRANGE
    const props = {};
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toMatch(/aria-label="A deal board"/);
    expect(html.match(/role="group"/g)).toHaveLength(4);
    expect(html).toMatch(/role="group" aria-label="Meeting"/);
    expect(html).toContain('1 · $12k');
  });

  it('marks a card and a column with their note targets', () => {
    // ARRANGE
    const columns = COLUMNS.map((column) =>
      column.slug === 'new' ? { ...column, target: { 'data-target': 'entry-stage' } } : column,
    );
    // ACT
    const html = render({ columns });
    // ASSERT
    expect(html).toContain('data-target="proposal-card"');
    expect(html).toMatch(/data-target="entry-stage"[^>]*role="group"|role="group"[^>]*data-target="entry-stage"/);
  });
});

describe('failure cases', () => {
  it('refuses a moved card that is not on the board', () => {
    // ARRANGE
    const moved = { card: 'mosswell', from: 'meeting' };
    // ACT
    const draw = () => render({ moved });
    // ASSERT
    expect(draw).toThrow(/unknown card "mosswell"/);
  });

  it('refuses a moved card from an unknown column', () => {
    // ARRANGE
    const moved = { card: 'harbor-and-pine', from: 'lost' };
    // ACT
    const draw = () => render({ moved });
    // ASSERT
    expect(draw).toThrow(/unknown column "lost"/);
  });

  it('refuses a highlight on an unknown column', () => {
    // ARRANGE
    const highlight = 'lost';
    // ACT
    const draw = () => render({ highlight });
    // ASSERT
    expect(draw).toThrow(/unknown column "lost"/);
  });
});

describe('edge cases', () => {
  it('leaves one hidden dashed ghost in the column a moved card left', () => {
    // ARRANGE
    const moved = { card: 'harbor-and-pine', from: 'meeting' };
    // ACT
    const html = render({ moved });
    // ASSERT
    const ghosts = html.match(/<li\b[^>]*aria-hidden="true"[^>]*>/g) ?? [];
    expect(ghosts).toHaveLength(1);
    expect(ghosts[0]).toContain('border-dashed');
    expect(cardTexts(html)).toHaveLength(3);
  });

  it('rings only the highlighted column', () => {
    // ARRANGE
    const highlight = 'new';
    // ACT
    const html = render({ highlight });
    // ASSERT
    expect(html.match(/ring-primary/g)).toHaveLength(1);
  });
});
