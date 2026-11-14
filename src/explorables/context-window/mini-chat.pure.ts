import type { Block, Category, Chat, Step } from './context.types';

/* A static bar's chat written as block rows in the config, turned into steps. Pure. */

const MINI_STEP: Readonly<Partial<Record<Category, (id: string, blocks: Block[]) => Step>>> = {
  memory: (id, blocks) => ({ id, kind: 'memory', path: 'CLAUDE.md', blocks }),
  tool_use: (id, blocks) => ({ id, kind: 'tool', calls: [], blocks }),
  tool_result: (id, blocks) => ({ id, kind: 'tool', calls: [], blocks }),
  assistant: (id, blocks) => ({ id, kind: 'ai', text: '', blocks }),
};

/**
 * A mini chat: the starting instructions (unless left out), then one step per block row. A tool call and the result
 * right after it share one step; a result after a result is a step of its own.
 */
export function blocksChat(id: string, start: Step | null, rows: readonly [Category, number][]): Chat {
  const steps: Step[] = start ? [start] : [];
  rows.forEach(([cat, tokens], i) => {
    const previous = steps.at(-1);
    if (cat === 'tool_result' && previous?.kind === 'tool' && previous.blocks.at(-1)?.cat === 'tool_use') {
      steps[steps.length - 1] = { ...previous, blocks: [...previous.blocks, { cat, tokens }] };
      return;
    }
    const make =
      MINI_STEP[cat] ?? ((sid: string, blocks: Block[]): Step => ({ id: sid, kind: 'you', text: '', blocks }));
    steps.push(make(`${id}-${i + 1}`, [{ cat, tokens }]));
  });
  return { id, steps };
}
