// SubagentStart / SubagentStop hook (`claude-adapter.ts start|stop`): a plugin over the core writer. It acts only
// when some worktree's `.scratch/active-run` lists the hook's session; otherwise it prints nothing and exits 0, so
// a retro or review session never touches a run's log. The mapping lives in claude-adapter.pure.ts; the line is
// written by run-log-writer.ts, which owns the shape, the clock, the lock and the sequence.
// A lock timeout is the one failure it reports: a line on stderr and exit 1, which Claude Code does not treat as
// blocking (exit 2 would block SubagentStop).
import { readFileSync } from 'node:fs';
import { agentModel } from './agent-definition.ts';
import { adaptSubagent, subagentFiles, type HookPayload } from './claude-adapter.pure.ts';
import { readOrNull as read, readLog } from './episode-run-log.ts';
import { LockTimeoutError, appendEvent } from './run-log-writer.ts';
import { findRun } from './run-root.ts';

function main(): void {
  const event = process.argv[2] === 'stop' ? 'stop' : 'start';
  const payload = JSON.parse(readFileSync(0, 'utf8')) as HookPayload;
  const run = findRun(payload.cwd ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), payload.session_id);
  if (run === null) return;
  const { root, marker } = run;
  const files = subagentFiles(payload);
  const line = adaptSubagent({
    event,
    payload,
    marker: run.text,
    meta: read(files.meta),
    transcript: read(files.transcript),
    log: readLog(marker.log, root).lines,
    agentModel: agentModel(root, payload.agent_type),
  });
  if (line === null) return;
  appendEvent({ root, file: marker.log }, line);
}

try {
  main();
} catch (error) {
  if (error instanceof LockTimeoutError) {
    process.stderr.write(`new-episode adapter: ${error.message}\n`);
    process.exitCode = 1;
  }
  // Any other failure: a hook must never fail the session or the run, so the line is simply missing.
}
