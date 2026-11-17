import { describe, expect, it } from 'vitest';
import { setArtHrefs } from './art-href.pure';

function use(attributes: Record<string, string>) {
  const held = new Map(Object.entries(attributes));
  return {
    held,
    getAttribute: (name: string) => held.get(name) ?? null,
    setAttribute: (name: string, value: string) => void held.set(name, value),
  };
}

function root(uses: readonly ReturnType<typeof use>[]) {
  const asked: string[] = [];
  return { asked, querySelectorAll: (selector: string) => (asked.push(selector), uses) };
}

describe('success cases', () => {
  it('points every <use> of a Scene at its file, from the URL its server render named', () => {
    // ARRANGE
    const url = '/art/robot-hull.0123456789.svg#a';
    const hull = use({ 'data-art': url });
    // ACT
    setArtHrefs(root([hull]));
    // ASSERT
    expect(hull.held.get('href')).toBe(url);
  });
});

describe('failure cases', () => {
  it('asks only for art <use> elements without an href, so a loaded one is left alone', () => {
    // ARRANGE
    const scene = root([]);
    const expected = ['use[data-art]:not([href])'];
    // ACT
    setArtHrefs(scene);
    // ASSERT
    expect(scene.asked).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves a <use> without a URL bare rather than pointing it at nothing', () => {
    // ARRANGE
    const bare = use({});
    // ACT
    setArtHrefs(root([bare]));
    // ASSERT
    expect(bare.held.has('href')).toBe(false);
  });
});
