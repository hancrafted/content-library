import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exportedFile, OUT_DIR } from './exported-pages';

const HERO_COPY = [
  {
    url: '/',
    headline: 'AI gave you a promotion you never asked for.',
    caption: 'You get to 10x your productivity — if you learn to plan, spec and review, …',
  },
  {
    url: '/de',
    headline: 'Die KI hat dich befördert. Gefragt hat sie nicht.',
    caption: 'Du wirst 10× so produktiv — wenn du lernst, zu planen, zu spezifizieren und zu reviewen, …',
  },
];

describe('exported landing hero', () => {
  it.each(HERO_COPY)('serves the complete approved copy without JavaScript at $url', ({ url, headline, caption }) => {
    // ARRANGE
    const html = readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8');
    // ACT
    const $ = load(html);
    const hero = $('[data-promotion-hero]');
    const words = hero.find('[data-caption-word]');
    // ASSERT
    expect(hero.find('h1').text()).toBe(headline);
    expect(hero.find('[data-hero-caption]').text()).toBe(caption);
    expect(words.attr('style')).toBeUndefined();
    expect(hero.attr('data-animated')).toBeUndefined();
  });

  it.each(HERO_COPY)('links to the local Episodes section and approved booking page at $url', ({ url }) => {
    // ARRANGE
    const $ = load(readFileSync(join(OUT_DIR, exportedFile(url)), 'utf8'));
    const booking = 'https://calendly.com/hanche2001/30min';
    const target = '_blank';
    const relation = 'noopener noreferrer';
    const section = 'episodes';
    const path = url === '/' ? /\/#episodes$/ : /\/de\/?#episodes$/;
    // ACT
    const primary = $('[data-testid="hero-episodes"]');
    const secondary = $('[data-testid="hero-contact"]');
    // ASSERT
    expect(primary.attr('href')).toMatch(path);
    expect($(`#${section}`).length).toBe(1);
    expect(secondary.attr('href')).toBe(booking);
    expect(secondary.attr('target')).toBe(target);
    expect(secondary.attr('rel')).toBe(relation);
  });
});
