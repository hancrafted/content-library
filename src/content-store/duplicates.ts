export function duplicates(items: readonly string[]): string[] {
  return [...new Set(items.filter((item, index) => items.indexOf(item) !== index))];
}
