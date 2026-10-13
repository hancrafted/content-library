/*
 * Validation of a parsed YAML mapping against a list of fields: which keys
 * must be present, which may be, and what each value must be. Each problem is
 * a message after the caller's `where`, so the caller names the mapping.
 */

export type Mapping = Record<string, unknown>;

export function isMapping(value: unknown): value is Mapping {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

/** The strings of a list, or none when the value is no list of strings (its own finding). */
export function stringsOf(value: unknown): string[] {
  return isStringList(value) ? value : [];
}

/** One key of a mapping: whether it must be present, and what its value must be. */
export interface Field {
  key: string;
  required: boolean;
  valid: (value: unknown) => boolean;
  /** Completes "<where> has <key> <value>; …" when the value is not valid. */
  rule: string;
}

export function field(key: string, valid: (value: unknown) => boolean, rule: string): Field {
  return { key, required: true, valid, rule };
}

export function optional(fieldOf: Field): Field {
  return { ...fieldOf, required: false };
}

/** The field, required only when the condition holds and optional otherwise. */
export function requiredWhen(condition: boolean, fieldOf: Field): Field {
  return { ...fieldOf, required: condition };
}

/** Missing required keys, then unknown keys, then invalid values, each as a message after `where`. */
export function checkMapping(where: string, mapping: Mapping, fields: readonly Field[]): string[] {
  const keys = fields.map(({ key }) => key);
  return [
    ...fields
      .filter(({ key, required }) => required && !Object.hasOwn(mapping, key))
      .map(({ key }) => `${where} lacks the key "${key}".`),
    ...Object.keys(mapping)
      .filter((key) => !keys.includes(key))
      .map((key) => `${where} has an unknown key "${key}"; the keys are ${keys.join(', ')}.`),
    ...fields
      .filter(({ key, valid }) => Object.hasOwn(mapping, key) && !valid(mapping[key]))
      .map(({ key, rule }) => `${where} has ${key} ${JSON.stringify(mapping[key])}; ${rule}.`),
  ];
}
