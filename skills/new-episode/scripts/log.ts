// `npm run episode:log -- <slug> '<event json>'` (or the JSON on stdin): validates one event, stamps it (clock,
// sequence, ids, and for start-run the template sha, branch and run id) and appends one line to the Episode's
// events.jsonl under a lock, so concurrent writers never interleave. Prints the written line; a start's
// `span_id` in it is what the caller passes as `parent_span_id` or `span_id` later. Stamping and
// locking live in src/pipeline/lib/run-log-writer.ts; this file only parses argv.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { episodeLogPath } from '../../../src/pipeline/lib/episode-run-log.ts';
import { appendEvent } from '../../../src/pipeline/lib/run-log-writer.ts';

function main(): void {
  const slug = process.argv[2];
  if (!slug) throw new Error("usage: npm run episode:log -- <slug> '<event json>'   (or the JSON on stdin)");
  const file = episodeLogPath(slug);
  const folder = path.dirname(file);
  if (!existsSync(folder)) throw new Error(`${folder} does not exist; run this from the Episode's worktree root.`);
  const event: unknown = JSON.parse(process.argv[3] ?? readFileSync(0, 'utf8'));
  const result = appendEvent({ root: '.', file }, event);
  if (!result.ok)
    throw new Error(
      result.errors
        .map((e) => `  ${e}`)
        .join('\n')
        .trimStart(),
    );
  console.log(result.line);
}

try {
  main();
} catch (error) {
  console.error(`✖ ${error instanceof SyntaxError ? 'the event is not valid JSON' : (error as Error).message}`);
  process.exitCode = 1;
}
