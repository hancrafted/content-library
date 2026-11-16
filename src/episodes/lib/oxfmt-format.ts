import JSON5 from 'json5';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { format, type FormatConfig } from 'oxfmt';

/** The repository's oxfmt config: the one file `oxfmt` reads for `npm run format`. */
const CONFIG_PATH = path.resolve(import.meta.dirname, '../../../.oxfmtrc.jsonc');

let config: FormatConfig | undefined;

/**
 * Source text formatted as `npm run format` would write it, so `format:check` passes a generated file.
 * oxfmt's Node API discovers no config file, so the repository's `.oxfmtrc.jsonc` is read here, comments and
 * trailing commas parsed by `json5`; `filepath` only picks the language. Throws when the source
 * does not parse.
 *
 * `episodes/lib` is a forced home, not a natural one: dependency-cruiser lets `tools/` import only a tiered
 * area's `lib/`, and a `src` test consumes this too, so it lives in the one `lib/` both can reach.
 */
export async function formatAsRepo(filepath: string, text: string): Promise<string> {
  config ??= JSON5.parse(readFileSync(CONFIG_PATH, 'utf8')) as FormatConfig;
  const { code, errors } = await format(filepath, text, config);
  if (errors.length > 0)
    throw new Error(`oxfmt could not format ${filepath}: ${errors.map((e) => e.message).join('; ')}`);
  return code;
}
