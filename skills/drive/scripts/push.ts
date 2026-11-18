import { spawnSync } from 'node:child_process';
import { capture, git } from './git.ts';
import { fail, loadConfig } from './project.ts';
import { parseLsRemote, pushedLine, remoteDiffersFrom } from './push.pure.ts';

function remoteTip(remote: string, branch: string, cwd: string): string | null {
  const result = git(cwd, ['ls-remote', remote, `refs/heads/${branch}`]);
  if (result.status !== 0) fail(`git ls-remote ${remote} ${branch} failed:\n${result.stderr}`);
  return parseLsRemote(result.stdout);
}

export function runPush(argv: readonly string[]): void {
  if (argv.length > 0) fail('usage: drive push (no arguments; run it inside the worktree to push)');
  const cwd = process.cwd();
  const branch = capture('git', ['branch', '--show-current'], cwd);
  if (branch === '') fail('detached HEAD: check out a branch first');
  const { remote } = loadConfig(capture('git', ['rev-parse', '--show-toplevel'], cwd)).worktree;
  const hasUpstream = git(cwd, ['rev-parse', '--abbrev-ref', `${branch}@{upstream}`]).status === 0;
  const before = remoteTip(remote, branch, cwd);
  const pushArgs = hasUpstream ? ['push', remote, branch] : ['push', '--set-upstream', remote, branch];
  const { status } = spawnSync('git', pushArgs, { cwd, stdio: 'inherit' });
  if (status !== 0) fail(`git ${pushArgs.join(' ')} failed (${status})`);
  const head = capture('git', ['rev-parse', 'HEAD'], cwd);
  const problem = remoteDiffersFrom({ branch, remote }, head, remoteTip(remote, branch, cwd));
  if (problem !== null) fail(problem);
  console.log(pushedLine(branch, before, head));
}
