import { describe, expect, it } from 'vitest';
import type { Upload } from './exchange-load.pure.ts';
import { downloadedMessage, uploadMessage } from './exchange-message.pure.ts';
import { wordsFor } from './software-ecology-data.ts';

const W = wordsFor('en').exchange;

/** A loaded upload as the message reads it; the bundle and page play no part in the words. */
const loaded = (warn: { rush: string[]; worst: string[] }) =>
  ({ kind: 'loaded', centers: 7, belts: 12, warn }) as unknown as Upload;

describe('success cases', () => {
  it('reports a loaded file with the reference build’s words and its rushing and worst-case warnings', () => {
    // ARRANGE
    const expected = {
      text: 'Loaded a.yaml: 7 work centers and the Customer, 12 belts from their spawn rules. The factory now runs from this file. Note: if every work center rushed (3+ weeks of work waiting), support, eng would be over capacity. If every inspection also passed bad work unread: support.',
      list: [],
      bad: false,
    };
    // ACT
    const msg = uploadMessage(W, { file: 'a.yaml', up: loaded({ rush: ['support', 'eng'], worst: ['support'] }) });
    // ASSERT
    expect(msg).toEqual(expected);
  });

  it('says what Download saved', () => {
    // ARRANGE
    const expected = {
      text: 'Downloaded software-ecology-tire.yaml: the current state of Tire swing. Edit it and drop it back here.',
      list: [],
      bad: false,
    };
    // ACT
    const msg = downloadedMessage(W, { file: 'software-ecology-tire.yaml', name: 'Tire swing' });
    // ASSERT
    expect(msg).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses an unstable file with the reference build’s line and each reason', () => {
    // ARRANGE
    const problems = ['centers[4].realistic: eng: Realistic needs 2.18× its Ideal capacity (at most 1.5×)'];
    const expected = {
      text: 'r.yaml was not loaded: at Realistic some work would pile up without end.',
      list: problems,
      bad: true,
    };
    // ACT
    const msg = uploadMessage(W, { file: 'r.yaml', up: { kind: 'unstable', problems } });
    // ASSERT
    expect(msg).toEqual(expected);
  });

  it('cannot read a file that is no YAML, naming the parser’s reason', () => {
    // ARRANGE
    const expected = { text: 'Could not read x.yaml: Unexpected end', list: [], bad: true };
    // ACT
    const msg = uploadMessage(W, { file: 'x.yaml', up: { kind: 'unread', reason: 'Unexpected end' } });
    // ASSERT
    expect(msg).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lists at most eight reasons of a broken file', () => {
    // ARRANGE
    const problems = Array.from({ length: 11 }, (_, i) => `centers[${i}].role: unknown role`);
    const shown = problems.slice(0, 8);
    // ACT
    const msg = uploadMessage(W, { file: 'b.yaml', up: { kind: 'broken', problems } });
    // ASSERT
    expect(msg.list).toEqual(shown);
  });

  it('adds no note to a file that holds even while rushing', () => {
    // ARRANGE
    const expected =
      'Loaded c.yaml: 7 work centers and the Customer, 12 belts from their spawn rules. The factory now runs from this file.';
    // ACT
    const msg = uploadMessage(W, { file: 'c.yaml', up: loaded({ rush: [], worst: [] }) });
    // ASSERT
    expect(msg.text).toEqual(expected);
  });
});
