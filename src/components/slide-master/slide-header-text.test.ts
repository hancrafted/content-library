import { describe, expect, it } from 'vitest';
import type { RuntimeTranslator } from './slide-base';
import { captionNoteOf } from './slide-header-text';

/** A translator over flat keys. */
function translator(messages: Record<string, string>): RuntimeTranslator {
  return Object.assign((key: string) => messages[key], { has: (key: string) => key in messages }) as never;
}

const markerLabel = (title: string) => `Speaker note: ${title}`;
const T = translator({ 'notes.what-is-context-rot.header': 'Context rot' });

describe('success cases', () => {
  it('names the note the caption ends on, with the marker label from the note header', () => {
    // ARRANGE
    const expected = { note: 'what-is-context-rot', label: 'Speaker note: Context rot' };
    // ACT
    const caption = captionNoteOf({
      t: T,
      note: 'what-is-context-rot',
      declared: ['what-is-context-rot'],
      markerLabel,
    });
    // ASSERT
    expect(caption).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a caption note the Slide does not declare', () => {
    // ARRANGE
    const expected = /"missing"/;
    // ACT
    const read = () => captionNoteOf({ t: T, note: 'missing', declared: ['what-is-context-rot'], markerLabel });
    // ASSERT
    expect(read).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('has no caption note when the Slide gives none', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const caption = captionNoteOf({ t: T, note: undefined, declared: [], markerLabel });
    // ASSERT
    expect(caption).toBe(expected);
  });
});
