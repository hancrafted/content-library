import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BriefOrPayThePrice } from './brief-or-pay-the-price';
import { explorableData } from './brief-or-pay-the-price-data';
import configSource from './brief-or-pay-the-price.config.yml';
import { TRAIT_IDS } from './brief-or-pay-the-price.types';
import { keyPaths, loadConfig, mergeWords } from './config.pure';

const render = (locale: string, words?: Parameters<typeof BriefOrPayThePrice>[0]['words']): string =>
  renderToStaticMarkup(createElement(BriefOrPayThePrice, { locale, words }));

describe('success cases', () => {
  it('renders the PRICE heads, the five chips with their letters, and the closing line in English', () => {
    // ARRANGE
    const expected = ['The freelancer', 'Five traits', 'AI', 'Amnesia:', 'P', 'R', 'I', 'C', 'E'];
    // ACT
    const html = render('en');
    // ASSERT
    for (const text of expected) expect(html).toContain(text);
    expect(html).toContain('after each conversation, they forget everything');
    expect(html.match(/data-trait-initial/g)).toHaveLength(TRAIT_IDS.length);
  });

  it('renders the German heads and closing line', () => {
    // ARRANGE
    const expected = [
      'Der Freelancer',
      'Fünf Eigenschaften',
      'KI',
      'Amnesie:',
      'Nach jedem Gespräch vergessen sie alles',
    ];
    // ACT
    const html = render('de');
    // ASSERT
    for (const text of expected) expect(html).toContain(text);
  });

  it('keeps each trait name English in German and shows its gloss below, on the chip and in its accessible name', () => {
    // ARRANGE
    const html = render('de');
    const expected = [
      'Probabilistic (probabilistisch): Jedes Mal ein anderes Ergebnis',
      'Relentless (unermüdlich): Viel Output, unklare Qualität',
      'Informed (informiert): Weiß viel, nur nicht über Dich',
      'Confident (selbstsicher): Füllt die Lücke, ohne zu fragen',
      'Every word billed (jedes Wort berechnet): Die Rechnung wächst mit jeder Runde',
    ];
    // ACT
    const names = [...html.matchAll(/aria-expanded="false" aria-label="([^"]+)"/g)].map(([, name]) => name);
    const glosses = [...html.matchAll(/data-trait-gloss[^>]*>([^<]+)</g)].map(([, gloss]) => gloss);
    // ASSERT
    expect(names).toEqual(expected);
    expect(glosses).toEqual(['probabilistisch', 'unermüdlich', 'informiert', 'selbstsicher', 'jedes Wort berechnet']);
  });

  it('shows no gloss in English, and names each chip by its trait and its short line', () => {
    // ARRANGE
    const html = render('en');
    const expected = 'Probabilistic: Outcome changes every time';
    // ACT
    const names = [...html.matchAll(/aria-expanded="false" aria-label="([^"]+)"/g)].map(([, name]) => name);
    // ASSERT
    expect(html).not.toContain('data-trait-gloss');
    expect(names[0]).toBe(expected);
  });

  it('shows the Define tab bar with PRICE as its only tab, pressed', () => {
    // ARRANGE
    const expected = [['price', 'true', 'PRICE']];
    // ACT
    const html = render('en');
    const tabs = [...html.matchAll(/aria-pressed="(true|false)"[^>]*data-view-go="([a-z]+)"[^>]*>([^<]+)</g)].map(
      ([, pressed, view, label]) => [view, pressed, label],
    );
    // ASSERT
    expect(tabs).toEqual(expected);
    expect(html).toContain('Define');
  });

  it('renders every row with its cards inert until its chip is entered, so only the chips can be reached', () => {
    // ARRANGE
    const html = render('en');
    const sides = 2;
    const cards = html.match(/data-card="(freelancer|ai)"/g) ?? [];
    // ACT
    const inert = html.match(/<div inert="" data-card=/g) ?? [];
    // ASSERT
    expect(cards).toHaveLength(TRAIT_IDS.length * sides);
    expect(inert).toHaveLength(cards.length);
  });

  it('lets a Slide override a default word, key by key, and keeps the rest', () => {
    // ARRANGE
    const words = { chrome: { showAll: 'Show it all' } };
    // ACT
    const html = render('en', words);
    // ASSERT
    expect(html).toContain('Show it all');
    expect(html).toContain('Reset to day one');
  });
});

describe('failure cases', () => {
  it('reports a missing German string by its path', () => {
    // ARRANGE
    const source = configSource.replace(/ {12}ai: ["']Gib denselben Prompt[^\n]*\n/, '');
    const expected = [
      'brief-or-pay-the-price.config.yml: i18n.de.definitions.price.rows.probabilistic.ai: missing, English has it',
    ];
    // ACT
    const result = loadConfig(source);
    // ASSERT
    expect(result).toEqual({ problems: expected });
  });

  it('refuses a row id that is not a trait', () => {
    // ARRANGE
    const source = configSource.replace('id: probabilistic,', 'id: unknown-trait,');
    // ACT
    const result = loadConfig(source);
    // ASSERT
    expect(result).toHaveProperty('problems');
    expect('problems' in result && result.problems.join('\n')).toContain('"unknown-trait" is not one of');
  });

  it('refuses a file whose YAML does not parse', () => {
    // ARRANGE
    const source = 'definitions: [unclosed';
    // ACT
    const result = loadConfig(source);
    // ASSERT
    expect('problems' in result && result.problems[0]).toContain(
      'brief-or-pay-the-price.config.yml: the file is not valid YAML',
    );
  });

  it('refuses an empty string outside the English gloss', () => {
    // ARRANGE
    const source = configSource.replace(/short: ["']Outcome changes every time["']/, 'short: ""');
    // ACT
    const result = loadConfig(source);
    // ASSERT
    expect('problems' in result && result.problems).toContain(
      'brief-or-pay-the-price.config.yml: i18n.en.definitions.price.rows.probabilistic.short: needs words',
    );
  });
});

describe('edge cases', () => {
  it('holds the same keys in the English and the German words, and the same rows', () => {
    // ARRANGE
    const english = explorableData('en');
    // ACT
    const german = explorableData('de');
    // ASSERT
    expect(keyPaths(german.words)).toEqual(keyPaths(english.words));
    expect(german.definitions.price.rows.map((row) => row.id)).toEqual(
      english.definitions.price.rows.map((row) => row.id),
    );
    expect(german.words.definitions.price.rows.probabilistic.gloss).not.toBe('');
  });

  it('falls back to English for a locale it does not know', () => {
    // ARRANGE
    const expected = explorableData('en').words;
    // ACT
    const found = explorableData('fr').words;
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('merges nothing when no word is overridden', () => {
    // ARRANGE
    const base = explorableData('en').words;
    // ACT
    const merged = mergeWords(base);
    // ASSERT
    expect(merged).toEqual(base);
  });
});
