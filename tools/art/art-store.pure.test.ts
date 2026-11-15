import { describe, expect, it } from 'vitest';
import { artStore } from './art-store.pure.ts';

describe('success cases', () => {
  it('stores identical drawings once, under every name that draws them', () => {
    // ARRANGE
    const body = '<path d="M0 0" fill="var(--x)"/>';
    const pieces = [
      { name: 'slide-a/room', body },
      { name: 'slide-b/room', body },
    ];
    const expectedFiles = 1;
    const url = /^\/art\/slide-a-room\.[0-9a-f]{10}\.svg#a$/;
    const file = `<svg xmlns="http://www.w3.org/2000/svg"><g id="a">${body}</g></svg>\n`;
    // ACT
    const store = artStore(pieces);
    // ASSERT
    expect(store.files).toHaveLength(expectedFiles);
    expect(store.manifest['slide-b/room']).toBe(store.manifest['slide-a/room']);
    expect(store.manifest['slide-a/room']).toMatch(url);
    expect(store.files[0]?.text).toBe(file);
  });
});

describe('failure cases', () => {
  it('keeps a name drawn two ways inline, naming where, since the page alone knows which drawing it means', () => {
    // ARRANGE
    const pieces = [
      { name: 'console/mug', body: '<path d="M0 0" fill="var(--console-house)"/>', from: 'slide-a' },
      { name: 'console/mug', body: '<path d="M0 0" fill="var(--art-house)"/>', from: 'slide-b' },
    ];
    const expected = { manifest: { 'console/mug': null }, files: [] };
    // ACT
    const store = artStore(pieces);
    // ASSERT
    expect({ manifest: store.manifest, files: store.files }).toEqual(expected);
    expect(store.inline[0]).toMatch(/console\/mug.*slide-a.*slide-b/);
  });
});

describe('edge cases', () => {
  it('gives a redrawn picture a new URL under the same name', () => {
    // ARRANGE
    const before = artStore([{ name: 'cloud/0', body: '<path d="M0 0"/>' }]);
    // ACT
    const after = artStore([{ name: 'cloud/0', body: '<path d="M0 1"/>' }]);
    // ASSERT
    expect(after.manifest['cloud/0']).not.toBe(before.manifest['cloud/0']);
  });
});
