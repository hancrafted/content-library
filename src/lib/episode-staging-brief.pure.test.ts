import { describe, expect, it } from 'vitest';
import { checkBrief, unsettledBriefSections } from './episode-staging-brief.pure';

/*
 * In-memory staging folders: a Brief whose spine is well formed, then one
 * change per test that breaks exactly one rule.
 */

const SLIDES = `## Slides

### Why it forgets

1. (A) **Every token is spent attention** — the window fills. _Visual:_ a bar that fills. _Research:_ 1
2. (B) **The afternoon drifts** — the session forgets. _Visual:_ a chat that scrolls.

### Spend it on purpose

3. (A) **Start fresh** — a new task gets a new session. _Visual:_ two windows. _Research:_ 2
`;

const QUESTIONS = `## Research questions

1. Why does recall degrade with position?
2. Why does a fresh session restore instruction following?
`;

function brief(slides: string = SLIDES, questions: string = QUESTIONS): string {
  return [
    '---',
    'type: brief',
    '---',
    '',
    '# Budget',
    '',
    '## Threads',
    '',
    '### A thread',
    '',
    'The mechanism.',
    '',
    '### B thread',
    '',
    'One afternoon.',
    '',
    slides,
    questions,
  ].join('\n');
}

const DOSSIER = `---
type: dossier
---

# Budget {#budget}

## Why it forgets {#why}

### Every token is spent attention {#spent}

### The afternoon drifts {#afternoon}

## Spend it on purpose {#purpose}

### Start fresh {#fresh}
`;

function runLog(notes: string): string {
  return ['# Run log', '', '## write-dossier · 2026-10-12T11:00:00Z', '', '### Notes', '', notes, ''].join('\n');
}

const UNSETTLED_BRIEF = `---
type: brief
status: draft
---

# Budget

## Format

Short.

## Hook

Not settled.

## Threads

### A thread

Not settled.
`;

function kinds(findings: readonly { kind: string }[]): string[] {
  return findings.map(({ kind }) => kind);
}

describe('success cases', () => {
  it('finds nothing in a Brief whose spine is well formed and has no Dossier yet', () => {
    // ARRANGE
    const files = { 'brief.md': brief() };
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds nothing when the Dossier keeps the Brief spine title for title', () => {
    // ARRANGE
    const files = { 'brief.md': brief(), 'dossier.md': DOSSIER };
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds no unsettled section in a Brief where every heading holds a choice', () => {
    // ARRANGE
    const brief = UNSETTLED_BRIEF.replaceAll('Not settled.', 'Settled.');
    // ACT
    const unsettled = unsettledBriefSections(brief);
    // ASSERT
    expect(unsettled).toEqual([]);
  });
});

describe('failure cases', () => {
  it('reports a Slide entry without a bold title, a purpose and a Visual idea', () => {
    // ARRANGE
    const broken = SLIDES.replace(
      '**Start fresh** — a new task gets a new session. _Visual:_ two windows.',
      'Start fresh.',
    );
    const files = { 'brief.md': brief(broken) };
    const expected = ['brief-slide'];
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(kinds(findings)).toEqual(expected);
  });

  it('reports a Brief Slide title that carries a Dossier slug', () => {
    // ARRANGE
    const slugged = SLIDES.replace('**Start fresh**', '**Start fresh {#fresh}**');
    const files = { 'brief.md': brief(slugged) };
    const expected = ['brief-slide'];
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(kinds(findings)).toEqual(expected);
  });

  it('reports each Thread tag in a Brief without Threads', () => {
    // ARRANGE
    const withoutThreads = brief().replace(/^## Threads\n[\s\S]*?(?=^## Slides)/m, '');
    const files = { 'brief.md': withoutThreads };
    const expected = ['brief-thread', 'brief-thread', 'brief-thread'];
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(kinds(findings)).toEqual(expected);
  });

  it('names a Research number that is no research question of the Brief', () => {
    // ARRANGE
    const broken = SLIDES.replace('_Research:_ 2', '_Research:_ 2, 3');
    const files = { 'brief.md': brief(broken) };
    const unknown = '"3"';
    // ACT
    const messages = checkBrief(files).map(({ message }) => message);
    // ASSERT
    expect(messages).toEqual([expect.stringContaining(unknown)]);
  });

  it('names a research question that no Slide cites', () => {
    // ARRANGE
    const broken = SLIDES.replace(' _Research:_ 2', '');
    const files = { 'brief.md': brief(broken) };
    const expected = ['brief-research'];
    const uncited = 'question 2';
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(kinds(findings)).toEqual(expected);
    expect(findings[0].message).toContain(uncited);
  });

  it('reports a Brief with Threads whose Slides never take the B thread', () => {
    // ARRANGE
    const broken = SLIDES.replace('(B) **The afternoon', '(A) **The afternoon');
    const files = { 'brief.md': brief(broken) };
    const expected = ['brief-thread'];
    const missing = '(B)';
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(kinds(findings)).toEqual(expected);
    expect(findings[0].message).toContain(missing);
  });

  it('names a Brief Slide the Dossier dropped without a Spine change line', () => {
    // ARRANGE
    const dropped = DOSSIER.replace('### The afternoon drifts {#afternoon}\n', '');
    const files = { 'brief.md': brief(), 'dossier.md': dropped, 'run-log.md': runLog('Done.') };
    const expected = ['brief-spine'];
    const title = '"The afternoon drifts"';
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(kinds(findings)).toEqual(expected);
    expect(findings[0].message).toContain(title);
  });
  it('names a Dossier page Slide the Brief never listed, without a Spine change line', () => {
    // ARRANGE
    const added = DOSSIER.replace(
      '### Start fresh {#fresh}',
      '### Start fresh {#fresh}\n\n### Cut what you paste {#cut}',
    );
    const files = { 'brief.md': brief(), 'dossier.md': added, 'run-log.md': runLog('Done.') };
    const expected = ['brief-spine'];
    const title = '"Cut what you paste"';
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(kinds(findings)).toEqual(expected);
    expect(findings[0].message).toContain(title);
  });
  it('names a Brief Slide the Dossier moved out of order, without a Spine change line', () => {
    // ARRANGE
    const moved = DOSSIER.replace('### Every token is spent attention {#spent}\n\n', '').replace(
      '### Start fresh {#fresh}',
      '### Start fresh {#fresh}\n\n### Every token is spent attention {#spent}',
    );
    const files = { 'brief.md': brief(), 'dossier.md': moved, 'run-log.md': runLog('Done.') };
    const expected = ['brief-spine'];
    const title = '"Every token is spent attention"';
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(kinds(findings)).toEqual(expected);
    expect(findings[0].message).toContain(title);
  });

  it('names every Brief heading that still reads Not settled.', () => {
    // ARRANGE
    const expected = ['Hook', 'A thread'];
    // ACT
    const unsettled = unsettledBriefSections(UNSETTLED_BRIEF);
    // ASSERT
    expect(unsettled).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('accepts a dropped Brief Slide that the write-dossier entry names in a Spine change line', () => {
    // ARRANGE
    const dropped = DOSSIER.replace('### The afternoon drifts {#afternoon}\n', '');
    const notes = 'Spine change: The afternoon drifts — the B thread folds into the first Slide.';
    const files = { 'brief.md': brief(), 'dossier.md': dropped, 'run-log.md': runLog(notes) };
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('checks nothing in a folder without a Brief', () => {
    // ARRANGE
    const files = { 'dossier.md': '# Budget {#budget}\n' };
    // ACT
    const findings = checkBrief(files);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('does not take "Not settled." inside a longer paragraph as the marker', () => {
    // ARRANGE
    const brief = UNSETTLED_BRIEF.replaceAll('Not settled.', 'Not settled. We chose the budget framing instead.');
    // ACT
    const unsettled = unsettledBriefSections(brief);
    // ASSERT
    expect(unsettled).toEqual([]);
  });
});
