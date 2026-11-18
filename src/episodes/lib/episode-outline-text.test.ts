import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { layeredText } from './episode-outline-text.ts';

function rootWith(files: Record<string, unknown>): string {
  const root = mkdtempSync(path.join(tmpdir(), 'layers-'));
  for (const [file, json] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), JSON.stringify(json));
  }
  return root;
}

describe('success cases', () => {
  describe('layeredText', () => {
    it('lets a later layer override the keys it names and keeps the rest of the base', () => {
      // ARRANGE
      const root = rootWith({ 'base.json': { title: 'Base', caption: 'Kept' }, 'over.json': { title: 'Over' } });
      const layers = { en: ['base.json', 'over.json'], de: [] };
      const expected = { title: 'Over', caption: 'Kept' };
      // ACT
      const text = layeredText(root, layers, 'en');
      // ASSERT
      expect(text).toEqual(expected);
    });
  });
});

describe('failure cases', () => {
  describe('layeredText', () => {
    it('refuses a layer whose file is gone, naming it', () => {
      // ARRANGE
      const layers = { en: ['gone.json'], de: [] };
      // ACT
      const read = () => layeredText(rootWith({}), layers, 'en');
      // ASSERT
      expect(read).toThrow(/gone\.json/);
    });
  });
});

describe('edge cases', () => {
  describe('layeredText', () => {
    it('reads no layers as an empty text, as an Episode instance with no i18n has', () => {
      // ARRANGE
      const layers = { en: [], de: [] };
      // ACT
      const text = layeredText(rootWith({}), layers, 'de');
      // ASSERT
      expect(text).toEqual({});
    });
  });
});
