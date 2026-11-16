// Pre-push's build trigger: whether a branch changed anything the static export is built from. The list mirrors the
// `paths:` of `.github/workflows/deploy-cloudflare.yml`, minus the workflow file itself, which no local build reads.

/** Folders whose every file feeds the export. */
const EXPORT_FOLDERS = ['src/', 'public/', 'tools/art/'] as const;

/** Single files the export is built from: dependencies, Next and PostCSS config, and what the art bake reads. */
const EXPORT_FILES = new Set([
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'postcss.config.mjs',
  'raw-text-files.mts',
]);

/** True when any repo-relative changed path is an export input, so `build` and `test:build` have something to catch. */
export function needsBuild(changedPaths: readonly string[]): boolean {
  return changedPaths.some(
    (file) => EXPORT_FILES.has(file) || EXPORT_FOLDERS.some((folder) => file.startsWith(folder)),
  );
}
