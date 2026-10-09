/** A Translation file subtree whose leaves are all strings: what a namespace of chrome labels looks like. */
export interface TranslationNode {
  readonly [key: string]: string | TranslationNode;
}

/** How to read a namespace: `read` translates one full key; `omit` names top-level keys to leave out. */
export interface TranslationRead<K extends string> {
  readonly read: (key: string) => string;
  readonly omit?: readonly K[];
}

function readNode(prefix: string, node: TranslationNode, read: (key: string) => string): TranslationNode {
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => {
      const path = `${prefix}.${key}`;
      return [key, typeof value === 'string' ? read(path) : readNode(path, value, read)];
    }),
  );
}

/**
 * One namespace's strings, translated: the Translation file's own shape walked leaf by
 * leaf, each leaf read by its full key. The result holds only plain strings,
 * so it crosses to a client component as it is (FE-006 §4). `omit` drops
 * top-level keys the caller reads itself, such as a leaf that needs ICU
 * arguments, which a bare read would reject. A failing read throws, so a
 * broken leaf fails the build.
 */
export function translationStrings<T extends TranslationNode, K extends keyof T & string = never>(
  namespace: string,
  shape: T,
  { read, omit = [] }: TranslationRead<K>,
): Omit<T, K> {
  const kept = Object.fromEntries(Object.entries(shape).filter(([key]) => !(omit as readonly string[]).includes(key)));
  return readNode(namespace, kept, read) as Omit<T, K>;
}
