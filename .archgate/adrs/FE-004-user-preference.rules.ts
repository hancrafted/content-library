/// <reference path="../rules.d.ts" />

// FE-004 — User Preference. One Discipline so far.
//
// `single-storage-key` — the site touches exactly one localStorage key, named
// once in src/config.yaml (FE-004 §1). Every getItem/setItem call under src/
// must pass that key, either as `PREFS_KEY` or as the literal itself, and every
// `PREFS_KEY` declaration must equal it, so the config and the code cannot
// drift. Accepted trade-off: the next legitimate second key breaks this rule,
// and the ADR is amended first. Runs at error (GEN-001 §7). Self-contained by
// design: archgate forbids imports between rules files.
const CONFIG_PATH = 'src/config.yaml';
const CONFIG_FIELD = 'localStorageKey';
const SOURCE_GLOBS = ['src/**/*.ts', 'src/**/*.tsx'];
const KEY_CONSTANT = 'PREFS_KEY';

// The first argument up to its `,` or `)`. A template interpolation such as
// `${JSON.stringify(PREFS_KEY)}` is cut at its first `)`, which still names the
// constant — the form the pre-paint theme script uses.
const CALL_RE = /localStorage\s*\.\s*(?:getItem|setItem)\s*\(\s*([^,)]*)/g;
const DECLARATION_RE = /\bPREFS_KEY\s*=\s*(['"`])(.*?)\1/g;
const LITERAL_RE = /^(['"`])(.*)\1$/;
const PROVENANCE = '(FE-004 [single-storage-key])';

async function readConfiguredKey(ctx: RuleContext): Promise<string | undefined> {
  try {
    const { content } = await ctx.readYAML(CONFIG_PATH);
    const value = (content as Record<string, unknown> | null)?.[CONFIG_FIELD];
    return typeof value === 'string' && value !== '' ? value : undefined;
  } catch {
    return undefined;
  }
}

function usesKey(argument: string, key: string): boolean {
  if (new RegExp(`\\b${KEY_CONSTANT}\\b`).test(argument)) return true;
  return argument.trim().match(LITERAL_RE)?.[2] === key;
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

function checkSource(ctx: RuleContext, file: string, source: string, key: string): void {
  for (const call of source.matchAll(CALL_RE)) {
    if (usesKey(call[1], key)) continue;
    ctx.report.violation({
      message: `localStorage call passes '${call[1].trim()}', not the one key '${key}' from ${CONFIG_PATH} — pass ${KEY_CONSTANT}, or read and write through src/lib/prefs-storage.ts ${PROVENANCE}.`,
      file,
      line: lineAt(source, call.index),
    });
  }
  for (const declaration of source.matchAll(DECLARATION_RE)) {
    if (declaration[2] === key) continue;
    ctx.report.violation({
      message: `${KEY_CONSTANT} is '${declaration[2]}' but ${CONFIG_PATH} sets ${CONFIG_FIELD} to '${key}' — make them equal ${PROVENANCE}.`,
      file,
      line: lineAt(source, declaration.index),
    });
  }
}

export default {
  rules: {
    'single-storage-key': {
      description:
        'Every localStorage getItem/setItem call under src/ uses the one key set as localStorageKey in src/config.yaml, and every PREFS_KEY declaration equals that key.',
      severity: 'error',
      async check(ctx) {
        const key = await readConfiguredKey(ctx);
        if (key === undefined) {
          ctx.report.violation({
            message: `${CONFIG_PATH} must exist and set a non-empty string ${CONFIG_FIELD} ${PROVENANCE}.`,
            file: CONFIG_PATH,
          });
          return;
        }
        for (const glob of SOURCE_GLOBS) {
          for (const file of await ctx.glob(glob)) {
            checkSource(ctx, file, await ctx.readFile(file), key);
          }
        }
      },
    },
  },
} satisfies RuleSet;
