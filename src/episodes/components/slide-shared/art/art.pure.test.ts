import { describe, expect, it } from 'vitest';
import { artName, artUrl } from './art.pure';

const MANIFEST = { 'robot/hull-lit': '/art/robot-hull-lit.0123456789.svg#a', 'console/mug': null };

describe('success cases', () => {
  it("points an art name at its file's URL under the site's base path", () => {
    // ARRANGE
    const expected = '/content-library/art/robot-hull-lit.0123456789.svg#a';
    // ACT
    const url = artUrl('robot/hull-lit', MANIFEST, '/content-library');
    // ASSERT
    expect(url).toBe(expected);
  });

  it('names a drawing its data decides by that data, so equal data shares one file and other data gets its own', () => {
    // ARRANGE
    const rays = { count: 7, spread: 150 };
    const shape = /^rays\/[0-9a-f]{8}$/;
    // ACT
    const [name, same, other] = [
      artName('rays', rays),
      artName('rays', { ...rays }),
      artName('rays', { count: 6, spread: 150 }),
    ];
    // ASSERT
    expect(same).toBe(name);
    expect(other).not.toBe(name);
    expect(name).toMatch(shape);
  });
});

describe('failure cases', () => {
  it('refuses a name the art build never drew, naming it and the step that writes the manifest', () => {
    // ARRANGE
    const expected = /"robot\/hull-off".*npm run art/;
    // ACT
    const resolve = () => artUrl('robot/hull-off', MANIFEST, '');
    // ASSERT
    expect(resolve).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('serves from the root when the site has no base path', () => {
    // ARRANGE
    const expected = MANIFEST['robot/hull-lit'];
    // ACT
    const url = artUrl('robot/hull-lit', MANIFEST, '');
    // ASSERT
    expect(url).toBe(expected);
  });

  it('has no URL for a name the art build kept inline, so the page draws it', () => {
    // ARRANGE
    const expected = null;
    // ACT
    const url = artUrl('console/mug', MANIFEST, '');
    // ASSERT
    expect(url).toBe(expected);
  });
});
