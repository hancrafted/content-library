// `npm run episode:runs-csv -- [log.jsonl|glob ...]`: regenerates docs/episodes/runs.csv from the run logs (live and
// archived by default), one row per agent span. The CSV is a report over the logs; never edit it by hand.
import { writeFileSync } from 'node:fs';
import { readLogs } from './read-logs.ts';
import { runsCsv } from './run-query.pure.ts';

const OUT = 'docs/episodes/runs.csv';
const { sources, files } = readLogs(process.argv.slice(2));
if (files.length === 0) {
  console.error('✖ no run logs found; run this from the repo root, or pass a path or glob.');
  process.exit(1);
}
writeFileSync(OUT, runsCsv(sources));
console.log(`wrote ${OUT} from ${files.length} log(s)`);
