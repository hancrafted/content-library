// Bakes chunks of Slides across worker threads, each chunk to the next free worker; results come back by chunk
// index, so the order the workers finish in never reaches the merge.
import { Worker } from 'node:worker_threads';
import type { BakedChunk, RenderedSlide } from './art-chunks.pure.ts';
import type { CssRule } from './css-rules.pure.ts';

interface Queue {
  chunks: readonly (readonly RenderedSlide[])[];
  baked: BakedChunk[];
  next: number;
}

/** Feeds one worker chunks from the shared queue until it is empty; rejects if the worker fails or exits early. */
function drain(worker: Worker, queue: Queue) {
  return new Promise<void>((resolve, reject) => {
    let finished = false;
    const feed = () => {
      const id = queue.next++;
      if (id >= queue.chunks.length) {
        finished = true;
        return void worker.terminate().then(() => resolve());
      }
      worker.postMessage({ id, slides: queue.chunks[id] });
    };
    worker.on('message', ({ id, baked }: { id: number; baked: BakedChunk }) => {
      queue.baked[id] = baked;
      feed();
    });
    worker.on('error', reject);
    // A worker that dies mid-chunk (out of memory, process.exit) posts neither a result nor an error.
    worker.on('exit', (code) => {
      if (!finished) reject(new Error(`art bake worker exited with code ${code} before finishing its chunks`));
    });
    feed();
  });
}

export async function bakeInWorkers(
  chunks: readonly (readonly RenderedSlide[])[],
  rules: readonly CssRule[],
  workers: number,
): Promise<BakedChunk[]> {
  const queue: Queue = { chunks, baked: new Array(chunks.length), next: 0 };
  const started = Array.from(
    { length: Math.min(workers, chunks.length) },
    () => new Worker(new URL('./art-bake-worker.ts', import.meta.url), { workerData: rules }),
  );
  try {
    await Promise.all(started.map((worker) => drain(worker, queue)));
  } catch (error) {
    await Promise.all(started.map((worker) => worker.terminate()));
    throw error;
  }
  return queue.baked;
}
