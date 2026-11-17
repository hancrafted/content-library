import { describe, expect, it } from 'vitest';
import { dropGitEnvironment } from './git-environment.fixture.ts';
import { child, FAST, repo } from './lock.fixture.ts';
import { withLock } from './lock.ts';

dropGitEnvironment(process.env);

const RELAY = `for (let i = 0; i < 30; i++)
  await withLock('base', { cwd: process.argv[1], pollMilliseconds: 1, timeoutMilliseconds: 20000 }, () => undefined);`;

describe('withLock', () => {
  describe('edge cases', () => {
    it('hands the lock from holder to holder without a release ever failing, and ends free', async () => {
      // ARRANGE
      const { main } = repo();
      const takers = 5;
      const expectedCodes = Array.from({ length: takers }, () => 0);
      const free = 'free';
      // ACT
      const results = await Promise.all(Array.from({ length: takers }, () => child(RELAY, [main])));
      const after = await withLock('base', { ...FAST, cwd: main, timeoutMilliseconds: 0 }, () => free);
      // ASSERT
      expect(
        results.map((r) => r.code),
        results.map((r) => r.output).join('\n'),
      ).toEqual(expectedCodes);
      expect(after).toBe(free);
    });
  });
});
