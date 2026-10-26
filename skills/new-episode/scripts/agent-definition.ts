// Finds the definition of a Claude Code agent type and reads its `model`: `.claude/agents/<type>.md` in the run's
// worktree or in the home `.claude`, else `agents/<type>.md` inside an installed plugin. A `plugin:agent` type is
// looked up by its agent name.
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { frontmatterModel } from '../../../src/pipeline/lib/agent-definition.pure.ts';
import { readOrNull } from '../../../src/pipeline/lib/episode-run-log.ts';

const MAX_DEPTH = 6;
const SKIPPED = new Set(['node_modules', '.git']);

/** `agents/<name>.md` under every `agents` directory below `dir`. */
function pluginAgentFiles(dir: string, name: string, depth = 0): string[] {
  if (depth > MAX_DEPTH || !existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !SKIPPED.has(entry.name))
    .flatMap((entry) =>
      entry.name === 'agents'
        ? [path.join(dir, entry.name, `${name}.md`)]
        : pluginAgentFiles(path.join(dir, entry.name), name, depth + 1),
    );
}

/** The model the agent type's definition asks for, undefined when no definition names one. */
export function agentModel(root: string, agentType: string | undefined): string | undefined {
  const name = agentType?.split(':').at(-1) ?? '';
  if (!/^[\w.-]+$/.test(name)) return undefined;
  const claude = path.join(homedir(), '.claude');
  const files = [
    path.join(root, '.claude/agents', `${name}.md`),
    path.join(claude, 'agents', `${name}.md`),
    ...pluginAgentFiles(path.join(claude, 'plugins'), name),
  ];
  return files.map((file) => frontmatterModel(readOrNull(file))).find((model) => model !== undefined);
}
