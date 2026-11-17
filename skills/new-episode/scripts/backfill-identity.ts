import { identityBackfill } from '../../../src/pipeline/lib/backfill-identity.pure.ts';
import { readLog, readOrNull } from '../../../src/pipeline/lib/episode-run-log.ts';
import { appendEvent } from '../../../src/pipeline/lib/run-log-writer.ts';

function summary(events: readonly { role?: string }[], elsewhere: number, write: boolean): string {
  const roles = new Map<string, number>();
  for (const e of events) roles.set(String(e.role), (roles.get(String(e.role)) ?? 0) + 1);
  const by = [...roles].map(([role, n]) => `${role} ${n}`).join(', ');
  const older = elsewhere > 0 ? `; ${elsewhere} span(s) of an older Run left alone` : '';
  return `${write ? 'appended' : 'would append'} ${events.length} attrs line(s)${by === '' ? '' : ` (${by})`}${older}${write ? '' : '; dry run, pass --write to append'}`;
}

function main(): void {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const [file, ...extra] = args.filter((a) => a !== '--write');
  if (file === undefined || extra.length > 0)
    throw new Error('usage: npm run episode:backfill-identity -- <log.jsonl> [--write]');
  const { lines, errors } = readLog(file);
  if (errors.length > 0) throw new Error(errors.join('\n'));
  const { events, elsewhere } = identityBackfill(lines, readOrNull);
  for (const e of events) {
    const result = write ? appendEvent({ root: '.', file }, e) : { ok: true as const };
    if (!result.ok) throw new Error(result.errors.join('\n'));
    console.log(JSON.stringify(e));
  }
  console.log(summary(events, elsewhere, write));
}

try {
  main();
} catch (error) {
  console.error(`✖ ${(error as Error).message}`);
  process.exitCode = 1;
}
