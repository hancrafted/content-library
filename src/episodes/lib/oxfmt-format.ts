import { readFileSync } from 'node:fs';
import path from 'node:path';
import { format, type FormatConfig } from 'oxfmt';
import ts from 'typescript';

/** The repository's oxfmt config: the one file `oxfmt` reads for `npm run format`. */
const CONFIG_PATH = path.resolve(import.meta.dirname, '../../../.oxfmtrc.jsonc');

let config: FormatConfig | undefined;

/**
 * Source text formatted as `npm run format` would write it, so `format:check` passes a generated file.
 * oxfmt's Node API discovers no config file, so the repository's `.oxfmtrc.jsonc` is read here, comments and trailing commas parsed by TypeScript's JSONC reader; `filepath` only
 * picks the language. Throws when the source does not parse.
 */
export async function formatAsRepo(filepath: string, text: string): Promise<string> {
  config ??= ts.parseConfigFileTextToJson(CONFIG_PATH, readFileSync(CONFIG_PATH, 'utf8')).config as FormatConfig;
  const { code, errors } = await format(filepath, text, config);
  if (errors.length > 0)
    throw new Error(`oxfmt could not format ${filepath}: ${errors.map((e) => e.message).join('; ')}`);
  return code;
}
