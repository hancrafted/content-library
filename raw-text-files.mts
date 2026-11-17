import type { Plugin } from 'vitest/config';

// An Explorable's data files, a Claude Code `.jsonl` log and a `.yml` config, are imported as text and parsed at
// build time. `next.config.ts` loads them with Turbopack's `raw` rule; this plugin does the same for the vitest lanes.
// A Run's `run-checks.test.ts` globs its staging files, `.md` and `.html` too, so `--changed` follows them
// (ARCH-003 §4.7); only tests import those, so Turbopack needs no rule for them.
const RAW_TEXT = /\.(?:jsonl|yml|md|html)$/;

export function rawTextFiles(): Plugin {
  return {
    name: 'raw-text-files',
    transform(code, id) {
      if (!RAW_TEXT.test(id)) return null;
      return { code: `export default ${JSON.stringify(code)};`, map: null };
    },
  };
}
