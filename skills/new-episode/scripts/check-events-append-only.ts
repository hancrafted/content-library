// `npm run check:events`: refuses a staged change that removes lines from an Episode's `events.jsonl`.
// Wired into `verify:commit`; exits 1 and names each file.
import { execFileSync } from 'node:child_process';
import { eventLogDeletions } from './events-append-only.pure.ts';

const staged = execFileSync('git', ['diff', '--cached', '-U0', '--no-color', '--no-ext-diff'], {
  encoding: 'utf8',
  maxBuffer: 256 * 1024 * 1024,
});
const offenders = eventLogDeletions(staged);
if (offenders.length > 0) {
  for (const file of offenders) console.error(`✖ ${file}: the event log is append-only; this commit deletes lines`);
  process.exit(1);
}
