/** Each item listed more than once, once: what the store's refusals name as listed twice. */
export function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, index) => items.indexOf(item) !== index))];
}
