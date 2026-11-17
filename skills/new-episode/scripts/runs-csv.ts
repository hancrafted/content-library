import { writeFileSync } from 'node:fs';
import { readOrNull, readRuns } from '../../../src/pipeline/lib/episode-run-log.ts';
import { runsCsv } from '../../../src/pipeline/lib/run-query.pure.ts';

const OUT = 'docs/episodes/runs.csv';
const { sources, files, errors } = readRuns(process.argv.slice(2));
for (const error of errors) console.error(`! ${error}`);
if (files.length === 0) {
  console.error('✖ no run logs found; run this from the repo root, or pass a path or glob.');
  process.exit(1);
}
writeFileSync(OUT, runsCsv(sources, readOrNull(OUT) ?? ''));
console.log(`wrote ${OUT} from ${files.length} log(s)`);
