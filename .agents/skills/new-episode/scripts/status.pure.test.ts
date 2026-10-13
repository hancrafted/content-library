import { describe, expect, it } from 'vitest';
import { frontmatterStatus, outputGate, runStatus, subIssuesApproved } from './status.pure.ts';

/*
 * A run's state read back from disk: a small per-run pipeline and run logs
 * that record its jobs as an orchestrator appends them.
 */

const PIPELINE = `status: approved
jobs:
  - { id: brief-grill, needs: [] }
  - { id: retrieval, needs: [brief-grill] }
  - { id: write-research-a, needs: [retrieval] }
  - { id: write-research-b, needs: [retrieval] }
  - { id: write-dossier, needs: [retrieval], wants: [write-research-a, write-research-b] }
  - { id: open-pr, needs: [write-dossier] }
`;

/** One run-log entry, headed `<job id> · <timestamp>`. */
function entry(heading: string, metrics: string[], notes = 'None.'): string {
  const items = metrics.map((metric) => `- ${metric}`).join('\n');
  return `## ${heading}\n\n### Inputs\n\n- x\n\n### Output\n\n- x\n\n### Checks\n\n- x\n\n### Metrics\n\n${items}\n\n### Notes\n\n${notes}\n`;
}

const PASS = 'implementor · attempt 1 · pass · 60 s';

describe('success cases', () => {
  it('marks logged passes done, jobs whose needs are done ready, and the rest waiting', () => {
    // ARRANGE
    const runLog = ['# Run log\n', entry('brief-grill · 2026-10-12T09:00:00Z', [PASS]), entry('retrieval · 2026-10-12T09:10:00Z', [PASS])].join('\n');
    const expected = [
      { id: 'brief-grill', state: 'done' },
      { id: 'retrieval', state: 'done' },
      { id: 'write-research-a', state: 'ready' },
      { id: 'write-research-b', state: 'ready' },
      { id: 'write-dossier', state: 'waiting' },
      { id: 'open-pr', state: 'waiting' },
    ];
    // ACT
    const states = runStatus(PIPELINE, runLog);
    // ASSERT
    expect(states).toEqual(expected);
  });

  it('marks a job whose Notes start Blocked blocked, makes a job wanting it ready, and blocks what needs it', () => {
    // ARRANGE
    const failed = 'implementor · attempt 2 · fail · rubric "The Answer answers the h1 question." · 90 s';
    const runLog = [
      '# Run log\n',
      entry('brief-grill · 2026-10-12T09:00:00Z', [PASS]),
      entry('retrieval · 2026-10-12T09:10:00Z', [PASS]),
      entry('write-research-a · 2026-10-12T09:30:00Z', [PASS, 'reviewer · attempt 1 · pass · 30 s']),
      entry('write-research-b · 2026-10-12T09:40:00Z', [failed], 'Blocked: "The Answer answers the h1 question."'),
    ].join('\n');
    const blockedRetrieval = [
      '# Run log\n',
      entry('brief-grill · 2026-10-12T09:00:00Z', [PASS]),
      entry('retrieval · 2026-10-12T10:00:00Z', [failed], 'Blocked: "x"'),
    ].join('\n');
    // ACT
    const states = runStatus(PIPELINE, runLog).map(({ state }) => state);
    const afterBlockedRetrieval = runStatus(PIPELINE, blockedRetrieval).map(({ state }) => state);
    // ASSERT
    expect(states).toEqual(['done', 'done', 'done', 'blocked', 'ready', 'waiting']);
    expect(afterBlockedRetrieval).toEqual(['done', 'blocked', 'blocked', 'blocked', 'blocked', 'blocked']);
  });
});

describe('gate jobs', () => {
  const GATED = `jobs:
  - { id: write-voice-script, needs: [], gate: human, outputs: [docs/episodes/<slug>/dossier.md] }
  - { id: write-spec, needs: [write-voice-script] }
`;
  const runLog = ['# Run log\n', entry('write-voice-script · 2026-10-12T09:00:00Z', [PASS])].join('\n');

  it('prints gate for a logged gate job until its output is approved, and holds back what needs it', () => {
    // ARRANGE
    const draft = () => 'draft';
    const approved = () => 'approved';
    // ACT
    const whileDraft = runStatus(GATED, runLog, { outputStatus: draft }).map(({ state }) => state);
    const afterApproval = runStatus(GATED, runLog, { outputStatus: approved }).map(({ state }) => state);
    // ASSERT
    expect(whileDraft).toEqual(['gate', 'waiting']);
    expect(afterApproval).toEqual(['done', 'ready']);
  });
});

describe('gate jobs without a staging output', () => {
  const gated = `jobs:
  - { id: write-design-spec, needs: [], gate: human, outputs: [] }
  - { id: implement-episode, needs: [write-design-spec] }
`;
  const runLog = ['# Run log\n', entry('write-design-spec · 2026-10-12T09:00:00Z', [PASS])].join('\n');

  it('prints gate for a logged label-gated job until its tickets are approved, and holds back what needs it', () => {
    // ARRANGE
    const approvedByLabel = () => true;
    // ACT
    const whileTriage = runStatus(gated, runLog, { labelApproved: () => false }).map(({ state }) => state);
    const withoutReader = runStatus(gated, runLog).map(({ state }) => state);
    const afterApproval = runStatus(gated, runLog, { labelApproved: approvedByLabel }).map(({ state }) => state);
    // ASSERT
    expect(whileTriage).toEqual(['gate', 'waiting']);
    expect(withoutReader).toEqual(['gate', 'waiting']);
    expect(afterApproval).toEqual(['done', 'ready']);
  });
});

describe('edge cases', () => {
  it('reads only the latest entry of a job, and a passed attempt after a failed one as done', () => {
    // ARRANGE
    const runLog = [
      '# Run log\n',
      entry('brief-grill · 2026-10-12T09:00:00Z', ['implementor · attempt 1 · fail · rubric "x" · 10 s']),
      entry('brief-grill · 2026-10-12T09:05:00Z', ['implementor · attempt 1 · fail · rubric "x" · 10 s', PASS.replace('attempt 1', 'attempt 2')]),
    ].join('\n');
    const noLog = '';
    // ACT
    const states = runStatus(PIPELINE, runLog).map(({ state }) => state);
    const fresh = runStatus(PIPELINE, noLog).map(({ state }) => state);
    // ASSERT
    expect(states.slice(0, 2)).toEqual(['done', 'ready']);
    expect(fresh.slice(0, 2)).toEqual(['ready', 'waiting']);
  });
});

describe('outputGate', () => {
  const brief = (generatedAt: string): string =>
    `---\ntype: brief\ngenerated:\n  by: claude-code/opus-5.5\n  at: ${generatedAt}\nverified:\n  - by: human:han\n    at: 2026-10-12T09:30:00Z\n---\n`;
  const GATED = `jobs:
  - { id: brief-grill, needs: [], gate: human, outputs: [docs/episodes/<slug>/brief.md] }
`;
  const runLog = ['# Run log\n', entry('brief-grill · 2026-10-12T09:00:00Z', [PASS])].join('\n');

  it('reads a markdown file by its trust tier and pipeline.yml by its status', () => {
    // ARRANGE
    const approved = brief('2026-10-12T09:00:00Z');
    // ACT
    const tiers = [outputGate('brief.md', approved), outputGate('pipeline.yml', 'status: approved\njobs: []\n')];
    // ASSERT
    expect(tiers).toEqual(['approved', 'approved']);
  });

  it('opens the gate on Han\'s entry and closes it again when the file is edited after approval', () => {
    // ARRANGE
    const fresh = () => outputGate('brief.md', brief('2026-10-12T09:00:00Z'));
    const edited = () => outputGate('brief.md', brief('2026-10-12T10:00:00Z'));
    // ACT
    const open = runStatus(GATED, runLog, { outputStatus: fresh }).map(({ state }) => state);
    const reopened = runStatus(GATED, runLog, { outputStatus: edited }).map(({ state }) => state);
    // ASSERT
    expect(open).toEqual(['done']);
    expect(reopened).toEqual(['gate']);
  });
});

describe('frontmatterStatus', () => {
  it('reads a plain, quoted or trailing-space status', () => {
    expect(frontmatterStatus('---\nstatus: approved\n---\n')).toBe('approved');
    expect(frontmatterStatus('---\nstatus: "approved"\n---\n')).toBe('approved');
    expect(frontmatterStatus("---\nstatus: 'approved' \n---\n")).toBe('approved');
  });

  it('is null without a status line', () => {
    expect(frontmatterStatus('# Title\n')).toBeNull();
  });
});

describe('subIssuesApproved', () => {
  const ticket = (state: string, ...labels: string[]) => ({ state, labels: labels.map((name) => ({ name })) });

  it('is approved when every open sub-issue has left needs-triage', () => {
    expect(subIssuesApproved([ticket('open', 'ready-for-agent'), ticket('open')])).toBe(true);
  });

  it('is not approved while an open sub-issue still carries needs-triage', () => {
    expect(subIssuesApproved([ticket('open', 'ready-for-agent'), ticket('open', 'needs-triage')])).toBe(false);
  });

  it('ignores closed sub-issues, even one still labelled needs-triage', () => {
    expect(subIssuesApproved([ticket('closed', 'needs-triage'), ticket('open')])).toBe(true);
  });

  it('is not approved when there are no sub-issues', () => {
    expect(subIssuesApproved([])).toBe(false);
  });
});
