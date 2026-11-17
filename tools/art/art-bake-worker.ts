import { parentPort, workerData } from 'node:worker_threads';
import { bakeChunk, type BakeRequest, type BakeResponse } from './art-chunks.pure.ts';
import type { CssRule } from './css-rules.pure.ts';

const rules = workerData as readonly CssRule[];
parentPort?.on('message', ({ id, slides }: BakeRequest) => {
  parentPort?.postMessage({ id, baked: bakeChunk(slides, rules) } satisfies BakeResponse);
});
