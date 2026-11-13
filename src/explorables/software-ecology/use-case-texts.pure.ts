/*
 * The texts one use case is made of, as one shape behind two loaders (FE-007 §2.8): the page imports them statically
 * (`use-case-data.ts`), the node entry reads them from disk (`ecology-sim.node.ts`). Pure, so both can import it.
 */

/** A use case's master data and its words per locale, as unparsed YAML. */
export interface UseCaseTexts {
  readonly data: string;
  readonly en: string;
  readonly de: string;
}

/** The file suffix of each text, after the use case's id: `tire` + `.words.de.yml`. */
export const TEXT_SUFFIX: Readonly<Record<keyof UseCaseTexts, string>> = {
  data: '.yml',
  en: '.words.yml',
  de: '.words.de.yml',
};

/** The names of a use case's files in this Explorable's folder. */
export const textFileNames = (id: string): UseCaseTexts => ({
  data: `${id}${TEXT_SUFFIX.data}`,
  en: `${id}${TEXT_SUFFIX.en}`,
  de: `${id}${TEXT_SUFFIX.de}`,
});
