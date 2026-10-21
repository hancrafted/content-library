// `npm run episode:harvest -- docs/episodes/<staging>`: renders `<staging>/harvest.json` into `<staging>/harvest.html`
// through the template in `assets/harvest-report.html`, and opens it. Exits 1 listing every problem the page would
// draw wrong. The page is Promotion's gate: the user keeps or strikes each card and pastes the decisions back.

import { execFile } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { harvestReport, type Harvest } from './harvest-report.pure.ts';

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
  // Formatted like every committed file, so the Staging commit that carries the page passes the format gate.
  const config = (await resolveConfig(out)) ?? {};
  writeFileSync(out, await format(page, { ...config, filepath: out }));
  writeFileSync(source, await format(JSON.stringify(harvest), { ...config, filepath: source }));
} catch (error) {
  console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
console.log(`wrote ${out}`);
if (process.platform === 'darwin') execFile('open', [out]);
