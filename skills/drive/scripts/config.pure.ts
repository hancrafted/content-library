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

/** How many Subagents run at once: the project's default, and the harness's own cap recorded beside it. */
export interface ParallelConfig {
  default: number;
  /** What the agent harness allows; `drive` only records it and never writes harness settings. */
  harnessCap: number;
}

export interface DriveConfig {
  worktree: WorktreeConfig;
  parallel: ParallelConfig;
  /** Paths or globs of the Decision docs, which change only on a `decisions/*` branch. */
  decisionDocs: string[];
}

export const PARALLEL_DEFAULTS: ParallelConfig = { default: 3, harnessCap: 20 };

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
  return readProject(root);
}

/** The config's sections, or the first thing wrong with them. */
function readProject(root: Record<string, unknown>): DriveConfig | { error: string } {
  const section = root.worktree ?? {};
  if (!isRecord(section)) return { error: `worktree in ${CONFIG_PATH} must be a mapping` };
  const worktree = readWorktree(section);
  if ('error' in worktree) return worktree;
  const parallel = readParallel(root.parallel);
  if ('error' in parallel) return parallel;
  const docs = root.decisionDocs ?? [];
  if (!isCommandList(docs)) return { error: 'decisionDocs must be a list of paths' };
  return { worktree, parallel, decisionDocs: docs as string[] };
}

const isCount = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 1;

/** The `parallel` section with its defaults filled, or the first thing wrong with it. */
function readParallel(section: unknown): ParallelConfig | { error: string } {
  if (section === undefined || section === null) return PARALLEL_DEFAULTS;
  if (!isRecord(section)) return { error: 'parallel in ' + CONFIG_PATH + ' must be a mapping' };
  const unknown = Object.keys(section).find((key) => key !== 'default' && key !== 'harnessCap');
  if (unknown !== undefined) return { error: `unknown parallel key '${unknown}'; expected default, harnessCap` };
  const merged = { ...PARALLEL_DEFAULTS, ...Object.fromEntries(Object.entries(section).filter(([, v]) => v != null)) };
  if (!isCount(merged.default)) return { error: 'parallel.default must be a whole number of at least 1' };
  if (!isCount(merged.harnessCap)) return { error: 'parallel.harnessCap must be a whole number of at least 1' };
  return merged;
}
