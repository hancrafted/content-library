import { describe, expect, it } from 'vitest';
import type { SpecSlide } from '../../../src/lib/episode-spec-page.pure.ts';
import { nextRound, reviewToFeedback } from './spec-feedback.pure.ts';

/*
 * A Spec review, as the served page's form posts it, turned into the next `feedback.md` round (design-ADR 0011):
 * per Slide its picks and note, then the Visual language note. A Slide with no pick needs a note, or the round is
 * refused, naming the Slide. The form fields and the clock are hand-written here; the server reads them.
 */

const SLIDES: readonly SpecSlide[] = [
  { section: 'why', slug: 'spent', options: ['1a', '1b'] },
  { section: 'why', slug: 'quiet', options: ['2a', '2b', '2c'] },
];
const TITLE = ['0a', '0b', '0c'];
const NOW = new Date('2026-10-15T10:40:05.123Z');

function header(round: number): string[] {
  return [
    '---',
    'type: feedback',
    `title: Feedback round ${round}`,
    'generated:',
    '  by: human:han',
    '  at: 2026-10-15T10:40:05Z',
    `round: ${round}`,
    'via: spec',
    '---',
    '',
    `# Feedback round ${round}`,
    '',
  ];
}

describe('brief notes', () => {
  it('writes a brief-- note as a design item keyed by its heading slug', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:spent', '1a'],
      ['pick:quiet', '2b'],
      ['note:brief--learning-goal', 'Sharper\nplease'],
      ['note:brief--style', ''],
    ];
    // ACT
    const result = reviewToFeedback({
      fields,
      slides: SLIDES,
      brief: ['brief--learning-goal', 'brief--style'],
      round: 1,
      now: NOW,
    });
    // ASSERT
    expect(result).toMatchObject({ kind: 'saved' });
    expect(result.kind === 'saved' ? result.text : '').toContain(
      '- `brief--learning-goal` · design — Sharper please\n',
    );
    expect(result.kind === 'saved' ? result.text : '').not.toContain('brief--style');
  });

  it('refuses a note for a brief heading the Spec does not carry', () => {
    // ACT
    const result = reviewToFeedback({
      fields: [
        ['pick:spent', '1a'],
        ['pick:quiet', '2a'],
        ['note:brief--nope', 'x'],
      ],
      slides: SLIDES,
      brief: [],
      round: 1,
      now: NOW,
    });
    // ASSERT
    expect(result.kind).toBe('rejected');
  });
});

describe('success cases', () => {
  it('writes one item per Slide naming its single pick', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:spent', '1a'],
      ['note:spent', ''],
      ['pick:quiet', '2b'],
      ['note:quiet', ''],
      ['note:visual-language', ''],
    ];
    const expected = {
      kind: 'saved',
      file: 'feedback/01/feedback.md',
      text: [...header(1), '- `why--spent` · design — picked: 1a', '- `why--quiet` · design — picked: 2b', ''].join(
        '\n',
      ),
    };
    // ACT
    const result = reviewToFeedback({ fields, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('lists several picks, a pick of none with its note, and the Visual language note last', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:spent', '1a'],
      ['pick:spent', '1b'],
      ['note:spent', 'Combine the bar of 1a with the turns of 1b.'],
      ['note:quiet', 'None fit:\r\n  try a heat strip.'],
      ['note:visual-language', 'More accent.'],
    ];
    const expected = [
      ...header(2),
      '- `why--spent` · design — picked: 1a, 1b — Combine the bar of 1a with the turns of 1b.',
      '- `why--quiet` · design — picked: none — None fit: try a heat strip.',
      '- `visual-language` · design — More accent.',
      '',
    ].join('\n');
    // ACT
    const result = reviewToFeedback({ fields, slides: SLIDES, round: 2, now: NOW });
    // ASSERT
    expect(result).toEqual({ kind: 'saved', file: 'feedback/02/feedback.md', text: expected });
  });

  it('numbers the next round one past the highest round folder', () => {
    // ARRANGE
    const folders = ['01', '03', '02', 'notes.txt'];
    const expected = 4;
    // ACT
    const round = nextRound(folders);
    // ASSERT
    expect(round).toBe(expected);
  });

  it('writes the Title slide item first, keyed top, before the page Slides', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:top', '0b'],
      ['note:top', 'Fewer fuel steps.'],
      ['pick:spent', '1a'],
      ['pick:quiet', '2b'],
    ];
    const expected = [
      ...header(1),
      '- `top` · design — picked: 0b — Fewer fuel steps.',
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: 2b',
      '',
    ].join('\n');
    // ACT
    const result = reviewToFeedback({ fields, slides: SLIDES, titleSlide: TITLE, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual({ kind: 'saved', file: 'feedback/01/feedback.md', text: expected });
  });
});

describe('failure cases', () => {
  it('refuses a Slide with no pick and no note, naming it', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:spent', '1a'],
      ['note:quiet', '  \n '],
    ];
    const expected = {
      kind: 'rejected',
      faults: [
        { slide: 'quiet', message: 'Slide 2 "quiet" has no pick and no note: tick an Option or say what to try.' },
      ],
    };
    // ACT
    const result = reviewToFeedback({ fields, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a pick or note for a Slide the Spec does not have, and an Option its Slide does not have', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:spent', '1c'],
      ['pick:quiet', '2a'],
      ['pick:gone', '9a'],
      ['note:gone', 'Old note.'],
    ];
    const expected = {
      kind: 'rejected',
      faults: [
        { slide: 'spent', message: 'Slide 1 "spent" has no Option 1c.' },
        { slide: 'gone', message: 'The Spec has no Slide "gone": reload the page and review again.' },
      ],
    };
    // ACT
    const result = reviewToFeedback({ fields, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a Title slide with no pick and no note, and an Option it does not have', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:spent', '1a'],
      ['pick:quiet', '2b'],
    ];
    const withUnknown: [string, string][] = [...fields, ['pick:top', '0d']];
    const expected = [
      {
        kind: 'rejected',
        faults: [
          { slide: 'top', message: 'The Title slide has no pick and no note: tick an Option or say what to try.' },
        ],
      },
      { kind: 'rejected', faults: [{ slide: 'top', message: 'The Title slide has no Option 0d.' }] },
    ];
    // ACT
    const results = [fields, withUnknown].map((posted) =>
      reviewToFeedback({ fields: posted, slides: SLIDES, titleSlide: TITLE, round: 1, now: NOW }),
    );
    // ASSERT
    expect(results).toEqual(expected);
  });

  it('refuses a pick for the Title slide of a Spec that has none', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:top', '0a'],
      ['pick:spent', '1a'],
      ['pick:quiet', '2b'],
    ];
    const expected = {
      kind: 'rejected',
      faults: [{ slide: 'top', message: 'The Spec has no Slide "top": reload the page and review again.' }],
    };
    // ACT
    const result = reviewToFeedback({ fields, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('starts at round 1 when no round folder exists', () => {
    // ARRANGE
    const folders: string[] = [];
    // ACT
    const round = nextRound(folders);
    // ASSERT
    expect(round).toBe(1);
  });

  it('counts a tick twice once, and ignores fields the review form does not post', () => {
    // ARRANGE
    const fields: [string, string][] = [
      ['pick:spent', '1a'],
      ['pick:spent', '1a'],
      ['pick:quiet', '2c'],
      ['submit', 'Save review'],
    ];
    const expected = [
      ...header(1),
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: 2c',
      '',
    ].join('\n');
    // ACT
    const result = reviewToFeedback({ fields, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual({ kind: 'saved', file: 'feedback/01/feedback.md', text: expected });
  });
});
