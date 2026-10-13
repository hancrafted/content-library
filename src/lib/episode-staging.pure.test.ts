import { describe, expect, it } from 'vitest';
import {
  checkResearchIndex,
  checkRunsCsv,
  checkStagingFolder,
  unsettledBriefSections,
  type KnownVisuals,
} from './episode-staging.pure';

/*
 * In-memory staging folders: a small Dossier, then one change per test that
 * breaks exactly one rule.
 */

const KNOWN_VISUALS: KnownVisuals = { masters: ['basic-page', 'grid-2x2'], motions: ['liquid-ink-transition'] };

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

## Why it forgets {#why}

#### Voice script

1. **Forgetting** — budget, spending

### Spent attention {#spent}

${SLIDE_BLOCK}
## Material left out

Extra.
`;

function feedback(via: string, items: readonly string[]): string {
  return ['---', 'type: feedback', 'round: 1', `via: ${via}`, '---', '', ...items, ''].join('\n');
}

const FEEDBACK_PATH = 'feedback/01/feedback.md';

function research(description: string): string {
  return ['---', 'type: research', `description: ${description}`, "question: 'Why?'", '---', '', '# Why?', ''].join(
    '\n',
  );
}

const RECALL = 'research/recall/research.md';

function researchOn(generatedAt: string, accessed: readonly string[]): string {
  return [
    '---',
    'type: research',
    'generated:',
    '  by: claude-code/opus-5.5',
    `  at: ${generatedAt}`,
    '---',
    '',
    '# Why?',
    '',
    '## Sources',
    '',
    ...accessed.map(
      (date, index) =>
        `${index + 1}. Liu et al., Lost in the Middle — https://arxiv.org/abs/2307.03172 — accessed ${date}`,
    ),
    '',
  ].join('\n');
}
const RECALL_ENTRY = '- [Why recall drops](research/recall/research.md) — Recall is U-shaped.';

const BRIEF = `---
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

function runLog(entries: readonly string[]): string {
  return ['# Run log', '', ...entries.flatMap((entry) => [`## ${entry}`, '', '### Notes', '', 'Done.', '']), ''].join(
    '\n',
  );
}

function folder(files: Record<string, string>): Record<string, string> {
  return { 'dossier.md': DOSSIER, ...files };
}

function kinds(findings: readonly { kind: string }[]): string[] {
  return findings.map(({ kind }) => kind);
}

describe('success cases', () => {
  it('finds nothing in a folder whose Dossier is well formed', () => {
    // ARRANGE
    const files = folder({});
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds nothing in feedback whose items are well formed and keyed by existing Slide anchors', () => {
    // ARRANGE
    const files = folder({
      [FEEDBACK_PATH]: feedback('app', [
        '- `why--spent` · content — Open with the budget.',
        '- `why--spent` · implementation — The bar overflows.',
      ]),
    });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds nothing when the llm-wiki index lists each research file once with its description', () => {
    // ARRANGE
    const index = ['# Research', '', RECALL_ENTRY, ''].join('\n');
    const files = { [RECALL]: research("'Recall is U-shaped.'") };
    // ACT
    const findings = checkResearchIndex(index, files);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds nothing in a runs CSV whose header is exact, with rows below it', () => {
    // ARRANGE
    const csv = [
      'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,at',
      '1,context-window-budget,research,implementor,1,pass,,120,9000,2026-10-12T10:15:00Z',
      '',
    ].join('\n');
    // ACT
    const findings = checkRunsCsv(csv);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('finds no unsettled section in a Brief where every heading holds a choice', () => {
    // ARRANGE
    const brief = BRIEF.replaceAll('Not settled.', 'Settled.');
    // ACT
    const unsettled = unsettledBriefSections(brief);
    // ASSERT
    expect(unsettled).toEqual([]);
  });
});

const TITLE_BLOCKS = `#### Speaker notes

1. **A budget** — attention is finite [1].
   - sources: [1] Attention Is All You Need — https://arxiv.org/abs/1706.03762

#### Voice script

1. **Opening** — budget, spending
`;

describe('failure cases', () => {
  it('reports prose under the Dossier h1, where only the two optional blocks may sit', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('# Budget {#budget}\n', '# Budget {#budget}\n\nArgument.\n'),
    });
    const expectedKinds = ['title-slide'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain('Argument.');
  });

  it('reports an h4 other than Speaker notes and Voice script under the h1', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('# Budget {#budget}\n', '# Budget {#budget}\n\n#### Sources\n\n1. A book.\n'),
    });
    const expectedKinds = ['title-slide'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain('Sources');
  });

  it("checks the Speaker notes under the h1 like any Slide's", () => {
    // ARRANGE
    const broken = TITLE_BLOCKS.replace('[1] Attention', '[2] Attention');
    const files = folder({ 'dossier.md': DOSSIER.replace('# Budget {#budget}\n', `# Budget {#budget}\n\n${broken}`) });
    const expectedKinds = ['speaker-note'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
  });

  it('reports a Dossier heading whose slug is malformed instead of ignoring it as an extra', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('## Material left out', '## Material left out {#Left_Out}') });
    const expectedKinds = ['spine'];
    const expectedSlug = '{#Left_Out}';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedSlug);
  });

  it('names a Visual master that is neither a frame component nor a slide-master Slide', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('master: basic-page', 'master: four-column') });
    const expectedKinds = ['visual'];
    const expectedName = 'four-column';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedName);
  });

  it('names a Visual motion effect that does not exist', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('motion: liquid-ink-transition', 'motion: fade') });
    const expectedKinds = ['visual'];
    const expectedName = 'fade';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedName);
  });

  it('accepts motion none as a Visual motion: the Slide carries no motion', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('motion: liquid-ink-transition', 'motion: none') });
    const expectedFindings: string[] = [];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedFindings);
  });

  it.each([
    ['local', 'motion: local'],
    ['a library motion beside local', 'motion: liquid-ink-transition, local'],
    ['two library motions', 'motion: liquid-ink-transition,liquid-ink-transition'],
  ])('accepts %s as a Visual motion list', (_name, line) => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('motion: liquid-ink-transition', line) });
    const expectedFindings: string[] = [];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedFindings);
  });

  it.each([
    ['none beside local', 'motion: none, local', 'none'],
    ['an unknown entry in a list', 'motion: local, fade', 'fade'],
    ['an empty entry', 'motion: local,', 'empty'],
  ])('reports %s in a Visual motion list', (_name, line, expectedName) => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('motion: liquid-ink-transition', line) });
    const expectedKinds = ['visual'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedName);
  });

  it('accepts a title line after the master line as the on-screen title', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('motion: liquid-ink-transition', 'motion: none\ntitle: Where the budget goes'),
    });
    const expectedFindings: string[] = [];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedFindings);
  });

  it('reports a title line that names no title', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('motion: liquid-ink-transition', 'motion: none\ntitle:'),
    });
    const expectedKinds = ['visual'];
    const expectedForm = 'title: <on-screen title>';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedForm);
  });

  it('reports a title line that is not directly after the master line, instead of reading it as prose', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace(
        'motion: liquid-ink-transition',
        'motion: none\n\nA bar that fills.\ntitle: Where the budget goes',
      ),
    });
    const expectedKinds = ['visual'];
    const expectedMention = 'directly after the master line';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedMention);
  });

  it('reports a Visual on the Title slide or a section slide, which use the kit layouts with motion none', () => {
    // ARRANGE
    const visual = '#### Visual\n\nmaster: basic-page · motion: none\n\n';
    const files = folder({
      'dossier.md': DOSSIER.replace('# Budget {#budget}\n\n', `# Budget {#budget}\n\n${visual}`).replace(
        '## Why it forgets {#why}\n\n',
        `## Why it forgets {#why}\n\n${visual}`,
      ),
    });
    const expectedKinds = ['visual', 'visual'];
    const expectedSlugs = ['budget', 'why'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings.map(({ message }) => expectedSlugs.some((slug) => message.includes(`{#${slug}}`)))).toEqual([
      true,
      true,
    ]);
  });

  it('reports a Visual that does not open with the master and motion line', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('master: basic-page · motion: liquid-ink-transition', 'A bar, styled with CSS.'),
    });
    const expectedKinds = ['visual'];
    const expectedForm = 'master: <name> · motion: <motions>';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedForm);
  });

  it('reports a Speaker note item without a bold header and a description', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('1. **Attention is shared** — every', '1. Attention is shared: every'),
    });
    const expectedKinds = ['speaker-note'];
    const expectedForm = '**header** — description';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedForm);
  });

  it('names a Speaker note citation that resolves to no source', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('every token competes [1].', 'every token competes [1][2].'),
    });
    const expectedKinds = ['speaker-note'];
    const expectedCitation = '[2]';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedCitation);
  });

  it('reports a Speaker note item with no nested sources line', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace(
        '   - sources: [1] Attention Is All You Need — https://arxiv.org/abs/1706.03762\n',
        '',
      ).replace('competes [1].', 'competes.'),
    });
    const expectedKinds = ['speaker-note'];
    const expectedKey = 'sources:';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedKey);
  });

  it('reports a nested Speaker note line that is neither sources nor target', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('   - target: the bar', '   - note: the bar') });
    const expectedKinds = ['speaker-note'];
    const expectedLine = 'note: the bar';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedLine);
  });

  it('reports a feedback item not of the anchor · tag — text form', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('app', ['- why--spent: open with the budget.']) });
    const expected = [{ kind: 'feedback', file: FEEDBACK_PATH }];
    const expectedForm = '`<section>--<slide>` · content|implementation — text';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedForm);
  });

  it('names a feedback anchor that is no Slide in the Dossier', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('voice', ['- `why--gone` · content — Cut it.']) });
    const expectedKinds = ['feedback'];
    const expectedAnchor = 'why--gone';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedAnchor);
  });

  it('reports a practice tag in feedback that did not come from practice', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('app', ['- `why--spent` · practice — Slow down here.']) });
    const expectedKinds = ['feedback'];
    const expectedTag = 'practice';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedTag);
  });

  it('names a research file whose description differs from its index entry', () => {
    // ARRANGE
    const index = RECALL_ENTRY;
    const files = { [RECALL]: research("'Recall is U-shaped over position.'") };
    const expected = [{ kind: 'research-index', file: RECALL }];
    // ACT
    const findings = checkResearchIndex(index, files);
    // ASSERT
    expect(findings).toMatchObject(expected);
  });

  it('names a research file the index does not list', () => {
    // ARRANGE
    const unlisted = 'research/fresh-start/research.md';
    const index = RECALL_ENTRY;
    const files = { [RECALL]: research("'Recall is U-shaped.'"), [unlisted]: research("'A fresh session resets.'") };
    const expected = [{ kind: 'research-index', file: unlisted }];
    // ACT
    const findings = checkResearchIndex(index, files);
    // ASSERT
    expect(findings).toMatchObject(expected);
  });

  it('names an index entry that points at no research file, and a file listed twice', () => {
    // ARRANGE
    const gone = '- [Gone](research/gone/research.md) — Was here.';
    const index = [RECALL_ENTRY, RECALL_ENTRY, gone].join('\n');
    const files = { [RECALL]: research("'Recall is U-shaped.'") };
    const expected = [
      { kind: 'research-index', file: RECALL },
      { kind: 'research-index', file: 'research/gone/research.md' },
    ];
    // ACT
    const findings = checkResearchIndex(index, files);
    // ASSERT
    expect(findings).toMatchObject(expected);
  });

  it('reports a runs CSV header with its columns out of order', () => {
    // ARRANGE
    const csv = 'run,episode,agent,job,attempt,result,failed_rubric,duration_s,tokens,at\n';
    const expected = [{ kind: 'runs-header', file: 'runs.csv' }];
    const expectedHeader = 'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,at';
    // ACT
    const findings = checkRunsCsv(csv);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedHeader);
  });

  it('names every Brief heading that still reads Not settled.', () => {
    // ARRANGE
    const expected = ['Hook', 'A thread'];
    // ACT
    const unsettled = unsettledBriefSections(BRIEF);
    // ASSERT
    expect(unsettled).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('accepts a Speaker notes and a Voice script block under the h1', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('# Budget {#budget}\n', `# Budget {#budget}\n\n${TITLE_BLOCKS}`),
    });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('ignores unslugged Dossier headings anywhere in the spine', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('## Why it forgets {#why}', '## Aside\n\nNote.\n\n## Why it forgets {#why}'),
    });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('does not take a heading inside a fenced code block as part of the spine', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('Extra.', '```markdown\n## Example {#example}\n```') });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a slide-master Slide as the Visual master', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('master: basic-page', 'master: grid-2x2') });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a Speaker note without a target and with two sources', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('competes [1].', 'competes [1] and fades [2].').replace(
        '   - target: the bar',
        '   - sources: [2] Lost in the Middle — https://arxiv.org/abs/2307.03172',
      ),
    });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a practice tag in a practice file', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('practice', ['- `why--spent` · practice — Slow down here.']) });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('checks the run log and research of a folder that has no Dossier yet', () => {
    // ARRANGE
    const files = {
      'run-log.md': runLog(['research · 2026-10-12T10:15:00Z', 'brief-grill · 2026-10-12T09:00:00Z']),
      [RECALL]: researchOn('2026-10-11T00:00:00Z', ['2026-10-12']),
    };
    const expectedKinds = ['research-date', 'run-log-order'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
  });

  it('skips the index check while the index does not exist', () => {
    // ARRANGE
    const files = { [RECALL]: research("'Recall is U-shaped.'") };
    // ACT
    const findings = checkResearchIndex(undefined, files);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('compares the description as YAML reads it, quotes and escapes resolved', () => {
    // ARRANGE
    const index = '- [Why recall drops](research/recall/research.md) — The model\'s recall is "U"-shaped.';
    const files = { [RECALL]: research("'The model''s recall is \"U\"-shaped.'") };
    // ACT
    const findings = checkResearchIndex(index, files);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('reports a runs CSV header that differs only by a trailing carriage return or space', () => {
    // ARRANGE
    const header = 'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,at';
    const csvs = [`${header}\r\n`, `${header} \n`];
    const expectedKinds = [['runs-header'], ['runs-header']];
    // ACT
    const found = csvs.map((csv) => kinds(checkRunsCsv(csv)));
    // ASSERT
    expect(found).toEqual(expectedKinds);
  });

  it('does not take "Not settled." inside a longer paragraph as the marker', () => {
    // ARRANGE
    const brief = BRIEF.replaceAll('Not settled.', 'Not settled. We chose the budget framing instead.');
    // ACT
    const unsettled = unsettledBriefSections(brief);
    // ASSERT
    expect(unsettled).toEqual([]);
  });
});
