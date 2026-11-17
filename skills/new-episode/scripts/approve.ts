import { readFileSync, writeFileSync } from 'node:fs';
import { utcSeconds } from '../../../src/pipeline/lib/staging-file.pure.ts';
import { approveText, parseApproveArgs } from '../../../src/pipeline/lib/verified.pure.ts';

const USAGE =
  '✖ usage: node skills/new-episode/scripts/approve.ts <file> [--by <human:id|process:id>] [--stamp <producer/model>]';
const args = parseApproveArgs(process.argv.slice(2));
if (typeof args === 'string') {
  console.error(`${args}\n${USAGE}`);
  process.exit(1);
}
const at = utcSeconds(new Date());
try {
  writeFileSync(
    args.file,
    approveText(args.file, readFileSync(args.file, 'utf8'), { by: args.by, at, stamp: args.stamp }),
  );
} catch (error) {
  console.error(`✖ ${args.file}: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
console.log(`✔ ${args.file}: verified by ${args.by} at ${at}`);
