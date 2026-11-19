import { readFileSync } from 'node:fs';
import { type HookPayload, isHookMode, subagentEntry } from './claude-adapter.pure.ts';
import { appendLog, branchOf } from './log.ts';

const mode = process.argv[2];
try {
  if (isHookMode(mode)) {
    const payload = JSON.parse(readFileSync(0, 'utf8')) as HookPayload;
    const cwd = payload.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
    const branch = branchOf(cwd);
    appendLog(cwd, branch, subagentEntry(mode, payload, { branch, now: new Date() }));
  }
} catch {
  process.exitCode = 0;
}
