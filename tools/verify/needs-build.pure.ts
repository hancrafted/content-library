// Pre-push's build trigger: whether a branch changed anything the static export is built from. `EXPORT_PATHS` is the
// `paths:` filter of `.github/workflows/deploy-cloudflare.yml` minus the workflow file itself, which no local build
// reads; needs-build.pure.test.ts fails when the two drift.

/** GitHub `paths:` globs of what the export is built from: source, public assets, dependencies, Next and PostCSS config, and what the art bake reads. */
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

/** A `paths:` glob as a RegExp: `**` spans folders, `*` stays inside one segment, everything else is literal. */
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

/** True when any repo-relative changed path is an export input, so `build` and `test:build` have something to catch. */
export function needsBuild(changedPaths: readonly string[]): boolean {
  return changedPaths.some((file) => EXPORT_MATCHERS.some((matcher) => matcher.test(file)));
}
