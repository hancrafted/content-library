// Scoped mutation targets (ARCH-003 §6): maps changed repository paths to the
// existing `*.pure.ts` modules and `skills/**/scripts/**/*.ts` skill scripts to mutate.

const SKILL_SCRIPT_RE = /^skills\/[^/]+\/scripts\/.+\.ts$/;

/** Maps a unit test path to its `.pure.ts` or skill-script subject; leaves other paths unchanged. */
function toSubject(filePath: string, exists: (filePath: string) => boolean): string {
  if (filePath.endsWith('.pure.test.ts')) return `${filePath.slice(0, -'.pure.test.ts'.length)}.pure.ts`;
  if (filePath.endsWith('.browser.test.ts') || !filePath.endsWith('.test.ts')) return filePath;
  const stem = filePath.slice(0, -'.test.ts'.length);
  if (SKILL_SCRIPT_RE.test(filePath)) return exists(`${stem}.pure.ts`) ? `${stem}.pure.ts` : `${stem}.ts`;
  return filePath.startsWith('src/') ? `${stem}.pure.ts` : filePath;
}

function isMutatableTarget(filePath: string): boolean {
  if (filePath.endsWith('.test.ts')) return false;
  return filePath.endsWith('.pure.ts') || SKILL_SCRIPT_RE.test(filePath);
}

export function resolveMutationScope(changedPaths: readonly string[], exists: (filePath: string) => boolean): string[] {
  const candidates = changedPaths
    .map((filePath) => toSubject(filePath, exists))
    .filter((file) => isMutatableTarget(file) && exists(file));
  return [...new Set(candidates)].sort();
}
