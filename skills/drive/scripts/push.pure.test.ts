import { describe, expect, it } from 'vitest';
import { parseLsRemote, pushedLine, remoteDiffersFrom } from './push.pure.ts';

const HEAD = 'a'.repeat(40);
const OTHER = 'b'.repeat(40);

describe('parseLsRemote', () => {
  it('reads the sha of the first line and null for an empty answer', () => {
    // ARRANGE
    const answer = `${HEAD}\trefs/heads/feat/x\n`;
    // ACT
    const results = [parseLsRemote(answer), parseLsRemote('')];
    // ASSERT
    expect(results).toEqual([HEAD, null]);
  });
});

describe('remoteDiffersFrom', () => {
  it('passes when the remote equals HEAD', () => {
    // ARRANGE
    // ACT
    const problem = remoteDiffersFrom({ branch: 'feat/x', remote: 'origin' }, HEAD, HEAD);
    // ASSERT
    expect(problem).toBeNull();
  });

  it('names the shas when the remote differs, and the missing branch when there is none', () => {
    // ARRANGE
    // ACT
    const problems = [
      remoteDiffersFrom({ branch: 'feat/x', remote: 'origin' }, HEAD, OTHER),
      remoteDiffersFrom({ branch: 'feat/x', remote: 'origin' }, HEAD, null),
    ];
    // ASSERT
    expect(problems[0]).toContain(`origin/feat/x is ${OTHER} but HEAD is ${HEAD}`);
    expect(problems[1]).toContain('origin has no feat/x');
  });
});

describe('pushedLine', () => {
  it('prints old..new, with zeros for a branch the remote did not have', () => {
    // ARRANGE
    // ACT
    const lines = [pushedLine('feat/x', OTHER, HEAD), pushedLine('feat/x', null, HEAD)];
    // ASSERT
    expect(lines).toEqual(['✔ pushed feat/x bbbbbbb..aaaaaaa', '✔ pushed feat/x 0000000..aaaaaaa']);
  });
});
