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

function pathRegExp(glob: string): RegExp {
  const source = glob
    .split('**')
    .map((part) => part.split('*').map(escapeRegExp).join('[^/]*'))
    .join('.*');
  return new RegExp(`^${source}$`);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

const EXPORT_MATCHERS = EXPORT_PATHS.map(pathRegExp);

export function needsBuild(changedPaths: readonly string[]): boolean {
  return changedPaths.some((file) => EXPORT_MATCHERS.some((matcher) => matcher.test(file)));
}
