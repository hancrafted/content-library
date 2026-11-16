// Bakes chunks of Slides across worker threads, each chunk to the next free worker; results come back by chunk
// index, so the order the workers finish in never reaches the merge.
import { Worker } from 'node:worker_threads';
import type { BakedChunk, RenderedSlide } from './art-chunks.pure.ts';
import type { CssRule } from './css-rules.pure.ts';

export async function bakeInWorkers(
  chunks: readonly (readonly RenderedSlide[])[],
  rules: readonly CssRule[],
  workers: number,
): Promise<BakedChunk[]> {
  const baked: BakedChunk[] = new Array(chunks.length);
  let next = 0;
  const pool = Array.from({ length: Math.min(workers, chunks.length) }, () => {
    const worker = new Worker(new URL('./art-bake-worker.ts', import.meta.url), { workerData: rules });
    return new Promise<void>((resolve, reject) => {
      const feed = () => {
        if (next >= chunks.length) return void worker.terminate().then(() => resolve());
        const id = next++;
        worker.postMessage({ id, slides: chunks[id] });
      };
      worker.on('message', ({ id, baked: result }: { id: number; baked: BakedChunk }) => {
        baked[id] = result;
        feed();
      });
      worker.on('error', reject);
      feed();
    });
  });
  await Promise.all(pool);
  return baked;
}
