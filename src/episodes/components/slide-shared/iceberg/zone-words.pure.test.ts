import { describe, expect, it } from 'vitest';
import { zoneWordsFrom, type ZoneWordKey } from './zone-words.pure';

/*
 * The zone words a Slide hands the ruler and the zone label: read key by key from the Slide's own `i18n/`, through
 * its `t`, so no Slide reads its Translation file raw.
 */

const DICTIONARY: Readonly<Record<string, string>> = {
  'zones.surface.name': 'Surface',
  'zones.surface.metres': '0 m, the waterline',
  'zones.surface.science': 'the sea surface and the air above it',
  'zones.sunlit.name': 'Sunlit',
  'zones.sunlit.metres': '0–200 m',
  'zones.sunlit.science': 'epipelagic',
  'zones.twilight.name': 'Twilight',
  'zones.twilight.metres': '200–1,000 m',
  'zones.twilight.science': 'mesopelagic',
  'zones.midnight.name': 'Midnight',
  'zones.midnight.metres': '1,000–4,000 m',
  'zones.midnight.science': 'bathypelagic',
  'zones.abyss.name': 'Abyss',
  'zones.abyss.metres': '4,000–6,000 m',
  'zones.abyss.science': 'abyssopelagic',
};

describe('success cases', () => {
  it('names each zone from the Surface down by its plain name, its metres and its scientific name', () => {
    // ARRANGE
    const expected = {
      surface: { name: 'Surface', metres: '0 m, the waterline', science: 'the sea surface and the air above it' },
      sunlit: { name: 'Sunlit', metres: '0–200 m', science: 'epipelagic' },
      twilight: { name: 'Twilight', metres: '200–1,000 m', science: 'mesopelagic' },
      midnight: { name: 'Midnight', metres: '1,000–4,000 m', science: 'bathypelagic' },
      abyss: { name: 'Abyss', metres: '4,000–6,000 m', science: 'abyssopelagic' },
    };
    // ACT
    const words = zoneWordsFrom((key) => DICTIONARY[key] ?? '');
    // ASSERT
    expect(words).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lets a missing word fail where the Slide reads it, rather than inventing one', () => {
    // ARRANGE
    const expected = /zones\.surface\.name/;
    // ACT
    const read = () =>
      zoneWordsFrom((key) => {
        throw new Error(`No message ${key}`);
      });
    // ASSERT
    expect(read).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('asks for every key once, fifteen in all, from the Surface down', () => {
    // ARRANGE
    const expected = [
      'zones.surface.name',
      'zones.surface.metres',
      'zones.surface.science',
      'zones.sunlit.name',
      'zones.sunlit.metres',
      'zones.sunlit.science',
      'zones.twilight.name',
      'zones.twilight.metres',
      'zones.twilight.science',
      'zones.midnight.name',
      'zones.midnight.metres',
      'zones.midnight.science',
      'zones.abyss.name',
      'zones.abyss.metres',
      'zones.abyss.science',
    ];
    const asked: ZoneWordKey[] = [];
    // ACT
    zoneWordsFrom((key) => (asked.push(key), key));
    // ASSERT
    expect(asked).toEqual(expected);
  });
});
