/// <reference path="../rules.d.ts" />

// decision: FE-001 §3
const CONFIG_PATH = 'src/shared/config.yaml';
const SOURCE_GLOBS = ['src/**/*.ts', 'src/**/*.tsx'];

const KINDS = [
  { field: 'localStorageKey', constant: 'PREFS_KEY' },
  { field: 'progressStorageKey', constant: 'PROGRESS_KEY' },
] as const;

interface Key {
  readonly field: string;
  readonly constant: string;
  readonly value: string;
}

const STORAGE_CALL_FIRST_ARGUMENT_CUT_AT_FIRST_PAREN_RE = /localStorage\s*\.\s*(?:getItem|setItem)\s*\(\s*([^,)]*)/g;
const LITERAL_RE = /^(['"`])(.*)\1$/;
const PROVENANCE = '(FE-001 [single-storage-key])';

const declarationRe = (constant: string) => new RegExp(`\\b${constant}\\s*=\\s*(['"\`])(.*?)\\1`, 'g');

async function readConfiguredKeys(ctx: RuleContext): Promise<{ keys: Key[]; missing: string[] }> {
  let content: Record<string, unknown> | null = null;
  try {
    content = (await ctx.readYAML(CONFIG_PATH)).content as Record<string, unknown> | null;
  } catch {
    content = null;
  }
  const keys: Key[] = [];
  const missing: string[] = [];
  for (const { field, constant } of KINDS) {
    const value = content?.[field];
    if (typeof value === 'string' && value !== '') keys.push({ field, constant, value });
    else missing.push(field);
  }
  return { keys, missing };
}

function usesKey(argument: string, keys: readonly Key[]): boolean {
  if (keys.some(({ constant }) => new RegExp(`\\b${constant}\\b`).test(argument))) return true;
  const literal = argument.trim().match(LITERAL_RE)?.[2];
  return keys.some(({ value }) => value === literal);
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

function checkCalls(ctx: RuleContext, file: string, source: string, keys: readonly Key[]): void {
  const allowed = keys.map(({ value }) => `'${value}'`).join(' or ');
  for (const call of source.matchAll(STORAGE_CALL_FIRST_ARGUMENT_CUT_AT_FIRST_PAREN_RE)) {
    if (usesKey(call[1], keys)) continue;
    ctx.report.violation({
      message: `localStorage call passes '${call[1].trim()}', not ${allowed} from ${CONFIG_PATH} — pass PREFS_KEY or PROGRESS_KEY, or read and write through src/shared/lib/prefs-storage.ts ${PROVENANCE}.`,
      file,
      line: lineAt(source, call.index),
    });
  }
}

function checkDeclarations(ctx: RuleContext, file: string, source: string, keys: readonly Key[]): void {
  for (const { field, constant, value } of keys) {
    for (const declaration of source.matchAll(declarationRe(constant))) {
      if (declaration[2] === value) continue;
      ctx.report.violation({
        message: `${constant} is '${declaration[2]}' but ${CONFIG_PATH} sets ${field} to '${value}' — make them equal ${PROVENANCE}.`,
        file,
        line: lineAt(source, declaration.index),
      });
    }
  }
}

export default {
  rules: {
    'single-storage-key': {
      description:
        'Every localStorage getItem/setItem call under src/ uses one of the two keys set as localStorageKey and progressStorageKey in src/shared/config.yaml, and every PREFS_KEY and PROGRESS_KEY declaration equals its key.',
      severity: 'error',
      async check(ctx) {
        const { keys, missing } = await readConfiguredKeys(ctx);
        if (missing.length > 0) {
          ctx.report.violation({
            message: `${CONFIG_PATH} must exist and set a non-empty string ${missing.join(' and ')} ${PROVENANCE}.`,
            file: CONFIG_PATH,
          });
          return;
        }
        for (const glob of SOURCE_GLOBS) {
          for (const file of await ctx.glob(glob)) {
            const source = await ctx.readFile(file);
            checkCalls(ctx, file, source, keys);
            checkDeclarations(ctx, file, source, keys);
          }
        }
      },
    },
  },
} satisfies RuleSet;
