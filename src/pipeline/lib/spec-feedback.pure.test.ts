import { describe, expect, it } from 'vitest';
import type { SpecSlide } from './episode-spec-page.pure.ts';
import { nextRound, reviewToFeedback } from './spec-feedback.pure.ts';

/*
 * A Spec review, as the served page posts it, turned into the next `feedback.md` round (design-ADR 0011): the page's
 * own feedback lines, validated against the Spec's Slides and written as they came. A Slide with no pick is set to
 * Redesign and needs no note; approve refuses it, naming the Slide. The posted lines and the clock are hand-written
 * here; the server reads them.
 */

const SLIDES: readonly SpecSlide[] = [
  { section: 'why', slug: 'spent', options: ['1a', '1b'] },
  { section: 'why', slug: 'quiet', options: ['2a', '2b', '2c'] },
];
const TITLE = ['0a', '0b', '0c'];
const NOW = new Date('2026-10-15T10:40:05.123Z');

/** The path of a round's file under the Episode folder. */
const roundFile = (round: number) => `feedback/${String(round).padStart(2, '0')}/feedback.md`;

/** The lines the page posts, one feedback item per line. */
const posted = (...items: string[]) => items.join('\n');

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

describe('success cases', () => {
  it('writes the posted lines as the round, under the frontmatter and the h1, as they came', () => {
    // ARRANGE
    const items = [
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: 2b — Thinner bar, more air.',
      '- `visual-language` · design — More accent.',
      '- `page` · design — Too many bars overall.',
      '- `next` · gate — redesign',
    ];
    const expected = { kind: 'saved', file: roundFile(2), text: [...header(2), ...items, ''].join('\n') };
    // ACT
    const result = reviewToFeedback({ lines: posted(...items), slides: SLIDES, round: 2, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('writes a brief-- note as a design item keyed by its heading slug', () => {
    // ARRANGE
    const lines = posted(
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: 2b',
      '- `brief--learning-goal` · design — Sharper please',
    );
    const expectedLine = '- `brief--learning-goal` · design — Sharper please\n';
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, brief: ['brief--learning-goal'], round: 1, now: NOW });
    // ASSERT
    expect(result).toMatchObject({ kind: 'saved' });
    expect(result.kind === 'saved' ? result.text : '').toContain(expectedLine);
  });

  it('writes several picks and a pick of none with its note', () => {
    // ARRANGE
    const items = [
      '- `why--spent` · design — picked: 1a, 1b — Combine the bar of 1a with the turns of 1b.',
      '- `why--quiet` · design — picked: none — None fit: try a heat strip.',
    ];
    // ACT
    const result = reviewToFeedback({ lines: posted(...items), slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual({ kind: 'saved', file: roundFile(1), text: [...header(1), ...items, ''].join('\n') });
  });

  it('approves when every Slide, the Title slide included, has exactly one pick', () => {
    // ARRANGE
    const lines = posted(
      '- `top` · design — picked: 0a',
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: 2b',
      '- `next` · gate — approve',
    );
    const nextLine = '- `next` · gate — approve\n';
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, titleSlide: TITLE, round: 1, now: NOW });
    // ASSERT
    expect(result.kind === 'saved' ? result.text : '').toContain(nextLine);
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
});

describe('failure cases', () => {
  it('refuses a review that carries no lines, saying the page needs its script', () => {
    // ARRANGE
    const expected = {
      kind: 'rejected',
      faults: [
        {
          slide: 'feedback',
          message: 'The review carries no feedback lines: reload the page and save again (the page needs its script).',
        },
      ],
    };
    // ACT
    const result = reviewToFeedback({ lines: '', slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a note for a brief heading the Spec does not carry', () => {
    // ARRANGE
    const lines = posted('- `why--spent` · design — picked: 1a', '- `brief--style` · design — x');
    const expected = {
      kind: 'rejected',
      faults: [
        { slide: 'brief--style', message: 'The Spec has no note "brief--style": reload the page and review again.' },
      ],
    };
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, brief: [], round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses approve while Slides are set to Redesign, naming every one of them, a note or not', () => {
    // ARRANGE
    const lines = posted(
      '- `top` · design — picked: none — Something else.',
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: none — Try a heat strip.',
      '- `next` · gate — approve',
    );
    const expected = {
      kind: 'rejected',
      faults: [
        { slide: 'top', message: 'The Title slide is set to Redesign: pick an Option before you approve.' },
        { slide: 'quiet', message: 'Slide 2 "quiet" is set to Redesign: pick an Option before you approve.' },
      ],
    };
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, titleSlide: TITLE, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses approve while a Slide has more than one pick, naming it and how many it has', () => {
    // ARRANGE
    const lines = posted(
      '- `top` · design — picked: 0a',
      '- `why--spent` · design — picked: 1a, 1b',
      '- `why--quiet` · design — picked: 2b',
      '- `next` · gate — approve',
    );
    const expected = {
      kind: 'rejected',
      faults: [{ slide: 'spent', message: 'Slide 1 "spent" has 2 picks: keep exactly one before you approve.' }],
    };
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, titleSlide: TITLE, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses approve while a Slide has no line at all, as set to Redesign', () => {
    // ARRANGE
    const lines = posted('- `why--spent` · design — picked: 1a', '- `next` · gate — approve');
    const expected = {
      kind: 'rejected',
      faults: [{ slide: 'quiet', message: 'Slide 2 "quiet" is set to Redesign: pick an Option before you approve.' }],
    };
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a Next action that is neither redesign nor approve', () => {
    // ARRANGE
    const lines = posted('- `why--spent` · design — picked: 1a', '- `next` · gate — ship');
    const expected = {
      kind: 'rejected',
      faults: [{ slide: 'next', message: 'The Next action "ship" is neither redesign nor approve.' }],
    };
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a Slide the Spec does not have, and an Option its Slide does not have', () => {
    // ARRANGE
    const lines = posted('- `why--spent` · design — picked: 1c', '- `why--gone` · design — picked: 9a — Old note.');
    const expected = {
      kind: 'rejected',
      faults: [
        { slide: 'spent', message: 'Slide 1 "spent" has no Option 1c.' },
        { slide: 'why--gone', message: 'The Spec has no Slide "why--gone": reload the page and review again.' },
      ],
    };
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses an Option the Title slide does not have', () => {
    // ARRANGE
    const lines = posted('- `top` · design — picked: 0d');
    const expected = { kind: 'rejected', faults: [{ slide: 'top', message: 'The Title slide has no Option 0d.' }] };
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, titleSlide: TITLE, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a line for the Title slide of a Spec that has none', () => {
    // ARRANGE
    const lines = posted('- `top` · design — picked: 0a');
    const expected = {
      kind: 'rejected',
      faults: [{ slide: 'top', message: 'The Spec has no Slide "top": reload the page and review again.' }],
    };
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('refuses a line that has none of the feedback forms, quoting it', () => {
    // ARRANGE
    const lines = posted('- `why--spent` · design — picked: 1a', '- `why--quiet` · content — Make it shorter.');
    const expectedMessage = '"- `why--quiet` · content — Make it shorter."';
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result.kind).toBe('rejected');
    expect(result.kind === 'rejected' ? result.faults.map(({ message }) => message).join('\n') : '').toContain(
      expectedMessage,
    );
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

  it('saves a Slide set to Redesign with no note, and ignores blank lines and trailing spaces', () => {
    // ARRANGE
    const lines = '- `why--spent` · design — picked: 1a  \n\n- `why--quiet` · design — picked: none\n';
    const expected = [
      ...header(1),
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: none',
      '',
    ].join('\n');
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result).toEqual({ kind: 'saved', file: roundFile(1), text: expected });
  });

  it('takes the last Next action when several are posted', () => {
    // ARRANGE
    const lines = posted(
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: none',
      '- `next` · gate — approve',
      '- `next` · gate — redesign',
    );
    // ACT
    const result = reviewToFeedback({ lines, slides: SLIDES, round: 1, now: NOW });
    // ASSERT
    expect(result.kind).toBe('saved');
  });
});
