import { describe, expect, it } from 'vitest';
import { localeKeyDrift, mergeTranslationFiles, translationOwner } from './merge-translations.pure';

/*
 * The site's one message set is merged from every owner's Translation files (FE-003 §4): each top-level namespace has
 * one owner, and each owner's German file has its English file's keys.
 */

const CHROME = 'src/shared/page-chrome/i18n';
const LANDING = 'src/page-assembly/landing/i18n';

describe('success cases', () => {
  it("merges every owner's namespaces into one message set per locale", () => {
    // ARRANGE
    const chrome = translationOwner(CHROME, { nav: { menu: 'Menu' } }, { nav: { menu: 'Menü' } });
    const landing = translationOwner(LANDING, { landing: { title: 'Home' } }, { landing: { title: 'Start' } });
    const expected = {
      en: { nav: { menu: 'Menu' }, landing: { title: 'Home' } },
      de: { nav: { menu: 'Menü' }, landing: { title: 'Start' } },
    };
    // ACT
    const merged = mergeTranslationFiles([chrome, landing]);
    // ASSERT
    expect(merged).toEqual(expected);
  });

  it('finds no drift in an owner whose German file has exactly the English keys', () => {
    // ARRANGE
    const owner = translationOwner(
      CHROME,
      { nav: { menu: 'Menu', label: 'Main' } },
      { nav: { menu: 'Menü', label: 'Haupt' } },
    );
    // ACT
    const drift = localeKeyDrift(owner);
    // ASSERT
    expect(drift).toEqual([]);
  });
});

describe('failure cases', () => {
  it('refuses a namespace two owners define, naming both files, the fix and FE-003-localization', () => {
    // ARRANGE
    const chrome = translationOwner(CHROME, { nav: { menu: 'Menu' } }, { nav: { menu: 'Menü' } });
    const landing = translationOwner(LANDING, { nav: { home: 'Home' } }, { nav: { home: 'Start' } });
    const message =
      'Translation namespace "nav" is defined by two owners: src/shared/page-chrome/i18n/en.json and ' +
      'src/page-assembly/landing/i18n/en.json. Move its keys to the owner that renders them, or give them a ' +
      'namespace of their own (FE-003-localization).';
    // ACT
    const merge = () => mergeTranslationFiles([chrome, landing]);
    // ASSERT
    expect(merge).toThrow(message);
  });

  it('names every key a German file lacks or adds, by its full path and file', () => {
    // ARRANGE
    const english = { nav: { menu: 'Menu', label: 'Main' } };
    const german = { nav: { menu: 'Menü', extra: 'Mehr' } } as unknown as typeof english;
    const owner = translationOwner(CHROME, english, german);
    const expected = [
      'src/shared/page-chrome/i18n/de.json lacks "nav.label"',
      'src/shared/page-chrome/i18n/de.json has "nav.extra", which en.json does not',
    ];
    // ACT
    const drift = localeKeyDrift(owner);
    // ASSERT
    expect(drift).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('merges no owners into an empty message set per locale', () => {
    // ARRANGE
    const expected = { en: {}, de: {} };
    // ACT
    const merged = mergeTranslationFiles([]);
    // ASSERT
    expect(merged).toEqual(expected);
  });

  it('counts a leaf that became a subtree in German as drift', () => {
    // ARRANGE
    const english = { nav: { menu: 'Menu' } };
    const german = { nav: { menu: { one: 'Menü' } } } as unknown as typeof english;
    const owner = translationOwner(CHROME, english, german);
    const expected = [
      'src/shared/page-chrome/i18n/de.json lacks "nav.menu"',
      'src/shared/page-chrome/i18n/de.json has "nav.menu.one", which en.json does not',
    ];
    // ACT
    const drift = localeKeyDrift(owner);
    // ASSERT
    expect(drift).toEqual(expected);
  });
});
