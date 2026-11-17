// decision: ARCH-003 §4.4
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '../..');
const PAGES = '2026-11-16-cyberforum-akademie-hands-on';
const SEVERAL_WORKERS = '4';
const scratch = mkdtempSync(path.join(tmpdir(), 'art-parallel-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const baked = new Map<string, Record<string, string>>();

function bake(workers: string) {
  const done = baked.get(workers);
  if (done !== undefined) return done;
  const out = path.join(scratch, `workers-${workers}`);
  execFileSync('node', ['tools/art/art.ts', '--workers', workers, '--out', out, '--only', PAGES], {
    cwd: ROOT,
    stdio: 'pipe',
  });
  const files = Object.fromEntries(
    readdirSync(out)
      .sort()
      .map((file) => [file, readFileSync(path.join(out, file), 'utf8')]),
  );
  baked.set(workers, files);
  return files;
}

// Each bake is seconds of real work; the lane's 60 s test timeout is too short for two in a row.
const TIMEOUT = 180_000;

describe('success cases', () => {
  it(
    'writes byte-identical art files and manifest whatever the worker count',
    () => {
      // ARRANGE
      const manifest = 'manifest.json';
      // ACT
      const one = bake('1');
      const several = bake(SEVERAL_WORKERS);
      // ASSERT
      expect(Object.keys(one)).toContain(manifest);
      expect(Object.keys(one).length).toBeGreaterThan(1);
      expect(several).toEqual(one);
    },
    TIMEOUT,
  );
});

describe('failure cases', () => {
  it('refuses a worker count that is not a positive whole number', () => {
    // ARRANGE
    const run = () =>
      execFileSync('node', ['tools/art/art.ts', '--workers', '0', '--out', path.join(scratch, 'bad')], {
        cwd: ROOT,
        stdio: 'pipe',
      });
    // ACT / ASSERT
    expect(run).toThrow(/--workers/);
  });
});

describe('edge cases', () => {
  it(
    'bakes the same files when there are more workers than chunks of Slides',
    () => {
      // ARRANGE
      const moreWorkersThanChunks = '64';
      // ACT
      const one = bake('1');
      const oversized = bake(moreWorkersThanChunks);
      // ASSERT
      expect(oversized).toEqual(one);
    },
    TIMEOUT,
  );
});
