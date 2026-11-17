import { describe, expect, it } from 'vitest';
import { copyText, type TextClipboard } from './clipboard';

function keepingClipboard(): TextClipboard & { kept: string[] } {
  const kept: string[] = [];
  return { kept, writeText: async (text) => void kept.push(text) };
}

const REFUSING: TextClipboard = { writeText: () => Promise.reject(new Error('denied')) };

describe('success cases', () => {
  it('puts the text on the clipboard and answers true', async () => {
    // ARRANGE
    const clipboard = keepingClipboard();
    // ACT
    const ok = await copyText('Fix the PATH', clipboard);
    // ASSERT
    expect([ok, clipboard.kept]).toEqual([true, ['Fix the PATH']]);
  });
});

describe('failure cases', () => {
  it('answers false when the browser refuses the write', async () => {
    // ARRANGE
    const clipboard = REFUSING;
    // ACT
    const ok = await copyText('Fix the PATH', clipboard);
    // ASSERT
    expect(ok).toBe(false);
  });
});

describe('edge cases', () => {
  it('answers false where the browser has no clipboard at all', async () => {
    // ARRANGE
    const clipboard = null;
    // ACT
    const ok = await copyText('Fix the PATH', clipboard);
    // ASSERT
    expect(ok).toBe(false);
  });
});
