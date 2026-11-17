import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SCRIPT = path.resolve(import.meta.dirname, 'grade-page.ts');

describe('grade-page', () => {
  describe('failure cases', () => {
    it('names an unknown option before printing the usage, and exits 2', () => {
      // ARRANGE
      const args = ['--no-such-option', 'page.html'];
      // ACT
      const result = spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' });
      // ASSERT
      expect(result.status).toBe(2);
      expect(result.stderr).toContain('--no-such-option');
      expect(result.stderr).toContain('usage: node scripts/grade-page.ts');
    });
  });
});
