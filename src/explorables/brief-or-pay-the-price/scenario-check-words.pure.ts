import { isTree, isText, type Check } from './scenario-check-context.pure';
import { SCENARIO_LOCALES } from './scenario.types';

interface Table {
  readonly at: string;
  readonly keys: readonly string[];
}

function checkTable(check: Check, words: unknown, table: Table & { readonly ids: Iterable<string> }): void {
  const rows = isTree(words) ? words : {};
  for (const id of table.ids)
    for (const key of table.keys) {
      const row = rows[id];
      check.expect(isTree(row) && isText(row[key]), `${table.at}.${id}.${key}`, 'is missing');
    }
}

function checkLocale(check: Check, words: Record<string, unknown>, at: string): void {
  const { ids } = check;
  check.expect(isText(words.title), `${at}.title`, 'is missing');
  checkTable(check, words.stages, { at: `${at}.stages`, ids: ids.stages, keys: ['name', 'short', 'analogy', 'ai'] });
  checkTable(check, words.nodes, { at: `${at}.nodes`, ids: ids.nodes, keys: ['label', 'role'] });
  checkTable(check, words.cells, { at: `${at}.cells`, ids: ids.cells, keys: ['freelancer', 'ai'] });
  const texts = isTree(words.annotations) ? words.annotations : {};
  for (const id of ids.texts) check.expect(isText(texts[id]), `${at}.annotations.${id}`, 'is missing');
}

export function checkWords(check: Check, i18n: unknown): void {
  for (const locale of SCENARIO_LOCALES) {
    const words = isTree(i18n) ? i18n[locale] : undefined;
    const at = `i18n.${locale}`;
    if (check.expect(isTree(words), at, 'is missing')) checkLocale(check, words as Record<string, unknown>, at);
  }
}
