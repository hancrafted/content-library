// decision: FE-007 §2.8
export interface UseCaseTexts {
  readonly data: string;
  readonly en: string;
  readonly de: string;
}

export const TEXT_SUFFIX: Readonly<Record<keyof UseCaseTexts, string>> = {
  data: '.yml',
  en: '.words.yml',
  de: '.words.de.yml',
};

export const textFileNames = (id: string): UseCaseTexts => mapTexts((suffix) => `${id}${suffix}`, TEXT_SUFFIX);

export const mapTexts = <T, U>(
  f: (t: T) => U,
  texts: Readonly<Record<keyof UseCaseTexts, T>>,
): Record<keyof UseCaseTexts, U> => ({
  data: f(texts.data),
  en: f(texts.en),
  de: f(texts.de),
});
