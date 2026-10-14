import { describe, expect, it } from 'vitest';
import { verdictFirst } from './agent-summary.pure.ts';

/* The stored agent summary: verdict first, absolute paths and an opening pasted draft out, then the cut. */

const MAX = 200;
const WT = '/Users/han/Developer/content-library/.worktrees/episode-x/docs/episodes/x/dossier.md';

describe('verdictFirst', () => {
  it('keeps a reviewer verdict that is already first', () => {
    expect(verdictFirst('pass\n\nAll four tickets pass the rule.', MAX)).toBe(
      'pass\n\nAll four tickets pass the rule.',
    );
  });

  it('shortens an absolute worktree path to the repo-relative path so the sentence survives the cut', () => {
    // ARRANGE
    const message = `The Dossier is written at \`${WT}\`. ${'More. '.repeat(60)}`;
    // ACT
    const summary = verdictFirst(message, MAX);
    // ASSERT
    expect(summary.startsWith('The Dossier is written at `docs/episodes/x/dossier.md`.')).toBe(true);
    expect(summary).not.toContain('/Users/');
  });

  it('drops an opening pasted draft: front matter, a fenced block, headings and bare path lines', () => {
    // ARRANGE
    const message = [
      '---\nverified: false\n---',
      '```md\n# Draft\nbody\n```',
      '### Inputs',
      '- `.claude/skills/new-episode/references/retrieval.md`',
      `${WT}`,
      '**fail**: two hard findings.',
    ].join('\n');
    // ACT
    const summary = verdictFirst(message, MAX);
    // ASSERT
    expect(summary).toBe('**fail**: two hard findings.');
  });

  it('moves a verdict line near the top ahead of the prose above it', () => {
    // ARRANGE
    const message = 'I read the dossier and the ticket.\nfail\nThe Slide repeats the note.';
    // ACT
    const summary = verdictFirst(message, MAX);
    // ASSERT
    expect(summary.split('\n')[0]).toBe('fail');
  });

  it('does not take prose that merely starts with a verdict word for a verdict', () => {
    expect(verdictFirst('I read it.\nFail-safe handling is described.', MAX)).toBe(
      'I read it.\nFail-safe handling is described.',
    );
  });

  it('falls back to the message when stripping leaves nothing', () => {
    expect(verdictFirst('docs/llm-wiki/research/SALES/SALES-0002/research.md', MAX)).toBe(
      'docs/llm-wiki/research/SALES/SALES-0002/research.md',
    );
  });

  it('cuts at the maximum', () => {
    expect(verdictFirst('x'.repeat(300), MAX)).toHaveLength(MAX);
  });
});
