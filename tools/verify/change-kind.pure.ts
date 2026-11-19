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

export const MARKDOWN_NO_BUILD_STEP_READS = ['src/**/*.md'] as const;

const ANY_DEPTH_MARKDOWN_PATHS = ['**/*.md'] as const;

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
const EXCLUDED_MATCHERS = MARKDOWN_NO_BUILD_STEP_READS.map(pathRegExp);
const DOCS_MATCHERS = ANY_DEPTH_MARKDOWN_PATHS.map(pathRegExp);

const matchesAny = (matchers: readonly RegExp[], file: string): boolean =>
  matchers.some((matcher) => matcher.test(file));

export function changeKind(changedPaths: readonly string[]): ChangeKind {
  const build = changedPaths.some((file) => matchesAny(EXPORT_MATCHERS, file) && !matchesAny(EXCLUDED_MATCHERS, file));
  const docsOnly = changedPaths.length > 0 && changedPaths.every((file) => matchesAny(DOCS_MATCHERS, file));
  return { build, docsOnly };
}
