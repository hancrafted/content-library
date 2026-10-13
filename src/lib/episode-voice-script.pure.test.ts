import { describe, expect, it } from 'vitest';
import { checkVoiceScriptDiff } from './episode-voice-script.pure';

/*
 * write-voice-script may change only the Voice script lines of what
 * write-dossier committed (design-ADR 0004, issue 106): the draft is the
 * Dossier as write-dossier left it, the voiced file as write-voice-script did.
 */

const SLIDE_BLOCK = `#### Visual

master: basic-page · motion: liquid-ink-transition

A bar that fills.

#### Speaker notes

1. **Attention is shared** — every token competes [1].
   - sources: [1] Attention Is All You Need — https://arxiv.org/abs/1706.03762
   - target: the bar

#### Voice script

1. **Whole window** — read, share
2. **Not seen** — attention left
`;

const DOSSIER = `---
type: dossier
status: draft
locale: en
brief: ./brief.md
---

# Budget {#budget}

Argument.

## Why it forgets {#why}

#### Voice script

1. **Forgetting** — budget, spending

### Spent attention {#spent}

${SLIDE_BLOCK}
## Material left out

Extra.
`;

const VOICED = DOSSIER.replace(
  '1. **Whole window** — read, share',
  '1. **Whole window** — The model reads it all, every turn.',
)
  .replace('2. **Not seen** — attention left', '2. **Not seen** — The question is how much attention was left.')
  .replace('1. **Forgetting** — budget, spending', '1. **Forgetting** — Forgetting is what a fixed budget does.');

function kinds(findings: readonly { kind: string }[]): string[] {
  return findings.map(({ kind }) => kind);
}

describe('success cases', () => {
  it('finds nothing when only the Voice script lines were rewritten and the frontmatter status moved', () => {
    // ARRANGE
    const voiced = VOICED.replace('status: draft', 'status: checked');
    // ACT
    const findings = checkVoiceScriptDiff(DOSSIER, voiced);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names a line outside the Voice script that write-voice-script changed', () => {
    // ARRANGE
    const voiced = VOICED.replace('A bar that fills.', 'A bar that drains.');
    const expectedKinds = ['voice-script'];
    const expectedLine = 'A bar that drains.';
    // ACT
    const findings = checkVoiceScriptDiff(DOSSIER, voiced);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedLine);
  });

  it('names a Voice script item whose bold beat was changed', () => {
    // ARRANGE
    const voiced = VOICED.replace('**Not seen**', '**Unseen**');
    const expectedKinds = ['voice-script'];
    const expectedBeat = 'Not seen';
    // ACT
    const findings = checkVoiceScriptDiff(DOSSIER, voiced);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedBeat);
  });

  it('names a Slide whose Voice script gained or lost an item', () => {
    // ARRANGE
    const voiced = VOICED.replace('2. **Not seen** — The question is how much attention was left.\n', '');
    const expectedKinds = ['voice-script'];
    const expectedSlug = 'spent';
    // ACT
    const findings = checkVoiceScriptDiff(DOSSIER, voiced);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedSlug);
  });
});

describe('edge cases', () => {
  it('reads a spoken paragraph wrapped over two lines as one item', () => {
    // ARRANGE
    const voiced = VOICED.replace('The model reads it all, every turn.', 'The model reads it all,\nevery turn.');
    // ACT
    const findings = checkVoiceScriptDiff(DOSSIER, voiced);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
