import { describe, expect, it } from 'vitest';
import type { RuntimeTranslator } from './slide-base';
import { captionNoteOf, captionNotesOf } from './slide-header-text';

/** A translator over flat keys. */
function translator(messages: Record<string, string>): RuntimeTranslator {
  return Object.assign((key: string) => messages[key], { has: (key: string) => key in messages }) as never;
}

const markerLabel = (title: string) => `Speaker note: ${title}`;
const T = translator({
  'notes.what-is-context-rot.header': 'Context rot',
  'notes.ibm-wording.header': "IBM's wording",
  'notes.salesforce-wording.header': "Salesforce's wording",
});
const DECLARED = ['what-is-context-rot', 'ibm-wording', 'salesforce-wording'];

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

  it('names every note of a caption that ends on several, in order, each with its own marker label', () => {
    // ARRANGE
    const expected = [
      { note: 'ibm-wording', label: "Speaker note: IBM's wording" },
      { note: 'salesforce-wording', label: "Speaker note: Salesforce's wording" },
    ];
    // ACT
    const caption = captionNotesOf({
      t: T,
      notes: ['ibm-wording', 'salesforce-wording'],
      declared: DECLARED,
      markerLabel,
    });
    // ASSERT
    expect(caption).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a caption whose several notes include one the Slide does not declare', () => {
    // ARRANGE
    const expected = /"missing"/;
    // ACT
    const read = () => captionNotesOf({ t: T, notes: ['ibm-wording', 'missing'], declared: DECLARED, markerLabel });
    // ASSERT
    expect(read).toThrow(expected);
  });

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

  it('has no caption notes when the Slide names none', () => {
    // ARRANGE
    const expected = undefined;
    // ACT
    const caption = captionNotesOf({ t: T, notes: undefined, declared: DECLARED, markerLabel });
    // ASSERT
    expect(caption).toBe(expected);
  });
});
