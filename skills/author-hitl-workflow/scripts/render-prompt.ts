// `node skills/author-hitl-workflow/scripts/render-prompt.ts <workflow.yml> <job> [options] [<marker>=<file>...]`:
// prints one prompt of a Workflow file exactly as the page copies it (debug footer left out), so a local run
// pastes the same text a viewer would. Options: --review (the review step), --full (a full run, not demo),
// --level=chat|cli (the chat prompt, the default, or the CLI one), --round=<n>:<item-file> (round n of a repeated stage, its H3 block).
// Each <marker>=<file> fills a slot with a file's text: idea=idea.md, note_1=a.md, verdict_result#2=v.md.
// Exits 1 with every problem on stderr.
import { readFileSync } from 'node:fs';
import type { RenderRequest } from '../../../src/explorable-explanations/human-in-the-loop/workflow.node.ts';
import { LEVEL_OF, renderPrompt } from '../../../src/explorable-explanations/human-in-the-loop/workflow.node.ts';

type Options = Omit<RenderRequest, 'job' | 'values'>;
const read = (path: string): string => readFileSync(path, 'utf8').trim();

/** Each flag, and the request field its value sets. */
const FLAGS: Readonly<Record<string, (value: string) => Options>> = {
  '--review': () => ({ step: 'review' }),
  '--full': () => ({ demo: false }),
  '--level': (value) => {
    const level = Object.hasOwn(LEVEL_OF, value) ? LEVEL_OF[value] : undefined;
    if (level === undefined) throw new Error(`--level reads chat or cli, got "${value}".`);
    return { level };
  },
  '--round': (value) => {
    const [n = '', file = ''] = value.split(/:(.*)/s);
    if (!/^[1-9]\d*$/.test(n) || file === '') throw new Error(`--round needs <n>:<item-file>, got "${value}".`);
    return { round: { number: Number(n), item: read(file) } };
  },
};

/** One `--flag` or `--flag=value` as the request field it sets, or none for an unknown flag. */
function optionOf(arg: string): Options | undefined {
  const [flag = '', value = ''] = arg.split(/=(.*)/s);
  return FLAGS[flag]?.(value);
}

function requestOf(job: string, args: readonly string[]): RenderRequest {
  const values: Record<string, string> = {};
  let options: Options = {};
  for (const arg of args) {
    if (!arg.startsWith('--')) {
      const [key = '', file = ''] = arg.split(/=(.*)/s);
      values[key] = read(file);
      continue;
    }
    const option = optionOf(arg);
    if (option === undefined) throw new Error(`Unknown argument: ${arg}`);
    options = { ...options, ...option };
  }
  return { job, values, ...options };
}

const [file, job, ...args] = process.argv.slice(2);
if (file === undefined || job === undefined) {
  console.error(
    '✖ usage: render-prompt.ts <workflow.yml> <job> [--review] [--full] [--level=chat|cli] [--round=<n>:<item-file>] [<marker>=<file>...]',
  );
  process.exit(1);
}
try {
  const result = renderPrompt(readFileSync(file, 'utf8'), requestOf(job, args));
  if ('problems' in result) {
    console.error(result.problems.map((problem) => `✖ ${problem}`).join('\n'));
    process.exit(1);
  }
  process.stdout.write(`${result.text}\n`);
} catch (error) {
  console.error(`✖ ${(error as Error).message}`);
  process.exit(1);
}
