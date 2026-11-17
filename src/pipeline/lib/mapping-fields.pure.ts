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

export function stringsOf(value: unknown): string[] {
  return isStringList(value) ? value : [];
}

export interface Field {
  key: string;
  required: boolean;
  valid: (value: unknown) => boolean;
  rule: string;
}

export function field(key: string, valid: (value: unknown) => boolean, rule: string): Field {
  return { key, required: true, valid, rule };
}

export function optional(fieldOf: Field): Field {
  return { ...fieldOf, required: false };
}

export function requiredWhen(condition: boolean, fieldOf: Field): Field {
  return { ...fieldOf, required: condition };
}

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
