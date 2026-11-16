// The bake's unit of parallel work (FE-005 §5): `npm run art` cuts the rendered Slides into chunks, bakes each in
// a worker thread and merges the results here in Slide order, so the pieces, and the first Slide a refusal names,
// are those of a one-worker bake whatever the worker count.
import { bakeArt } from './art-bake.pure.ts';
import type { ArtPiece } from './art-store.pure.ts';
import type { CssRule } from './css-rules.pure.ts';

/** One rendered Slide: where it comes from, and its markup. */
export interface RenderedSlide {
  readonly page: string;
  readonly markup: string;
}

/** What baking one chunk yields: its drawings in Slide order, and each refusal with the Slide it came from. */
export interface BakedChunk {
  readonly pieces: readonly ArtPiece[];
  readonly refusals: readonly (readonly [message: string, page: string])[];
}

/** Bakes each Slide of a chunk; a Slide the bake refuses is recorded, not thrown, so the merge can report all at once. */
export function bakeChunk(slides: readonly RenderedSlide[], rules: readonly CssRule[]): BakedChunk {
  const pieces: ArtPiece[] = [];
  const refusals: [string, string][] = [];
  for (const { page, markup } of slides) {
    try {
      pieces.push(...bakeArt(markup, rules).map((piece) => ({ ...piece, from: page })));
    } catch (error) {
      refusals.push([(error as Error).message, page]);
    }
  }
  return { pieces, refusals };
}

/** Contiguous chunks of at most `size` Slides, in order. */
export function chunksOf<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let at = 0; at < items.length; at += size) chunks.push(items.slice(at, at + size));
  return chunks;
}

/** The chunks' pieces in order; every refusal reported once, naming the first Slide it came from. */
export function mergeChunks(chunks: readonly BakedChunk[]): ArtPiece[] {
  const refusals = new Map<string, string>();
  for (const [message, page] of chunks.flatMap((chunk) => chunk.refusals)) {
    if (!refusals.has(message)) refusals.set(message, page);
  }
  if (refusals.size > 0) {
    const lines = [...refusals].map(([message, page]) => `- ${page}: ${message}`);
    throw new Error(`npm run art refused ${refusals.size} drawings:\n${lines.join('\n')}`);
  }
  return chunks.flatMap((chunk) => [...chunk.pieces]);
}
