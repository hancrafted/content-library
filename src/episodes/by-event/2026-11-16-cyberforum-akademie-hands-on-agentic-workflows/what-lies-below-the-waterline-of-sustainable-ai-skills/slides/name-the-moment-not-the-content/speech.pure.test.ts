import { describe, expect, it } from 'vitest';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { requestBubble, requestClashes, requestLines, WIDE_PICTURE_PIXELS } from './speech.pure';

const plain = (text: string) => text.replace(/<\/?match>/g, '');

describe('success cases', () => {
  it('keeps the English request clear of the match pill and the skill index, inside the picture', () => {
    // ARRANGE
    const words = plain(en.request.text);
    // ACT
    const found = requestClashes(requestBubble(words, WIDE_PICTURE_PIXELS));
    // ASSERT
    expect(found).toEqual([]);
  });

  it('keeps the German request clear of the match pill and the skill index, inside the picture', () => {
    // ARRANGE
    const words = plain(de.request.text);
    // ACT
    const found = requestClashes(requestBubble(words, WIDE_PICTURE_PIXELS));
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names the pill and the index a bubble lowered onto them covers', () => {
    // ARRANGE
    const expected = ['covers the match pill', 'covers the skill index'];
    // ACT
    const found = requestClashes({ x: 200, y: 300, width: 400, height: 80 });
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it("starts both lines on the bubble's right edge, the dashed one above the matching one", () => {
    // ARRANGE
    const box = requestBubble(plain(en.request.text), WIDE_PICTURE_PIXELS);
    // ACT
    const { content, moment } = requestLines(box);
    // ASSERT
    expect({ content: content.x, moment: moment.x, dashedAbove: content.y < moment.y }).toEqual({
      content: box.x + box.width,
      moment: box.x + box.width,
      dashedAbove: true,
    });
  });
});
