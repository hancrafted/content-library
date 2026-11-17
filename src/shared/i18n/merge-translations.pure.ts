import { LOCALES, type Locale } from '../lib/locale.pure';

export interface TranslationOwner<T extends object = object> {
  readonly folder: string;
  readonly files: Readonly<Record<Locale, T>>;
}

export function translationOwner<T extends object>(folder: string, en: T, de: NoInfer<T>): TranslationOwner<T> {
  return { folder, files: { en, de } };
}

type Intersection<U> = (U extends unknown ? (u: U) => void : never) extends (i: infer I) => void ? I : never;

export type MergedMessages<O extends readonly TranslationOwner[]> = Intersection<O[number]['files']['en']>;

const fileOf = (owner: TranslationOwner, locale: Locale) => `${owner.folder}/${locale}.json`;

export function mergeTranslationFiles<const O extends readonly TranslationOwner[]>(
  owners: O,
): Record<Locale, MergedMessages<O>> {
  const merged = Object.fromEntries(
    LOCALES.map((locale) => {
      const set: Record<string, unknown> = {};
      const definedBy = new Map<string, TranslationOwner>();
      for (const owner of owners) {
        for (const [namespace, value] of Object.entries(owner.files[locale])) {
          const first = definedBy.get(namespace);
          if (first !== undefined) {
            throw new Error(
              `Translation namespace "${namespace}" is defined by two owners: ${fileOf(first, locale)} and ` +
                `${fileOf(owner, locale)}. Move its keys to the owner that renders them, or give them a namespace ` +
                'of their own (FE-003-localization).',
            );
          }
          definedBy.set(namespace, owner);
          set[namespace] = value;
        }
      }
      return [locale, set];
    }),
  );
  return merged as Record<Locale, MergedMessages<O>>;
}

function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

export function localeKeyDrift(owner: TranslationOwner): string[] {
  const english = keyPaths(owner.files.en);
  return LOCALES.filter((locale) => locale !== 'en').flatMap((locale) => {
    const other = keyPaths(owner.files[locale]);
    const file = fileOf(owner, locale);
    return [
      ...english.filter((key) => !other.includes(key)).map((key) => `${file} lacks "${key}"`),
      ...other.filter((key) => !english.includes(key)).map((key) => `${file} has "${key}", which en.json does not`),
    ];
  });
}
