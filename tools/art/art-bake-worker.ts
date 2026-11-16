// A worker thread of `npm run art`: bakes the chunks of rendered Slides the main thread sends, with the CSS rules it
// was started with. It needs no Vite server; the main thread has already rendered the markup.
import { parentPort, workerData } from 'node:worker_threads';
import { bakeChunk, type RenderedSlide } from './art-chunks.pure.ts';
import type { CssRule } from './css-rules.pure.ts';

const rules = workerData as readonly CssRule[];
parentPort?.on('message', ({ id, slides }: { id: number; slides: RenderedSlide[] }) => {
  parentPort?.postMessage({ id, baked: bakeChunk(slides, rules) });
});
