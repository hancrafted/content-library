import { spawnSync } from 'node:child_process';

export function coreBareIsTrue(cwd: string): boolean {
  const configured = spawnSync('git', ['config', '--get', '--type=bool', 'core.bare'], { cwd, encoding: 'utf8' });
  return configured.stdout.trim() === 'true';
}
