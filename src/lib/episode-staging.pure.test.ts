import { describe, expect, it } from 'vitest';
import { checkResearchIndex, checkRunsCsv, checkStagingFolder, type KnownVisuals } from './episode-staging.pure';

/*
 * In-memory staging folders: a small Dossier, then one change per test that
 * breaks exactly one rule.
 */

const KNOWN_VISUALS: KnownVisuals = { masters: ['basic-page', 'grid-2x2'], motions: ['liquid-ink-transition'] };

const REVIEW_ASSET = '<!-- spec-review:start --><form id="spec-review" method="post"></form><!-- spec-review:end -->';

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
  return ['---', 'type: feedback', 'round: 1', `via: ${via}`, '---', '', '# Feedback round 1', '', ...items, ''].join(
    '\n',
  );
}

const FEEDBACK_PATH = 'feedback/01/feedback.md';

function research(description: string): string {
  return ['---', 'type: research', `description: ${description}`, "question: 'Why?'", '---', '', '# Why?', ''].join(
    '\n',
  );
}

const RECALL = 'research/recall/research.md';

const RECALL_ENTRY = '- [Why recall drops](research/recall/research.md) — Recall is U-shaped.';

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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it.each(['app', 'voice'])(
    'finds nothing in %s feedback keyed to the Title slide, a section slide or a page Slide, design tag included',
    (via) => {
      // ARRANGE
      const files = folder({
        [FEEDBACK_PATH]: feedback(via, [
          '- `top` · content — Shorter caption.',
          '- `why` · implementation — The motif overflows on mobile.',
          '- `why--spent` · design — Try the bar as a heat strip.',
        ]),
      });
      // ACT
      const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
      // ASSERT
      expect(findings).toEqual([]);
    },
  );

  it('finds nothing in a Spec review whose items name the picks of each Slide, and the Visual language note', () => {
    // ARRANGE
    const files = folder({
      [FEEDBACK_PATH]: feedback('spec', [
        '- `why--spent` · design — picked: 1a',
        '- `why--spent` · design — picked: 1a, 1b — Combine them.',
        '- `why--spent` · design — picked: none — Try a heat strip.',
        '- `top` · design — picked: 0b — Fuel the rocket in fewer steps.',
        '- `visual-language` · design — More accent.',
        '- `brief--learning-goal` · design — Sharper goal.',
        '- `brief--research-questions` · design — Add one on cost.',
      ]),
    });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('reports a brief-- item for a heading the Brief card lacks, or without a note', () => {
    // ARRANGE
    const files = folder({
      [FEEDBACK_PATH]: feedback('spec', ['- `brief--hook` · design — Louder.', '- `brief--style` · design —']),
    });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(['feedback', 'feedback']);
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
      'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at',
      '1,context-window-budget,research,implementor,1,pass,,120,9000,2026-10-12T10:15:00Z',
      '',
    ].join('\n');
    // ACT
    const findings = checkRunsCsv(csv);
    // ASSERT
    expect(findings).toEqual([]);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
  });

  it('reports a Dossier heading whose slug is malformed instead of ignoring it as an extra', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('## Material left out', '## Material left out {#Left_Out}') });
    const expectedKinds = ['spine'];
    const expectedSlug = '{#Left_Out}';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedName);
  });

  it('accepts motion none as a Visual motion: the Slide carries no motion', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('motion: liquid-ink-transition', 'motion: none') });
    const expectedFindings: string[] = [];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedLine);
  });

  it('reports a feedback item not of the anchor · tag — text form', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('app', ['- why--spent: open with the budget.']) });
    const expected = [{ kind: 'feedback', file: FEEDBACK_PATH }];
    const expectedForm = '`top`|`<section>`|`<section>--<slide>` · content|implementation|design — text';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedAnchor);
  });

  it("checks feedback beside a Spec whose Dossier the Gate deleted, keyed by the Spec's own Slides", () => {
    // ARRANGE
    const page = `<!doctype html><html><body>
<section data-spec="section" id="why"><article data-spec="slide" id="spent" data-number="1"></article></section>
</body></html>`;
    const files = {
      'spec/spec.html': page,
      [FEEDBACK_PATH]: feedback('app', [
        '- `why--spent` · content — Open with the budget.',
        '- `why--gone` · content — Cut it.',
      ]),
    };
    const expected = [
      { kind: 'feedback', file: FEEDBACK_PATH, message: 'Feedback anchor "why--gone" is no page slide in the Spec.' },
    ];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET).filter(({ kind }) => kind === 'feedback');
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('reports a practice tag in feedback that did not come from practice', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('app', ['- `why--spent` · practice — Slow down here.']) });
    const expectedKinds = ['feedback'];
    const expectedTag = 'practice';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedTag);
  });

  it('names a bare feedback anchor that is no section slide in the Dossier', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('app', ['- `gone` · content — Cut it.']) });
    const expected = [
      { kind: 'feedback', file: FEEDBACK_PATH, message: 'Feedback anchor "gone" is no section slide in the Dossier.' },
    ];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('reports a design tag in feedback from practice, which reviews the recording', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('practice', ['- `why--spent` · design — Swap the bar.']) });
    const expectedKinds = ['feedback'];
    const expectedTag = 'design';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
    expect(findings[0].message).toContain(expectedTag);
  });

  it('reports Spec review items without picks, with none and no note, or tagged other than design', () => {
    // ARRANGE
    const files = folder({
      [FEEDBACK_PATH]: feedback('spec', [
        '- `why--spent` · design — Thinner bar.',
        '- `why--spent` · design — picked: none',
        '- `why--spent` · content — picked: 1a',
      ]),
    });
    const expectedForm = '`<section>--<slide>` · design — picked: <option ids>|none — note';
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(['feedback', 'feedback', 'feedback']);
    expect(findings.map(({ message }) => message)).toEqual([
      expect.stringContaining(expectedForm),
      expect.stringContaining(expectedForm),
      expect.stringContaining(expectedForm),
    ]);
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
    const csv = 'run,episode,agent,job,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at\n';
    const expected = [{ kind: 'runs-header', file: 'runs.csv' }];
    const expectedHeader = 'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at';
    // ACT
    const findings = checkRunsCsv(csv);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedHeader);
  });
});

describe('edge cases', () => {
  it('accepts a Speaker notes and a Voice script block under the h1', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('# Budget {#budget}\n', `# Budget {#budget}\n\n${TITLE_BLOCKS}`),
    });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('ignores unslugged Dossier headings anywhere in the spine', () => {
    // ARRANGE
    const files = folder({
      'dossier.md': DOSSIER.replace('## Why it forgets {#why}', '## Aside\n\nNote.\n\n## Why it forgets {#why}'),
    });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('does not take a heading inside a fenced code block as part of the spine', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('Extra.', '```markdown\n## Example {#example}\n```') });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a slide-master Slide as the Visual master', () => {
    // ARRANGE
    const files = folder({ 'dossier.md': DOSSIER.replace('master: basic-page', 'master: grid-2x2') });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a practice tag in a practice file', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('practice', ['- `why--spent` · practice — Slow down here.']) });
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('takes a visual-language item only in a Spec review, where it carries no picks', () => {
    // ARRANGE
    const files = folder({
      [FEEDBACK_PATH]: feedback('spec', ['- `visual-language` · design — picked: 1a — More accent.']),
      'feedback/02/feedback.md': feedback('app', ['- `visual-language` · content — More accent.']),
    });
    const expectedFiles = [FEEDBACK_PATH, 'feedback/02/feedback.md'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET).filter(({ kind }) => kind === 'feedback');
    // ASSERT
    expect(findings.map(({ file }) => file)).toEqual(expectedFiles);
  });

  it('keys a Spec review by the Title slide and page Slides alone, never a section slide', () => {
    // ARRANGE
    const files = folder({ [FEEDBACK_PATH]: feedback('spec', ['- `why` · design — picked: 1a']) });
    const expectedKinds = ['feedback'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
  });

  it("keys bare feedback anchors by the Spec's Sections once the Gate deleted the Dossier", () => {
    // ARRANGE
    const page = `<!doctype html><html><body>
<section data-spec="section" id="why"><article data-spec="slide" id="spent" data-number="1"></article></section>
</body></html>`;
    const files = {
      'spec/spec.html': page,
      [FEEDBACK_PATH]: feedback('app', ['- `why` · content — Name the budget.', '- `how` · content — Cut it.']),
    };
    const expected = [
      { kind: 'feedback', file: FEEDBACK_PATH, message: 'Feedback anchor "how" is no section slide in the Spec.' },
    ];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET).filter(({ kind }) => kind === 'feedback');
    // ASSERT
    expect(findings).toEqual(expected);
  });

  it('checks the Spec page of a folder against the Spec contract', () => {
    // ARRANGE
    const files = folder({ 'spec/spec.html': '<!doctype html><html><body></body></html>' });
    const expectedKinds = ['spec', 'spec', 'spec', 'spec', 'spec', 'spec'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
  });

  it('checks the feedback rounds of a folder that has no Dossier yet', () => {
    // ARRANGE
    const files = { 'feedback/02/feedback.md': feedback('chat', []) };
    const expectedKinds = ['feedback-round'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
    // ASSERT
    expect(kinds(findings)).toEqual(expectedKinds);
  });

  it('checks the title and the sources of the files of a folder that has no Dossier yet', () => {
    // ARRANGE
    const files = {
      'brief.md': '---\ntitle: Budget\n---\n\n# Spend\n',
      [RECALL]: '---\ntype: research\n---\n\n# Why?\n\nA [^x].\n',
    };
    const expectedKinds = ['title', 'research-sources'];
    // ACT
    const findings = checkStagingFolder(files, KNOWN_VISUALS, REVIEW_ASSET);
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
    const header = 'run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at';
    const csvs = [`${header}\r\n`, `${header} \n`];
    const expectedKinds = [['runs-header'], ['runs-header']];
    // ACT
    const found = csvs.map((csv) => kinds(checkRunsCsv(csv)));
    // ASSERT
    expect(found).toEqual(expectedKinds);
  });
});
