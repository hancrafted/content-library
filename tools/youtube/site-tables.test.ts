import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SPOKEN_LANGUAGE, SPOKEN_LANGUAGES } from './transcript.pure.ts';
import { WORDS_PER_MINUTE } from './voice-script.pure.ts';

// Tools may not import `src/shared/` (FE-007 §2), so these tables are copies: the test reads the site's source text.
const SHARED_LIB = path.resolve(__dirname, '../../src/shared/lib');

function siteSource(file: string): string {
  return readFileSync(path.join(SHARED_LIB, file), 'utf8');
}

describe('copies of the site tables', () => {
  it('lists the spoken languages and the default one as the site lists its locales (else change both)', () => {
    // ARRANGE
    const source = siteSource('locale.pure.ts');
    const locales = [...(/LOCALES = \[([^\]]*)\]/.exec(source)?.[1] ?? '').matchAll(/'(\w+)'/g)].map((m) => m[1]);
    const defaultLocale = /DEFAULT_LOCALE: Locale = '(\w+)'/.exec(source)?.[1];
    // ACT
    const ours = { languages: [...SPOKEN_LANGUAGES], defaultLanguage: DEFAULT_SPOKEN_LANGUAGE };
    // ASSERT
    expect(ours).toEqual({ languages: locales, defaultLanguage: defaultLocale });
  });

  it('reads at the site pace in words per minute (else change both)', () => {
    // ARRANGE
    const table = /WORDS_PER_MINUTE[^=]*= \{([^}]*)\}/.exec(siteSource('speaking-time.pure.ts'))?.[1] ?? '';
    const site = Object.fromEntries([...table.matchAll(/(\w+): (\d+)/g)].map((m) => [m[1], Number(m[2])]));
    // ACT
    const ours = { ...WORDS_PER_MINUTE };
    // ASSERT
    expect(ours).toEqual(site);
  });
});
