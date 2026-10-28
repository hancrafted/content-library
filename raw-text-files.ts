import type { Plugin } from 'vitest/config';

// An Explorable's data files, a Claude Code `.jsonl` log and a `.yml` config, are imported as text and parsed at
// build time. `next.config.ts` loads them with Turbopack's `raw` rule; this plugin does the same for the vitest lanes.
const RAW_TEXT = /\.(?:jsonl|yml)$/;

export function rawTextFiles(): Plugin {
  return {
    name: 'raw-text-files',
    transform(code, id) {
      if (!RAW_TEXT.test(id)) return null;
      return { code: `export default ${JSON.stringify(code)};`, map: null };
    },
  };
}
