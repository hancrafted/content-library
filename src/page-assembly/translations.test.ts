import { localeKeyDrift, mergeTranslationFiles } from '@/shared/i18n/merge-translations.pure';
import { describe, expect, it } from 'vitest';
import { TRANSLATION_OWNERS, TRANSLATIONS } from './translations';

/*
 * The site's Translation files, one pair per owner (FE-003 §4): every owner's German file has its English file's keys,
 * and no namespace has two owners, so the merged set next-intl serves holds every owner's namespaces once.
 */

describe('success cases', () => {
  it("finds every owner's German file holding exactly its English keys", () => {
    // ARRANGE
    const owners = TRANSLATION_OWNERS;
    // ACT
    const drift = owners.flatMap((owner) => localeKeyDrift(owner));
    // ASSERT
    expect(drift).toEqual([]);
  });

  it("serves every owner's namespaces, each once, in both locales", () => {
    // ARRANGE
    const expected = TRANSLATION_OWNERS.flatMap((owner) => Object.keys(owner.files.en)).sort();
    // ACT
    const served = { en: Object.keys(TRANSLATIONS.en).sort(), de: Object.keys(TRANSLATIONS.de).sort() };
    // ASSERT
    expect(served).toEqual({ en: expected, de: expected });
  });
});

describe('failure cases', () => {
  it("refuses an owner listed twice, since every one of its namespaces would have two owners' files", () => {
    // ARRANGE
    const [first] = TRANSLATION_OWNERS;
    const namespace = Object.keys(first.files.en)[0];
    const message = `Translation namespace "${namespace}" is defined by two owners`;
    // ACT
    const merge = () => mergeTranslationFiles([first, first]);
    // ASSERT
    expect(merge).toThrow(message);
  });
});

describe('edge cases', () => {
  it('lists each owner folder once, so no two pairs hide in one folder', () => {
    // ARRANGE
    const folders = TRANSLATION_OWNERS.map((owner) => owner.folder);
    // ACT
    const distinct = [...new Set(folders)];
    // ASSERT
    expect(distinct).toEqual(folders);
  });
});
