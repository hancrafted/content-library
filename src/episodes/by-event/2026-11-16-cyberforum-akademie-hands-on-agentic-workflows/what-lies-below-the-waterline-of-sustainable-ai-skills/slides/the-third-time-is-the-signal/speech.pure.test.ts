import { describe, expect, it } from 'vitest';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { NARROWEST_PICTURE_PIXELS, speechClashes, speechLayout, type SpeechWords } from './speech.pure';

const PANELS = ['first', 'second', 'third'] as const;
const DAYS = { first: 1, second: 2, third: 3 } as const;
type Messages = typeof en;
const linesOf = (messages: Messages): readonly SpeechWords[] =>
  PANELS.map((panel) => ({
    day: DAYS[panel],
    captain: messages.panels[panel].captainLine,
    pilot: messages.panels[panel].pilotLine,
  }));
const clashesIn = (messages: Messages, picturePixels: number) =>
  linesOf(messages).flatMap((words) =>
    speechClashes(speechLayout(words, picturePixels)).map((c) => `${words.day}: ${c}`),
  );

describe('success cases', () => {
  it('stacks the English bubbles clear of each other and inside the picture every morning', () => {
    // ARRANGE
    const picturePixels = NARROWEST_PICTURE_PIXELS;
    // ACT
    const found = clashesIn(en, picturePixels);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('stacks the German bubbles clear of each other and inside the picture every morning', () => {
    // ARRANGE
    const picturePixels = NARROWEST_PICTURE_PIXELS;
    // ACT
    const found = clashesIn(de as Messages, picturePixels);
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it("names the meeting when the pilot says too much and his bubble grows into the captain's", () => {
    // ARRANGE
    const pilotLine = 'Which depth? What goes on the label? Which tube, and how slowly do I lower the arm?';
    const words = { day: 1, captain: en.panels.first.captainLine, pilot: pilotLine } as const;
    const expected = 'bubbles meet';
    // ACT
    const found = speechClashes(speechLayout(words, NARROWEST_PICTURE_PIXELS));
    // ASSERT
    expect(found).toContain(expected);
  });
});

describe('edge cases', () => {
  it('holds on a wide picture too, where the words draw larger and the bubbles keep their place in the room', () => {
    // ARRANGE
    const widePixels = 520;
    // ACT
    const found = [...clashesIn(en, widePixels), ...clashesIn(de as Messages, widePixels)];
    // ASSERT
    expect(found).toEqual([]);
  });
});
