// The shell half shared by the `youtube:*` commands that call the YouTube Data API (`apply`, `pull`): checks the
// `.env` safety rule, reads the credentials and connects. Exits on any problem. Setup: tools/youtube/AGENTS.md.
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

/** A YouTube client authorised from the repo's `.env`; exits when the file is unsafe or incomplete. */
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
