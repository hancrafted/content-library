// `npm run ecology:sim -- <use-case> <scenario> [--seed n | --seeds n] [--json]`: judges a software ecology scenario's
// beats headless, across seeds (ten by default), with no rendering, and prints each beat's per-seed readings, their
// means and its verdict, or the verdict as JSON. Exits 1 on a failing beat or a bad call (design-ADR 0024 §12, §20).
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
