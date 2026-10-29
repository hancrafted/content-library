import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from './clipboard';

/*
 * The one clipboard copy a prompt box hands its Copy button (a Guide's troubleshooting prompt, the human-in-the-loop
 * Explorable): it answers whether the clipboard took the text, so the button confirms only a real copy.
 */

afterEach(() => vi.unstubAllGlobals());

/** A browser whose clipboard keeps what it is given, or refuses every write. */
function stubClipboard(refuses = false): string[] {
  const kept: string[] = [];
  const writeText = (text: string) =>
    refuses ? Promise.reject(new Error('denied')) : (kept.push(text), Promise.resolve());
  vi.stubGlobal('navigator', { clipboard: { writeText } });
  return kept;
}

describe('success cases', () => {
  it('puts the text on the clipboard and answers true', async () => {
    // ARRANGE
    const kept = stubClipboard();
    // ACT
    const ok = await copyText('Fix the PATH');
    // ASSERT
    expect([ok, kept]).toEqual([true, ['Fix the PATH']]);
  });
});

describe('failure cases', () => {
  it('answers false when the browser refuses the write', async () => {
    // ARRANGE
    stubClipboard(true);
    // ACT
    const ok = await copyText('Fix the PATH');
    // ASSERT
    expect(ok).toBe(false);
  });
});

describe('edge cases', () => {
  it('answers false where the browser has no clipboard at all', async () => {
    // ARRANGE
    vi.stubGlobal('navigator', {});
    // ACT
    const ok = await copyText('Fix the PATH');
    // ASSERT
    expect(ok).toBe(false);
  });
});
