import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { envProblem, parseCredentials } from './apply.pure.ts';
import { fail, REPO_ROOT as ROOT } from './command.ts';
import { connect, type YoutubeClient } from './youtube-client.ts';

const ENV_FILE = '.env';

function git(...args: string[]): boolean {
  return spawnSync('git', args, { cwd: ROOT, stdio: 'ignore' }).status === 0;
}

export async function connectFromEnv(): Promise<YoutubeClient> {
  const envPath = path.join(ROOT, ENV_FILE);
  const problem = envProblem({
    exists: existsSync(envPath),
    tracked: git('ls-files', '--error-unmatch', ENV_FILE),
    ignored: git('check-ignore', '-q', ENV_FILE),
  });
  if (problem) fail(problem);
  const credentials = parseCredentials(readFileSync(envPath, 'utf8'));
  if ('missing' in credentials) fail(`.env lacks ${credentials.missing.join(', ')}`);
  return connect(credentials.value);
}
