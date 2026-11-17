import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT = path.resolve(import.meta.dirname, 'remind.ts');
const dirs: string[] = [];

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const remindFrom = (projectDir: string) =>
  spawnSync('node', [SCRIPT], {
    encoding: 'utf8',
    env: {
      ...(Object.fromEntries(
        Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
      ) as NodeJS.ProcessEnv),
      CLAUDE_PROJECT_DIR: projectDir,
    },
  });

describe('remind', () => {
  describe('edge cases', () => {
    it('never fails the session when git is unreadable: exit 0, nothing on stdout, the skip on stderr', () => {
      // ARRANGE
      const notARepository = mkdtempSync(path.join(tmpdir(), 'remind-'));
      dirs.push(notARepository);
      // ACT
      const result = remindFrom(notARepository);
      // ASSERT
      expect(result.status).toBe(0);
      expect(result.stdout).toBe('');
      expect(result.stderr).toContain('episode reminder skipped');
    });
  });
});
