import { describe, expect, it } from 'vitest';
import { fullStdoutOf } from './full-stdout';

const PIPE_BUFFER_BYTES = 65_536;

describe('fullStdoutOf', () => {
  describe('success cases', () => {
    it('reads all of a short output', () => {
      // ARRANGE
      const expected = 'short';
      // ACT
      const stdout = fullStdoutOf('node', ['-e', `process.stdout.write('${expected}')`], process.cwd());
      // ASSERT
      expect(stdout).toBe(expected);
    });
  });

  describe('failure cases', () => {
    it('keeps the output of a command that exits non-zero, as archgate does when a check fails', () => {
      // ARRANGE
      const expected = 'failing';
      // ACT
      const stdout = fullStdoutOf(
        'node',
        ['-e', `process.stdout.write('${expected}'); process.exit(1)`],
        process.cwd(),
      );
      // ASSERT
      expect(stdout).toBe(expected);
    });
  });

  describe('edge cases', () => {
    it('reads past the pipe buffer of a command that calls process.exit right after writing, which a pipe would cut off', () => {
      // ARRANGE
      const byteCount = PIPE_BUFFER_BYTES * 4;
      const script = `process.stdout.write('x'.repeat(${byteCount})); process.exit(1)`;
      // ACT
      const stdout = fullStdoutOf('node', ['-e', script], process.cwd());
      // ASSERT
      expect(stdout).toHaveLength(byteCount);
    });
  });
});
