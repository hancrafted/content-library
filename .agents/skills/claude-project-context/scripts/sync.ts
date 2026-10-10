// Rebuilds docs/claude-project-context/ from assets/files.md. The judgement
// lives in plan.pure.ts; this file reads the list and touches the filesystem.
import { execFileSync } from 'node:child_process';
import { globSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import { parseList, planLinks } from './plan.pure.ts';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const folder = path.join(root, 'docs', 'claude-project-context');
const list = path.join(root, '.agents', 'skills', 'claude-project-context', 'assets', 'files.md');

const files = parseList(readFileSync(list, 'utf8'))
  .flatMap((entry) => globSync(entry, { cwd: root }).sort())
  .filter((file) => lstatSync(path.join(root, file)).isFile());

const plan = planLinks(
  files.map((file) => path.join(root, file)),
  folder,
);

mkdirSync(folder, { recursive: true });
for (const entry of readdirSync(folder)) rmSync(path.join(folder, entry), { recursive: true, force: true });
for (const link of plan) symlinkSync(link.target, path.join(folder, link.name));

console.log(`✔ claude-project-context: ${plan.length} links in docs/claude-project-context/`);
