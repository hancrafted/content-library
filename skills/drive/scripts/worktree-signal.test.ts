import { afterEach, describe, expect, it, vi } from 'vitest';
import { signalProcess } from './worktree-signal.ts';

const killFailing = (code: string) =>
  vi.spyOn(process, 'kill').mockImplementation(() => {
    throw Object.assign(new Error(code), { code });
  });

afterEach(() => vi.restoreAllMocks());

describe('signalProcess', () => {
  describe('success cases', () => {
    it('sends the signal to the pid', () => {
      // ARRANGE
      const kill = vi.spyOn(process, 'kill').mockImplementation(() => true);
      // ACT
      signalProcess(42, 'SIGTERM');
      // ASSERT
      expect(kill).toHaveBeenCalledWith(42, 'SIGTERM');
    });
  });

  describe('failure cases', () => {
    it('throws when the process cannot be signalled for any reason but being gone', () => {
      // ARRANGE
      killFailing('EPERM');
      // ACT
      const act = () => signalProcess(42, 'SIGTERM');
      // ASSERT
      expect(act).toThrow('EPERM');
    });
  });

  describe('edge cases', () => {
    it('does nothing for a process that is already gone', () => {
      // ARRANGE
      killFailing('ESRCH');
      // ACT
      const act = () => signalProcess(42, 'SIGKILL');
      // ASSERT
      expect(act).not.toThrow();
    });
  });
});
