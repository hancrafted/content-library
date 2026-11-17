// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import { readFileSync } from 'node:fs';
import { formatVerdict, parseSimArgs, simulate } from '../../src/explorables/software-ecology/ecology-sim.node.ts';

const FOLDER = new URL('../../src/explorables/software-ecology/', import.meta.url);
const read = (name: string): string => readFileSync(new URL(name, FOLDER), 'utf8');

try {
  const options = parseSimArgs(process.argv.slice(2));
  const run = simulate(options, read);
  console.log(options.json ? JSON.stringify(run, null, 2) : formatVerdict(run));
  if (!run.verdict.ok) process.exitCode = 1;
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
