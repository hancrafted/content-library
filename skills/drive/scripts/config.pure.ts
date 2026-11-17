// The project config the `drive` CLI reads from its config file (design-ADR 0027): every repo-specific value
// the worktree commands would otherwise hard-code. Pure: text in, a validated config or an error out.
import { parse } from 'yaml';

/** Where a project's config lives, relative to its checkout. */
export const CONFIG_PATH = 'docs/drive/project.yml';

export interface WorktreeConfig {
  /** Where worktrees live, relative to the main checkout; a branch's folder is its name with `/` as `-`. */
  dir: string;
  /** The branch worktrees start from (as `<remote>/<baseBranch>`) and `done` fast-forwards when no --base is given. */
  baseBranch: string;
  remote: string;
  /** How a hint names this command, for a human to paste. */
  invoke: string;
  /** Shell commands run in a new worktree, in order. */
  install: string[];
  /** The shell command `new` runs in the new worktree after install, or null. */
  preflight: string | null;
  /** A module, relative to the repo, exporting `withLock` (see WithLock); null runs merges without a lock. */
  lock: string | null;
  /** Shell commands run from the main checkout before the worktree is removed; one failing stops the finish. */
  beforeRemove: string[];
  /** After the branch merged into its --base; a failure is reported only. */
  afterMerge: string[];
  /** After the worktree is removed; a failure is reported only. */
  afterRemove: string[];
}

export interface DriveConfig {
  worktree: WorktreeConfig;
}

export const DEFAULTS: WorktreeConfig = {
  dir: '.worktrees',
  baseBranch: 'main',
  remote: 'origin',
  invoke: 'drive worktree',
  install: [],
  preflight: null,
  lock: null,
  beforeRemove: [],
  afterMerge: [],
  afterRemove: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCommandList = (value: unknown): boolean =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
const isText = (value: unknown): boolean => typeof value === 'string' && value !== '';

const KEYS = Object.keys(DEFAULTS) as (keyof WorktreeConfig)[];

/** What is wrong with one key's value, or null; an absent key takes its default. */
function problem(key: keyof WorktreeConfig, value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (Array.isArray(DEFAULTS[key]))
    return isCommandList(value) ? null : `worktree.${key} must be a list of shell commands`;
  return isText(value) ? null : `worktree.${key} must be a non-empty string`;
}

/** The `worktree` section as a config, or the first thing wrong with it. */
function readWorktree(section: Record<string, unknown>): WorktreeConfig | { error: string } {
  const unknown = Object.keys(section).find((key) => !(KEYS as string[]).includes(key));
  if (unknown !== undefined)
    return {
      error: `unknown worktree key '${unknown}'; expected ${KEYS.join(', ')}`,
    };
  const wrong = KEYS.map((key) => problem(key, section[key])).find((message) => message !== null);
  if (wrong !== undefined && wrong !== null) return { error: wrong };
  return {
    ...DEFAULTS,
    ...Object.fromEntries(Object.entries(section).filter(([, value]) => value != null)),
  };
}

/** Parses the text of the config file; an empty file or a missing `worktree` section gives the defaults. */
export function parseConfig(text: string): DriveConfig | { error: string } {
  let doc: unknown;
  try {
    doc = parse(text);
  } catch (error) {
    return {
      error: `${CONFIG_PATH} is not valid YAML: ${(error as Error).message}`,
    };
  }
  const root = doc ?? {};
  if (!isRecord(root)) return { error: `${CONFIG_PATH} must be a mapping` };
  const section = root.worktree ?? {};
  if (!isRecord(section)) return { error: `worktree in ${CONFIG_PATH} must be a mapping` };
  const worktree = readWorktree(section);
  return 'error' in worktree ? worktree : { worktree };
}
