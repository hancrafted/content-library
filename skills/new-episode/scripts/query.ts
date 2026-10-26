// `npm run episode:query -- "<sql>" [log.jsonl|glob ...]`: runs one SELECT over the `spans` and `scores` tables of
// one or many run logs and prints the rows as JSON lines. Both tables carry `episode`; `spans` also carries
// `run_id` on the Run's own row, so join on `trace_id` to tag any span with its Run. Nothing is printed beyond the
// selected columns. Columns: see the Run query section of the new-episode SKILL.md. The logic lives in
// run-query.pure.ts; this file only reads the disk.
import { readRuns } from '../../../src/pipeline/lib/episode-run-log.ts';
import { queryRuns } from '../../../src/pipeline/lib/run-query.pure.ts';

const [sql, ...patterns] = process.argv.slice(2);
if (!sql) {
  console.error('✖ usage: npm run episode:query -- "<sql>" [log.jsonl|glob ...]');
  process.exit(1);
}
const { sources, files, errors } = readRuns(patterns);
for (const error of errors) console.error(`! ${error}`);
if (files.length === 0) console.error('! no run logs found; pass a path or glob, or run from the repo root.');
const result = queryRuns(sources, sql);
if (!result.ok) {
  console.error(`✖ ${result.error}`);
  process.exit(1);
}
for (const row of result.rows) console.log(JSON.stringify(row));
