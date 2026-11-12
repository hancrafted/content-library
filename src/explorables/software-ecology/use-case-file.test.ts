import { describe, expect, it } from 'vitest';
import { parse, stringify } from 'yaml';
import gateWordsDe from './gate.words.de.yml';
import gateWords from './gate.words.yml';
import gate from './gate.yml';
import rolesWordsDe from './roles.words.de.yml';
import rolesWords from './roles.words.yml';
import configDe from './software-ecology.config.de.yml';
import configEn from './software-ecology.config.yml';
import teamsWordsDe from './teams.words.de.yml';
import teamsWords from './teams.words.yml';
import teams from './teams.yml';
import tireWordsDe from './tire.words.de.yml';
import tireWords from './tire.words.yml';
import tire from './tire.yml';
import { CATALOG } from './use-case-data.ts';
import { exchangeSchema, readExchange, useCaseSchema } from './use-case-file.ts';

const ROLES = Object.keys(CATALOG);
const SHIPPED = { tire, gate, teams };
/** Each words pair, English then German (FE-012-explorables §1.3). */
const PAIRS = [
  ['tire', tireWords, tireWordsDe],
  ['gate', gateWords, gateWordsDe],
  ['teams', teamsWords, teamsWordsDe],
  ['roles', rolesWords, rolesWordsDe],
  ['config', configEn, configDe],
] as const;

/** Every key path of a parsed document, list items by index. */
const paths = (v: unknown, at = ''): string[] =>
  v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [`${at}${k}`, ...paths(x, `${at}${k}.`)]) : [];

const problems = (doc: unknown, exchange = false): string[] => {
  const r = (exchange ? exchangeSchema : useCaseSchema)(ROLES).safeParse(doc);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

const tireDoc = () => parse(tire) as Record<string, unknown>;

describe('success cases', () => {
  it.each(Object.entries(SHIPPED))('accepts the shipped %s file against schema /5', (_id, text) => {
    // ARRANGE
    const none: string[] = [];
    // ACT
    const seen = problems(parse(text));
    // ASSERT
    expect(seen).toEqual(none);
  });

  it.each(PAIRS)('holds the same keys in the English and German %s words', (_id, en, de) => {
    // ARRANGE
    const english = paths(parse(en)).sort();
    // ACT
    const german = paths(parse(de)).sort();
    // ASSERT
    expect(german).toEqual(english);
  });

  it('splits an exchange file into its use case, its words per locale and its saved state', () => {
    // ARRANGE
    const words = { en: { name: 'Tire swing' }, de: { name: 'Reifenschaukel' } };
    const state = { reality: 40 };
    const text = stringify({ ...tireDoc(), i18n: words, state });
    // ACT
    const r = readExchange(text, ROLES);
    // ASSERT
    expect(r).toMatchObject({ ok: { words, state, data: { id: 'tire' } } });
  });
});

describe('failure cases', () => {
  it('refuses a file whose follow-up chances add up to 1 or more', () => {
    // ARRANGE
    const doc = { ...tireDoc(), customer: { ...(tireDoc().customer as object), good: { pm: 0.7, sales: 0.4 } } };
    const expected = [
      'customer.good: the chances add up to 1.1; keep them below 1, or the follow-up requests never end',
    ];
    // ACT
    const seen = problems(doc);
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('refuses an expect with an unknown measure or test, naming both', () => {
    // ARRANGE
    const doc = tireDoc();
    const presets = doc.presets as Record<string, unknown>[];
    presets[2] = { id: 'ideal', check: { run: 12, expect: { 'qa.speed': 'lots' } } };
    const expected = [
      'presets[2].check.expect.qa.speed: customer.<output|sat|headroom|leadDays|bugsPerWeek|own|backlog> or <center>.<weeksWaiting|busy|bugShare|backlog|done|rework|rush>',
      'presets[2].check.expect.qa.speed: a test such as ">2", "<0.5", "0.9–1.1", rises or falls',
    ];
    // ACT
    const seen = problems(doc);
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('refuses an exchange file without an English name', () => {
    // ARRANGE
    const text = stringify({ ...tireDoc(), i18n: { de: { name: 'Reifenschaukel' } } });
    const expected = { problems: ['i18n.en.name: the use case name in English'] };
    // ACT
    const r = readExchange(text, ROLES);
    // ASSERT
    expect(r).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('refuses a file that is not a YAML map, in one line', () => {
    // ARRANGE
    const expected = ['The file is not a YAML map.'];
    // ACT
    const seen = problems(['a', 'list'], true);
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('refuses a work center that spawns into itself, and a role it does not know', () => {
    // ARRANGE
    const doc = tireDoc();
    const centers = doc.centers as Record<string, unknown>[];
    centers[0] = { ...centers[0], role: 'wizard', spawns: [{ to: 'sales', n: 1 }] };
    const expected = [
      `centers[0].role: unknown role "wizard" (one of ${ROLES.join(', ')})`,
      'centers[0].spawns[0].to: a work center cannot spawn into itself',
    ];
    // ACT
    const seen = problems(doc);
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
