// `node skills/author-hitl-workflow/scripts/parse-debug-footer.ts <reply.md> [<en.yml> <de.yml>]`: reads the
// `[hitl-debug]` footer a viewer's pasted reply ends with and prints where it came from as JSON: the Workflow, stage,
// job, round, step, level, demo mode, locale and source hash. `changed` says whether the Workflow pair (by default the
// repo's `<id>.en.yml` and `<id>.de.yml`) has changed since the reply; it is left out for an uploaded Workflow.
// Exits 1 when the reply has no readable footer.
import { existsSync, readFileSync } from 'node:fs';
import { parseDebugFooter, sourceOf } from '../../../src/explorables/human-in-the-loop/workflow.node.ts';

const AREA = 'src/explorables/human-in-the-loop';

const [file, english, german] = process.argv.slice(2);
if (file === undefined) {
  console.error('✖ usage: parse-debug-footer.ts <reply.md> [<en.yml> <de.yml>]');
  process.exit(1);
}
const read = parseDebugFooter(readFileSync(file, 'utf8'));
if ('problems' in read) {
  console.error(read.problems.map((problem) => `✖ ${problem}`).join('\n'));
  process.exit(1);
}
const { id } = read.scope.workflow;
const pair = [english ?? `${AREA}/${id}.en.yml`, german ?? `${AREA}/${id}.de.yml`] as const;
const changed = pair.every(existsSync)
  ? { changed: sourceOf(readFileSync(pair[0], 'utf8'), readFileSync(pair[1], 'utf8')) !== read.scope.source }
  : {};
process.stdout.write(`${JSON.stringify({ ...read, ...changed }, null, 2)}\n`);
