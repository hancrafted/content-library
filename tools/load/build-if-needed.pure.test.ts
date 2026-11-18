import { describe, expect, it } from 'vitest';
import { BUILD_COMMANDS, buildIfNeeded } from './build-if-needed.pure.ts';

function stub(statuses: Record<string, number | null> = {}) {
  const ran: string[] = [];
  const lines: string[] = [];
  return {
    ran,
    lines,
    run: (command: string) => {
      ran.push(command);
      return Object.hasOwn(statuses, command) ? statuses[command] : 0;
    },
    log: (line: string) => lines.push(line),
  };
}

describe('buildIfNeeded', () => {
  describe('success cases', () => {
    it('builds and runs the build tests when a changed path feeds the export', () => {
      // ARRANGE
      const { ran, run, log } = stub();
      // ACT
      const ok = buildIfNeeded({ changedPaths: ['src/app/page.tsx', 'docs/a.md'], run, log });
      // ASSERT
      expect(ok).toBe(true);
      expect(ran).toEqual([...BUILD_COMMANDS]);
    });

    it('runs nothing and says so when no changed path feeds the export', () => {
      // ARRANGE
      const { ran, lines, run, log } = stub();
      // ACT
      const ok = buildIfNeeded({ changedPaths: ['docs/a.md', 'skills/drive/SKILL.md'], run, log });
      // ASSERT
      expect(ok).toBe(true);
      expect(ran).toEqual([]);
      expect(lines.join('\n')).toContain('no build needed');
    });

    it('runs nothing for an empty diff', () => {
      // ARRANGE
      const { ran, run, log } = stub();
      // ACT
      const ok = buildIfNeeded({ changedPaths: [], run, log });
      // ASSERT
      expect(ok).toBe(true);
      expect(ran).toEqual([]);
    });
  });

  describe('failure cases', () => {
    it('stops at a failing build and skips the build tests', () => {
      // ARRANGE
      const { ran, run, log } = stub({ 'npm run build': 1 });
      // ACT
      const ok = buildIfNeeded({ changedPaths: ['package.json'], run, log });
      // ASSERT
      expect(ok).toBe(false);
      expect(ran).toEqual(['npm run build']);
    });

    it('fails when the build tests fail', () => {
      // ARRANGE
      const { run, log } = stub({ 'npm run test:build': 1 });
      // ACT
      const ok = buildIfNeeded({ changedPaths: ['public/a.png'], run, log });
      // ASSERT
      expect(ok).toBe(false);
    });

    it('treats a command that never started as a failure', () => {
      // ARRANGE
      const { run, log } = stub({ 'npm run build': null });
      // ACT
      const ok = buildIfNeeded({ changedPaths: ['src/a.ts'], run, log });
      // ASSERT
      expect(ok).toBe(false);
    });
  });
});
