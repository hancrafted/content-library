import { describe, expect, it } from 'vitest';
import { agentOf } from './marks.pure.ts';
describe('success cases', () => {
  describe('agentOf', () => {
    it('reads the Agent trailer of a commit message', () => {
      // ARRANGE
      const message =
        'docs(episode): write research\n\n- Added a finding.\n\nSource: docs/episodes/x/brief.md\nAgent: write-research\n';
      // ACT
      const actual = agentOf(message);
      // ASSERT
      expect(actual).toBe('write-research');
    });

    it('reads the Edited-by footer of an issue body', () => {
      // ARRANGE
      const body = '## Spec\n\nText.\n\nEdited-by: write-design-spec\n';
      // ACT
      const actual = agentOf(body);
      // ASSERT
      expect(actual).toBe('write-design-spec');
    });
  });
});

describe('failure cases', () => {
  describe('agentOf', () => {
    it('ignores a mark quoted in the middle of the text', () => {
      // ARRANGE
      // ACT
      const actual = agentOf('Agent: write-spec\n\nHan rewrote the rest.\n');
      // ASSERT
      expect(actual).toBeNull();
    });

    it('ignores a mark that sits above a non-trailer paragraph', () => {
      // ARRANGE
      // ACT
      const actual = agentOf('Subject\n\nAgent: write-spec\n\nA closing paragraph of prose.\n');
      // ASSERT
      expect(actual).toBeNull();
    });

    it('ignores a mark in a paragraph that holds prose lines', () => {
      // ARRANGE
      // ACT
      const actual = agentOf('Subject\n\nNote: this was quoted\nand continues here.\nAgent: write-spec\n');
      // ASSERT
      expect(actual).toBeNull();
    });
  });
});

describe('edge cases', () => {
  describe('agentOf', () => {
    it("treats an unmarked text as the user's", () => {
      // ARRANGE
      // ACT
      const actual = agentOf('## Spec\n\nText.\n');
      // ASSERT
      expect(actual).toBeNull();
    });

    it('takes the last mark when several edits stacked footers', () => {
      // ARRANGE
      // ACT
      const actual = agentOf('Body.\n\nEdited-by: write-spec\nEdited-by: write-design-spec');
      // ASSERT
      expect(actual).toBe('write-design-spec');
    });
  });
});
