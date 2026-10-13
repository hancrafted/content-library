import { describe, expect, it } from 'vitest';
import { agentOf } from './marks.pure.ts';

/*
 * The agent marks: an `Agent: <job id>` trailer on a commit message, an
 * `Edited-by: <job id>` last line on an issue body. Unmarked is Han's.
 */
describe('agentOf', () => {
  it('reads the Agent trailer of a commit message', () => {
    const message = 'docs(episode): write research\n\n- Added a finding.\n\nSource: docs/episodes/x/brief.md\nAgent: write-research\n';
    expect(agentOf(message)).toBe('write-research');
  });

  it('reads the Edited-by footer of an issue body', () => {
    const body = '## Spec\n\nText.\n\nEdited-by: write-design-spec\n';
    expect(agentOf(body)).toBe('write-design-spec');
  });

  it('treats an unmarked text as Han\'s', () => {
    expect(agentOf('## Spec\n\nText.\n')).toBeNull();
  });

  it('ignores a mark quoted in the middle of the text', () => {
    expect(agentOf('Agent: write-spec\n\nHan rewrote the rest.\n')).toBeNull();
  });

  it('takes the last mark when several edits stacked footers', () => {
    expect(agentOf('Body.\n\nEdited-by: write-spec\nEdited-by: write-design-spec')).toBe('write-design-spec');
  });
});
