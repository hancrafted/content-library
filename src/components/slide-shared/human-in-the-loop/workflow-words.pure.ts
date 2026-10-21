/*
 * The words of a Workflow pair: the `words:` tree both files carry. The English file holds data and words, the German
 * file words only, under exactly the same key paths (FE-012 §1.3); a Slide may override any word, key by key.
 */

export type Tree = Readonly<Record<string, unknown>>;

/** Each override of a words tree: any subtree may be left out. */
export type DeepPartial<T> = { readonly [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : DeepPartial<T[K]> };

export const isTree = (value: unknown): value is Tree =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Every key path of a tree, arrays by index, leaves only. */
export function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

/** `over` laid over `base`, key by key; arrays and text in `over` replace as a whole. */
export function mergeWords(base: unknown, over: unknown): unknown {
  if (over === undefined) return base;
  if (!isTree(base) || !isTree(over)) return over;
  const keys = new Set([...Object.keys(base), ...Object.keys(over)]);
  return Object.fromEntries([...keys].map((key) => [key, mergeWords(base[key], over[key])]));
}

/** The key paths one side has and the other lacks, as one sentence each. */
export function parityProblems(config: unknown, locale: unknown): string[] {
  const have = new Set(keyPaths(config));
  const other = new Set(keyPaths(locale));
  return [
    ...[...have].filter((path) => !other.has(path)).map((path) => `The locale words lack the key "${path}".`),
    ...[...other]
      .filter((path) => !have.has(path))
      .map((path) => `The locale words have the key "${path}", which the config words lack.`),
  ];
}
