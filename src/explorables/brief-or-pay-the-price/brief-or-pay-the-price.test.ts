import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BriefOrPayThePrice } from './brief-or-pay-the-price';
import { explorableData } from './brief-or-pay-the-price-data';
import configSource from './brief-or-pay-the-price.config.yml';
import { TRAIT_IDS } from './brief-or-pay-the-price.types';
import { keyPaths, loadConfig, mergeWords } from './config.pure';

const render = (locale: string, words?: Parameters<typeof BriefOrPayThePrice>[0]['words']): string =>
  renderToStaticMarkup(createElement(BriefOrPayThePrice, { preset: 'play', locale, words }));

const english = explorableData('en');
const german = explorableData('de');

describe('success cases', () => {
  it.each([
    ['en', 'new'],
    ['de', 'neu'],
  ])('Seam 3: the fresh-start scene carries the label word for %s', (locale, word) => {
    // ARRANGE
    const data = explorableData(locale);
    // ACT
    const label = data.words.backs.fresh;
    // ASSERT
    expect(label).toBe(word);
  });

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

  it('keeps each trait name English in German, with its gloss in the chip accessible name only', () => {
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
    // ASSERT
    expect(names).toEqual(expected);
    expect(html).not.toContain('data-trait-gloss');
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

  it('shows the Define tab bar with PRICE, BRIEF, a Scenario acronym and BRACE, PRICE pressed', () => {
    // ARRANGE
    const expected = [
      ['price', 'true', 'PRICE'],
      ['brief', 'false', 'BRIEF'],
      ['stages', 'false', 'DRIVE'],
      ['brace', 'false', 'BRACE'],
    ];
    // ACT
    const html = render('en');
    const tabs = [...html.matchAll(/aria-checked="(true|false)"[^>]*data-view-go="([a-z]+)"[^>]*>([^<]+)</g)].map(
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
  it('gives BRIEF its five moves and BRACE its five requirements, in the acronym letters', () => {
    // ARRANGE
    const expected = { brief: 'BRIEF', brace: 'BRACE' };
    // ACT
    const letters = (id: 'brief' | 'brace') => english.definitions[id].rows.map((row) => row.letter).join('');
    // ASSERT
    expect({ brief: letters('brief'), brace: letters('brace') }).toEqual(expected);
  });

  it('keeps BRACE A as Autonomy through intent', () => {
    // ARRANGE
    const row = english.definitions.brace.rows[2];
    // ACT
    const name = row?.words.name;
    // ASSERT
    expect(name).toBe('Autonomy through intent');
  });

  it('keeps every English name in German and adds a gloss, for all three definitions', () => {
    // ARRANGE
    const ids = ['price', 'brief', 'brace'] as const;
    const rowCount = 15;
    // ACT
    const rows = ids.flatMap((id) =>
      german.definitions[id].rows.map((row) => ({
        sameName: row.words.name === english.definitions[id].rows.find((one) => one.id === row.id)?.words.name,
        gloss: row.words.gloss,
      })),
    );
    // ASSERT
    expect(rows).toHaveLength(rowCount);
    for (const row of rows) {
      expect(row.sameName).toBe(true);
      expect(row.gloss).not.toBe('');
    }
  });

  it('gives each definition heads and a closing line in both locales, and only PRICE the wipe', () => {
    // ARRANGE
    const ids = ['price', 'brief', 'brace'] as const;
    // ACT
    const wipes = ids.map((id) => english.definitions[id].wipe);
    const words = ids.flatMap((id) => [english, german].map((data) => data.definitions[id].words));
    // ASSERT
    expect(wipes).toEqual([true, false, false]);
    for (const word of words) {
      expect(word.heads.middle).not.toBe('');
      expect(word.close.lead).not.toBe('');
    }
    expect(german.definitions.brace.words.heads.ai).toBe('KI-Agenten');
  });

  describe('stages', () => {
    it('names the Stages view by the acronym and draws one row per Stage with its scene', () => {
      // ARRANGE
      const data = explorableData('en');
      const expected = ['grill', 'plan', 'parallel', 'check', 'harden'];
      // ACT
      const rows = data.stages.drive?.rows.map((row) => row.scene);
      // ASSERT
      expect(data.stages.drive?.acronym).toBe('DRIVE');
      expect(rows).toEqual(expected);
    });

    it('gives each Stage its letter, its name, and the analogy and AI texts of its Scenario', () => {
      // ARRANGE
      const data = explorableData('de');
      // ACT
      const first = data.stages.drive?.rows[0];
      // ASSERT
      expect(first?.letter).toBe('D');
      expect(first?.words.name).toBe('Define');
      expect(first?.words.freelancer).toContain('Kunden');
      expect(data.stages.drive?.words.heads.middle).toMatch(/Phasen$/);
    });
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
  it('refuses a BRACE row id that is not a requirement', () => {
    // ARRANGE
    const source = configSource.replace('id: engineer-trust,', 'id: probabilistic,');
    // ACT
    const result = loadConfig(source);
    // ASSERT
    expect('problems' in result && result.problems.join('\n')).toContain(
      'definitions.brace.rows[4]: id "probabilistic" is not one of backwards-from-the-goal',
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
