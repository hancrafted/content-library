export const EXPORT_PATHS = [
  'src/**',
  'public/**',
  'package.json',
  'package-lock.json',
  'next.config.*',
  'tsconfig.json',
  'postcss.config.mjs',
  'raw-text-files.mts',
  'tools/art/**',
] as const;

const EXCLUDED_PATHS = ['src/**/*.md'] as const;

export interface ChangeKind {
  build: boolean;
  docsOnly: boolean;
}

function pathRegExp(glob: string): RegExp {
  const source = glob
    .split(/(\*\*\/|\*\*|\*)/)
    .map((part) => {
      if (part === '**/') return '(?:.*/)?';
      if (part === '**') return '.*';
      if (part === '*') return '[^/]*';
      return escapeRegExp(part);
    })
    .join('');
  return new RegExp(`^${source}$`);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

const EXPORT_MATCHERS = EXPORT_PATHS.map(pathRegExp);
const EXCLUDED_MATCHERS = EXCLUDED_PATHS.map(pathRegExp);
const DOCS_MATCHER = pathRegExp('**/*.md');

const matchesAny = (matchers: readonly RegExp[], file: string): boolean =>
  matchers.some((matcher) => matcher.test(file));

export function changeKind(changedPaths: readonly string[]): ChangeKind {
  const build = changedPaths.some((file) => matchesAny(EXPORT_MATCHERS, file) && !matchesAny(EXCLUDED_MATCHERS, file));
  const docsOnly = changedPaths.length > 0 && changedPaths.every((file) => DOCS_MATCHER.test(file));
  return { build, docsOnly };
}
