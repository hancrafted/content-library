import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { formatReport } from './load-format.pure.ts';
import { analyzeLoad, type SessionLog } from './load.pure.ts';

const { values } = parseArgs({ options: { hours: { type: 'string', default: '24' } } });
const hours = Number(values.hours);
if (!Number.isFinite(hours) || hours <= 0) {
  console.error('usage: npm run retro:load [-- --hours <n>]');
  process.exit(2);
}
const until = new Date();
const window = { since: new Date(until.getTime() - hours * 3_600_000), until };

const commonDir = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
  encoding: 'utf8',
});
const project = path.dirname(commonDir.trim()).replace(/[^a-zA-Z0-9]/gu, '-');
const projects = path.join(process.env.CLAUDE_CONFIG_DIR ?? path.join(homedir(), '.claude'), 'projects');

const logs: SessionLog[] = readdirSync(projects)
  .filter((folder) => folder === project || folder.startsWith(`${project}-`))
  .flatMap((folder) =>
    readdirSync(path.join(projects, folder), { recursive: true, encoding: 'utf8' })
      .filter((file) => file.endsWith('.jsonl'))
      .map((file) => path.join(projects, folder, file)),
  )
  .filter((file) => statSync(file).mtime >= window.since)
  .map((file) => ({
    subagent: file.split(path.sep).includes('subagents'),
    lines: readFileSync(file, 'utf8').split('\n'),
  }));

console.log(formatReport(analyzeLoad(logs, window), window));
console.log(`\n${logs.length} logs read from ${projects}`);
