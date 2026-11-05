import type { EventCard } from '@/events/lib/event-card.pure';
import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EventCardView } from './event-card';

/** The plain localized projection the Event browser hands to its card. */
const CARD: EventCard = {
  slug: '2026-10-23-axel-agentic-workflow',
  route: '/events/2026-10-23-axel-agentic-workflow',
  title: 'AXEL Seminar: Agentic Workflows',
  description: 'Mit KI-Agenten arbeiten in drei Episoden.',
  date: '2026-10-23',
  dateLabel: '23. Okt. 2026',
  day: '23',
  weekday: 'Fr',
  time: '09:30',
  leadTag: 'agentic-ai',
  tags: [
    { id: 'agentic-ai', label: 'Agentic AI', tooltip: 'AI that plans and acts' },
    { id: 'agentic-workflow', label: 'Workflow', tooltip: 'Work split into steps' },
  ],
  place: { format: 'remote', label: 'Online · Zoom' },
  episodeCount: 3,
  episodeCountLabel: '3 Episoden',
};
const OPEN = 'Veranstaltung öffnen';

describe('success cases', () => {
  it('renders the selected Agentic artwork with a localized native link, Open cue and Event metadata', () => {
    // ARRANGE
    const expected = {
      route: '/de/events/2026-10-23-axel-agentic-workflow',
      open: 'Veranstaltung öffnen',
      date: '2026-10-23',
      place: 'Online · Zoom',
      time: '· 09:30',
      position: 'left',
      artwork: 'context-boundary',
      accent: '--card-accent:var(--tag-agentic-ai)',
    };
    // ACT
    const $ = load(
      renderToStaticMarkup(createElement(EventCardView, { card: CARD, locale: 'de', headingLevel: 4, open: OPEN })),
    );
    // ASSERT
    expect($('[data-card-link]').attr('href')).toBe(expected.route);
    expect($('[data-card-visual-position]').attr('data-card-visual-position')).toBe(expected.position);
    expect($('[data-card-body]').length).toBe(1);
    expect($('[data-card-visual] svg').attr('data-card-artwork')).toBe(expected.artwork);
    expect($('[data-event-card]').attr('style')).toContain(expected.accent);
    expect($('[data-ink-primary]').text()).toBe(expected.open);
    expect($('[data-event-date]').attr('datetime')).toBe(expected.date);
    expect($('[data-event-place]').text()).toBe(expected.place);
    expect($('[data-event-time]').text()).toBe(expected.time);
  });
});

describe('failure cases', () => {
  it('adds no legacy media, corner wash or duplicate primary tab stop', () => {
    // ARRANGE
    const hidden = 'true';
    // ACT
    const $ = load(
      renderToStaticMarkup(createElement(EventCardView, { card: CARD, locale: 'de', headingLevel: 4, open: OPEN })),
    );
    const cue = $('[data-ink-primary]');
    // ASSERT
    expect($('[data-card-media], .bg-linear-to-br').length).toBe(0);
    expect($('[data-event-card] a').length).toBe(1);
    expect(cue.attr('aria-hidden')).toBe(hidden);
    expect(cue.filter('a, button, [tabindex]').length).toBe(0);
  });
});

describe('edge cases', () => {
  it('keeps the date and place when the Event supplies no time', () => {
    // ARRANGE
    const card = { ...CARD, time: undefined };
    const expected = { date: '23. Okt. 2026', place: 'Online · Zoom' };
    // ACT
    const $ = load(
      renderToStaticMarkup(createElement(EventCardView, { card, locale: 'de', headingLevel: 4, open: OPEN })),
    );
    // ASSERT
    expect($('[data-event-time]').length).toBe(0);
    expect($('[data-event-date]').text()).toBe(expected.date);
    expect($('[data-event-place]').text()).toBe(expected.place);
  });
});
