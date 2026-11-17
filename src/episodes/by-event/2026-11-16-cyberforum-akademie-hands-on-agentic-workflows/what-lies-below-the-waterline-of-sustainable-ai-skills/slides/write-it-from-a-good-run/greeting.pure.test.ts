import { describe, expect, it } from 'vitest';
import { greetingBox, NARROWEST_PICTURE_PIXELS } from './greeting.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PANEL_ART } from './room-facets';

/*
 * The next morning's greeting (decision 53): the pilot's shared speech bubble, past his empty thought cloud, stays
 * inside the panel's picture in both languages, from the narrowest picture of the four-panel row up.
 */

const inside = (box: { x: number; y: number; width: number }) =>
  box.x >= 0 && box.y >= 0 && box.x + box.width <= PANEL_ART.width;

describe('success cases', () => {
  it('keeps the greeting inside the picture in English and German at the narrowest picture', () => {
    // ARRANGE
    const expected = { en: true, de: true };
    // ACT
    const seen = {
      en: inside(greetingBox(en.day.nextMorning.greeting, NARROWEST_PICTURE_PIXELS)),
      de: inside(greetingBox(de.day.nextMorning.greeting, NARROWEST_PICTURE_PIXELS)),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('lets a greeting too long for the panel leave the picture, so the test above can fail', () => {
    // ARRANGE
    const words = 'Nice to meet you, I am your pilot today and I have never seen you before in my life.';
    // ACT
    const box = greetingBox(words, NARROWEST_PICTURE_PIXELS);
    // ASSERT
    expect(box.y).toBeLessThan(0);
  });
});

describe('edge cases', () => {
  it('keeps the greeting inside a wide one-column picture too, where the words draw larger', () => {
    // ARRANGE
    const widePixels = 640;
    const expected = { en: true, de: true };
    // ACT
    const seen = {
      en: inside(greetingBox(en.day.nextMorning.greeting, widePixels)),
      de: inside(greetingBox(de.day.nextMorning.greeting, widePixels)),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
