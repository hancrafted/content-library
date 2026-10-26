import { describe, expect, it } from 'vitest';
import { frontmatterValue } from './staging-file.pure.ts';
import { approveText, parseApproveArgs } from './verified.pure.ts';

/*
 * The `skills/new-episode/scripts/approve.ts` command line and the entry it appends; the gate tiers are tested in src/pipeline/lib/staging-file.pure.test.ts.
 */

const GENERATED = '2026-10-12T09:00:00Z';
const HAN = { by: 'human:han', at: '2026-10-12T09:30:00Z' };

function file(verified: string, generated = GENERATED): string {
  return `---\ntype: brief\ntitle: T\nstatus: draft\ngenerated:\n  by: claude-code/opus-5.5\n  at: ${generated}\n${verified}---\n\n# T\n`;
}

function list(...entries: { by: string; at: string }[]): string {
  return `verified:\n${entries.map(({ by, at }) => `  - by: ${by}\n    at: ${at}\n`).join('')}`;
}

function spec(verified?: { by: string; at: string }[]): string {
  const meta = { type: 'spec', generated: { by: 'claude-code/opus-5.5', at: GENERATED }, verified };
  return `<html>\n  <head>\n    <script type="application/json" id="spec-meta">${JSON.stringify(meta)}</script>\n  </head>\n</html>\n`;
}

function metaOf(html: string): unknown {
  const json = /<script type="application\/json" id="spec-meta">([\s\S]*?)<\/script>/.exec(html)?.[1];
  return json === undefined ? undefined : JSON.parse(json);
}
describe('success cases', () => {
  describe('approveText', () => {
    it("appends the machine entry beside the user's without overwriting", () => {
      // ARRANGE
      const text = file(list(HAN));
      // ACT
      const result = approveText('brief.md', text, { by: 'process:markdown-harness', at: '2026-10-13T12:00:00Z' });
      // ASSERT
      expect(frontmatterValue(result, 'verified')).toEqual([
        HAN,
        { by: 'process:markdown-harness', at: '2026-10-13T12:00:00Z' },
      ]);
    });
  });

  describe('approveText on an HTML Spec', () => {
    it("appends the user's entry at the given time to the meta block's verified list", () => {
      // ARRANGE
      const text = spec();
      const now = '2026-10-13T12:00:00Z';
      const expected = [{ by: 'human:han', at: now }];
      // ACT
      const meta = metaOf(approveText('spec/spec.html', text, { by: 'human:han', at: now }));
      // ASSERT
      expect(meta).toMatchObject({ verified: expected });
    });

    it('keeps the earlier entries and the rest of the page', () => {
      // ARRANGE
      const machine = { by: 'process:markdown-harness', at: '2026-10-12T09:05:00Z' };
      const text = spec([machine, HAN]);
      const now = { by: 'human:han', at: '2026-10-13T12:00:00Z' };
      const expected = { verified: [machine, HAN, now], generated: { by: 'claude-code/opus-5.5', at: GENERATED } };
      const tail = '</head>\n</html>\n';
      // ACT
      const result = approveText('spec/spec.html', text, now);
      // ASSERT
      expect(metaOf(result)).toMatchObject(expected);
      expect(result.slice(-tail.length)).toBe(tail);
    });
  });

  describe('parseApproveArgs', () => {
    it('defaults by to human:han and reads --by in either position', () => {
      // ARRANGE
      const args = [
        ['a.md'],
        ['a.md', '--by', 'process:markdown-harness'],
        ['--by', 'process:markdown-harness', 'a.md'],
      ];
      // ACT
      const parsed = args.map(parseApproveArgs);
      // ASSERT
      expect(parsed).toEqual([
        { file: 'a.md', by: 'human:han' },
        { file: 'a.md', by: 'process:markdown-harness' },
        { file: 'a.md', by: 'process:markdown-harness' },
      ]);
    });
  });

  describe('--stamp', () => {
    const now = '2026-10-13T12:00:00Z';
    const stamp = { by: 'claude-code/opus-5.5', at: now };

    it('parses --stamp beside --by in any position', () => {
      // ARRANGE
      const args = ['--stamp', 'gemini/pro-3', 'a.md', '--by', 'process:markdown-harness'];
      // ACT
      const parsed = parseApproveArgs(args);
      // ASSERT
      expect(parsed).toEqual({ file: 'a.md', by: 'process:markdown-harness', stamp: 'gemini/pro-3' });
    });

    it('writes generated.at and generated.by into the frontmatter beside the verified entry', () => {
      // ARRANGE
      const text = file('', '2020-01-01T00:00:00Z');
      const entry = { by: 'process:markdown-harness', at: now };
      // ACT
      const result = approveText('brief.md', text, { ...entry, stamp: stamp.by });
      // ASSERT
      expect(frontmatterValue(result, 'generated')).toEqual(stamp);
      expect(frontmatterValue(result, 'verified')).toEqual([entry]);
    });

    it("writes generated into an HTML Spec's meta block", () => {
      // ARRANGE
      const text = spec();
      // ACT
      const meta = metaOf(
        approveText('spec/spec.html', text, { by: 'process:markdown-harness', at: now, stamp: stamp.by }),
      );
      // ASSERT
      expect(meta).toMatchObject({ generated: stamp, verified: [{ by: 'process:markdown-harness', at: now }] });
    });
  });
});

describe('failure cases', () => {
  describe('approveText', () => {
    it('refuses a by that is not an actor', () => {
      // ARRANGE
      const text = file('');
      // ACT
      const act = () => approveText('brief.md', text, { by: 'han', at: '2026-10-13T12:00:00Z' });
      // ASSERT
      expect(act).toThrow('not an actor');
    });
  });

  describe('approveText on an HTML Spec', () => {
    it('refuses a Spec without a meta block, naming the block it needs', () => {
      // ARRANGE
      const text = '<html><head></head></html>\n';
      const expected = 'no meta block';
      // ACT
      const act = () => approveText('spec/spec.html', text, { by: 'human:han', at: '2026-10-13T12:00:00Z' });
      // ASSERT
      expect(act).toThrow(expected);
    });
  });

  describe('parseApproveArgs', () => {
    it('returns a usage error for no file, a dangling --by, a bad actor or extra arguments', () => {
      // ARRANGE
      const args = [[], ['a.md', '--by'], ['a.md', '--by', 'han'], ['a.md', 'b.md']];
      // ACT
      const parsed = args.map(parseApproveArgs);
      // ASSERT
      expect(parsed.every((result) => typeof result === 'string')).toBe(true);
    });
  });

  describe('--stamp', () => {
    it('refuses a --stamp that is not <producer>/<model>', () => {
      // ARRANGE
      const args = [
        ['a.md', '--stamp'],
        ['a.md', '--stamp', 'opus'],
      ];
      // ACT
      const parsed = args.map(parseApproveArgs);
      // ASSERT
      expect(parsed.every((result) => typeof result === 'string')).toBe(true);
    });
  });
});

describe('edge cases', () => {
  describe('--stamp', () => {
    const now = '2026-10-13T12:00:00Z';
    const stamp = { by: 'claude-code/opus-5.5', at: now };

    it('stamps a file that has no generated key yet', () => {
      // ARRANGE
      const text = '---\ntype: brief\n---\n\n# T\n';
      // ACT
      const result = approveText('brief.md', text, { by: 'process:markdown-harness', at: now, stamp: stamp.by });
      // ASSERT
      expect(frontmatterValue(result, 'generated')).toEqual(stamp);
    });

    it('leaves generated as written without a stamp', () => {
      // ARRANGE
      const text = file('');
      // ACT
      const result = approveText('brief.md', text, { by: 'human:han', at: now });
      // ASSERT
      expect(frontmatterValue(result, 'generated')).toEqual({ by: 'claude-code/opus-5.5', at: GENERATED });
    });
  });
});
