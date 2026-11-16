import { describe, expect, it } from 'vitest';
import { bakeChunk, chunksOf, mergeChunks } from './art-chunks.pure.ts';

describe('success cases', () => {
  it('cuts items into contiguous chunks that rejoin in order', () => {
    // ARRANGE
    const items = [1, 2, 3, 4, 5];
    const size = 2;
    // ACT
    const chunks = chunksOf(items, size);
    // ASSERT
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunks.flat()).toEqual(items);
  });

  it('merges the pieces of each chunk in chunk order', () => {
    // ARRANGE
    const chunk = (name: string) => ({ pieces: [{ name, body: '<g/>' }], refusals: [] });
    // ACT
    const pieces = mergeChunks([chunk('a'), chunk('b')]);
    // ASSERT
    expect(pieces.map((piece) => piece.name)).toEqual(['a', 'b']);
  });
});

describe('failure cases', () => {
  it('reports a refusal once, naming the first Slide of the first chunk that met it', () => {
    // ARRANGE
    const refused = (page: string) => ({ pieces: [], refusals: [['no text', page]] as const });
    // ACT
    const merge = () => mergeChunks([refused('slide-a'), refused('slide-b')]);
    // ASSERT
    expect(merge).toThrow(/refused 1 drawings:\n- slide-a: no text/);
  });

  it('records a Slide whose markup the bake refuses, instead of throwing', () => {
    // ARRANGE
    const slides = [{ page: 'slide-a', markup: '<g data-art-source="x"><text>hi</text></g>' }];
    // ACT
    const baked = bakeChunk(slides, []);
    // ASSERT
    expect(baked.refusals.map(([, page]) => page)).toEqual(['slide-a']);
  });
});

describe('edge cases', () => {
  it('yields no chunks for no items', () => {
    // ARRANGE
    const none: number[] = [];
    // ACT
    const chunks = chunksOf(none, 3);
    // ASSERT
    expect(chunks).toEqual([]);
  });
});
