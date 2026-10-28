import { describe, expect, it } from 'vitest';
import { slide } from './slide';
import { titleLinesOf } from './title-lines';

/** A hero Scene whose own messages may carry a `heading`, the way a Slide's on-screen title does. */
function hero(en: Record<string, string>, de: Record<string, string>) {
  return slide({ slug: 'hero', messages: { en, de } as never, content: () => null });
}

describe('success cases', () => {
  it("takes the Title slide's h1 from the hero Scene's own heading, in each locale", () => {
    // ARRANGE
    const scene = hero({ heading: 'The AI forgets.' }, { heading: 'Die KI vergisst.' });
    const english = 'The AI forgets.';
    const german = 'Die KI vergisst.';
    // ACT
    const seen = [titleLinesOf(scene, 'en').heading, titleLinesOf(scene, 'de').heading];
    // ASSERT
    expect(seen).toEqual([english, german]);
  });

  it('reads the hero Scene caption beside its heading', () => {
    // ARRANGE
    const scene = hero({ heading: 'H', caption: 'The lede.' }, { heading: 'K', caption: 'Der Vorspann.' });
    const lede = 'The lede.';
    // ACT
    const caption = titleLinesOf(scene, 'en').caption;
    // ASSERT
    expect(caption).toBe(lede);
  });
});

describe('failure cases', () => {
  it('gives no heading when the hero Scene has none, so the Episode title stays the h1', () => {
    // ARRANGE
    const scene = hero({ caption: 'Only a lede.' }, { caption: 'Nur ein Vorspann.' });
    // ACT
    const heading = titleLinesOf(scene, 'en').heading;
    // ASSERT
    expect(heading).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('reads rich text as plain text, like a caption', () => {
    // ARRANGE
    const scene = hero({ heading: 'The <b>AI</b> forgets.' }, { heading: 'Die <b>KI</b> vergisst.' });
    const plain = 'The AI forgets.';
    // ACT
    const heading = titleLinesOf(scene, 'en').heading;
    // ASSERT
    expect(heading).toBe(plain);
  });
});
