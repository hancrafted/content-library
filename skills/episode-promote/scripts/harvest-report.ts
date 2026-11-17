import { execFile } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatAsRepo } from '../../../src/episodes/lib/oxfmt-format.ts';
import { harvestReport, type Harvest } from '../../../src/pipeline/lib/harvest-report.pure.ts';

const TEMPLATE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/harvest-report.html');
const staging = process.argv[2]?.replace(/\/$/, '');
const source = staging && path.join(staging, 'harvest.json');
if (!source || !existsSync(source)) {
  console.error('usage: npm run episode:harvest -- docs/episodes/<staging-folder>  (it must hold harvest.json)');
  process.exit(1);
}

const out = path.join(staging, 'harvest.html');
try {
  const harvest = JSON.parse(readFileSync(source, 'utf8')) as Harvest;
  const page = harvestReport(readFileSync(TEMPLATE, 'utf8'), harvest);
  writeFileSync(out, await formatAsRepo(out, page));
  writeFileSync(source, await formatAsRepo(source, JSON.stringify(harvest)));
} catch (error) {
  console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
console.log(`wrote ${out}`);
if (process.platform === 'darwin') execFile('open', [out]);
