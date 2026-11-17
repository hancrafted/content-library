export interface TranslationNode {
  readonly [key: string]: string | TranslationNode;
}

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

// decision: FE-006 §4
export function translationStrings<T extends TranslationNode, K extends keyof T & string = never>(
  namespace: string,
  shape: T,
  { read, omit = [] }: TranslationRead<K>,
): Omit<T, K> {
  const kept = Object.fromEntries(Object.entries(shape).filter(([key]) => !(omit as readonly string[]).includes(key)));
  return readNode(namespace, kept, read) as Omit<T, K>;
}
