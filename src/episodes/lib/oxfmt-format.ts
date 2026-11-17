import JSON5 from 'json5';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { format, type FormatConfig } from 'oxfmt';

const CONFIG_PATH = path.resolve(import.meta.dirname, '../../../.oxfmtrc.jsonc');

let config: FormatConfig | undefined;

export async function formatAsRepo(filepath: string, text: string): Promise<string> {
  config ??= JSON5.parse(readFileSync(CONFIG_PATH, 'utf8')) as FormatConfig;
  const { code, errors } = await format(filepath, text, config);
  if (errors.length > 0)
    throw new Error(`oxfmt could not format ${filepath}: ${errors.map((e) => e.message).join('; ')}`);
  return code;
}
