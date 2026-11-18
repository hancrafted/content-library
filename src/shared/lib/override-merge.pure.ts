const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function mergeOverride<T>(base: T, override: unknown): T {
  if (!isRecord(base) || !isRecord(override)) return (override === undefined ? base : override) as T;
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
  return Object.fromEntries([...keys].map((key) => [key, mergeOverride(base[key], override[key])])) as T;
}
