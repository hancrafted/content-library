import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.join(__dirname, '../..');
const OLD_FOLDER = ['docs', 'adr'].join('/') + '(?![a-z])';
const OLD_TERM = ['design', 'adr'].join('[- ]');
const FORBIDDEN = new RegExp(`${OLD_FOLDER}|${OLD_TERM}`, 'i');
const SKIPPED = [/^\.logs\//, /^\.agents\/skills\//, /^docs\/episodes\/[^/]+\/events\.jsonl$/];
const ALIAS_LINE = /^_Avoid_/;

function liveFiles(): string[] {
  const listed = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return listed
    .split('\0')
    .filter((file) => file !== '' && !SKIPPED.some((skip) => skip.test(file)))
    .filter((file) => existsSync(path.join(ROOT, file)) && lstatSync(path.join(ROOT, file)).isFile());
}

describe('the Decision record term', () => {
  it('leaves no live file naming the retired folder or the retired term', () => {
    const offenders: string[] = [];
    for (const file of liveFiles()) {
      readFileSync(path.join(ROOT, file), 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (FORBIDDEN.test(line) && !ALIAS_LINE.test(line)) offenders.push(`${file}:${index + 1}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
