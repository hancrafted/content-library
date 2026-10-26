// `node tools/demo/dashboard-demo.ts <run folder> <repository root>`: writes the public copy of a recorded Run, its
// pipeline.yml and events.jsonl, to public/dashboard-demo/, which the dashboard's demo replays (dashboard-demo.pure.ts).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { demoClock, publicDemoEvents, publicDemoPipeline } from '../../src/pipeline/lib/dashboard-demo.pure.ts';

const [folder, repo] = process.argv.slice(2);
if (!folder || !repo) {
  console.error('usage: node tools/demo/dashboard-demo.ts <run folder> <repository root>');
  process.exit(1);
}
const target = join(import.meta.dirname, '..', '..', 'public', 'dashboard-demo');
const events = publicDemoEvents(readFileSync(join(folder, 'events.jsonl'), 'utf8'), repo.replace(/\/$/, ''));
// The dashboard stops the demo's clock at the last event; refuse a copy it could not open.
demoClock(events);
mkdirSync(target, { recursive: true });
writeFileSync(join(target, 'events.jsonl'), events);
writeFileSync(join(target, 'pipeline.yml'), publicDemoPipeline(readFileSync(join(folder, 'pipeline.yml'), 'utf8')));
console.log(`wrote ${target}`);
