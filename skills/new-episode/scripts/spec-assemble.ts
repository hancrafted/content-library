// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { parseSpecAssembleArgs } from '../../../src/pipeline/lib/episode-forbid.pure.ts';
import { assembleSpecFolder } from '../../../src/pipeline/lib/spec-assemble.ts';

const parsed = parseSpecAssembleArgs(process.argv.slice(2));
if ('error' in parsed) {
  console.error(`✖ ${parsed.error}`);
  process.exit(1);
}
const report = await assembleSpecFolder({ episode: parsed.episode, forbid: parsed.forbid, now: new Date() });
for (const line of report.err) console.error(line);
for (const line of report.out) console.log(line);
process.exit(report.failed ? 1 : 0);
