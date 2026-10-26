import { LOCALES, type Locale } from '../lib/locale.pure';

/** One owner's Translation files: the folder they sit in and each locale's parsed file, typed by the English one. */
export interface TranslationOwner<T extends object = object> {
  /** The repo-relative folder holding `en.json` and `de.json`, as an error names it. */
  readonly folder: string;
  readonly files: Readonly<Record<Locale, T>>;
}

/**
 * Pairs an owner's two files. The German file is typed against the English one, so a German file missing an English
 * key fails `tsc` where the owner is listed.
 */
export function translationOwner<T extends object>(folder: string, en: T, de: NoInfer<T>): TranslationOwner<T> {
  return { folder, files: { en, de } };
}

type Intersection<U> = (U extends unknown ? (u: U) => void : never) extends (i: infer I) => void ? I : never;

/** The merged message set's type: every owner's English file at once. */
export type MergedMessages<O extends readonly TranslationOwner[]> = Intersection<O[number]['files']['en']>;

const fileOf = (owner: TranslationOwner, locale: Locale) => `${owner.folder}/${locale}.json`;

/**
 * Merges every owner's files into the one message set next-intl serves, per locale. Each top-level namespace has one
 * owner: a namespace two owners define throws, naming both files, so the site never renders whichever file won.
 */
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

/**
 * Every key a non-English file of the owner lacks or adds against its English file, by full path; empty when the
 * pair agrees. `tsc` sees a lacking key only; this sees both.
 */
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
