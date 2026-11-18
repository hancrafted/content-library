export type Tree = Record<string, unknown>;

export interface Ids {
  readonly stages: Set<string>;
  readonly nodes: Set<string>;
  readonly cells: Set<string>;
  readonly edges: Set<string>;
  readonly texts: Set<string>;
}

export interface Check {
  readonly ids: Ids;
  readonly expect: (ok: boolean, at: string, message: string) => boolean;
}

export const isTree = (value: unknown): value is Tree =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isText = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';
export const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
export const strings = (value: unknown): string[] => list(value).map(String);

export function unknownFields(
  check: Check,
  value: Tree,
  known: { readonly at: string; readonly fields: readonly string[] },
): void {
  for (const key of Object.keys(value))
    check.expect(known.fields.includes(key), `${known.at}.${key}`, 'is not a field here');
}
