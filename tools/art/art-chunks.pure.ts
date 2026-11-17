// decision: FE-005 §5
import { bakeArt } from './art-bake.pure.ts';
import type { ArtPiece } from './art-store.pure.ts';
import type { CssRule } from './css-rules.pure.ts';

export interface RenderedSlide {
  readonly page: string;
  readonly markup: string;
}

export interface BakedChunk {
  readonly pieces: readonly ArtPiece[];
  readonly refusals: readonly (readonly [message: string, page: string])[];
}

export type Chunk = readonly RenderedSlide[];

export interface BakeRequest {
  readonly id: number;
  readonly slides: Chunk;
}
export interface BakeResponse {
  readonly id: number;
  readonly baked: BakedChunk;
}

export function bakeChunk(slides: Chunk, rules: readonly CssRule[]): BakedChunk {
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

export function chunksOf<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let at = 0; at < items.length; at += size) chunks.push(items.slice(at, at + size));
  return chunks;
}

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
