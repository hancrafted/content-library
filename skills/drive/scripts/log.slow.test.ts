import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseLog } from './log.pure.ts';
import { projectSlug } from './transcript.ts';

for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];

const SCRIPTS = import.meta.dirname;
const node = (script: string, args: string[], run: { cwd: string; env?: Record<string, string>; input?: string }) =>
  spawnSync(process.execPath, [path.join(SCRIPTS, script), ...args], {
    cwd: run.cwd,
    encoding: 'utf8',
    input: run.input,
    env: { ...process.env, ...run.env },
  });

function repo(branch: string): string {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'drive-log-')));
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd: root });
  git('init', '-q', '-b', 'main');
  git('commit', '-q', '--allow-empty', '-m', 'init');
  git('checkout', '-q', '-b', branch);
  return root;
}

const logOf = (root: string, topic: string) =>
  parseLog(readFileSync(path.join(root, '.scratch', topic, 'drive.log.jsonl'), 'utf8'));

describe('drive event log', () => {
  it('appends one line per command with its exit and error, under the topic of the branch', () => {
    // ARRANGE
    const root = repo('chore/sweep--1-a');
    // ACT
    node('drive.ts', ['nonsense'], { cwd: root });
    node('drive.ts', ['learnings', 'check'], { cwd: root });
    // ASSERT
    const [first, second] = logOf(root, 'sweep');
    expect(first).toMatchObject({ cmd: 'nonsense', branch: 'chore/sweep--1-a', exit: 1 });
    expect((first as { result: string }).result).toContain("unknown group 'nonsense'");
    expect(second).toMatchObject({ cmd: 'learnings check' });
  });

  it('does not log on a branch without a topic, and never fails the command', () => {
    // ARRANGE
    const root = repo('main2');
    // ACT
    const result = node('drive.ts', ['learnings', 'check'], { cwd: root });
    // ASSERT
    expect(result.status).toBe(0);
    expect(() => readFileSync(path.join(root, '.scratch'))).toThrow();
  });
});

describe('claude adapter hook', () => {
  it('logs the session, transcript path and branch of a Subagent start', () => {
    // ARRANGE
    const root = repo('chore/sweep--2-b');
    const payload = JSON.stringify({ session_id: 's1', transcript_path: '/t/s1.jsonl', cwd: root, agent_id: 'a1' });
    // ACT
    const result = node('claude-adapter.ts', ['start'], { cwd: root, input: payload });
    // ASSERT
    expect(result.status).toBe(0);
    expect(logOf(root, 'sweep')[0]).toMatchObject({
      event: 'subagent-start',
      session: 's1',
      transcript: '/t/s1.jsonl',
      branch: 'chore/sweep--2-b',
    });
  });
});

describe('drive transcript', () => {
  it('prints the trimmed session in local time and only new lines with --since-last', () => {
    // ARRANGE
    const root = repo('chore/sweep--3-c');
    const home = realpathSync(mkdtempSync(path.join(tmpdir(), 'drive-home-')));
    const dir = path.join(home, '.claude', 'projects', projectSlug(root));
    mkdirSync(dir, { recursive: true });
    copyFileSync(path.join(SCRIPTS, 'fixtures', 'session-93f19e8f.trimmed.jsonl'), path.join(dir, 'abc.jsonl'));
    // ACT
    const all = node('drive.ts', ['transcript', 'abc'], { cwd: root, env: { HOME: home } });
    const first = node('drive.ts', ['transcript', 'abc', '--since-last'], { cwd: root, env: { HOME: home } });
    const second = node('drive.ts', ['transcript', 'abc', '--since-last'], { cwd: root, env: { HOME: home } });
    // ASSERT
    expect(all.stdout).toContain('what twekas?');
    expect(all.stdout).toContain('failed (null)');
    expect(all.stdout).toContain('has merge conflicts');
    expect(first.stdout).toBe(all.stdout);
    expect(second.stdout).toBe('');
  });
});
