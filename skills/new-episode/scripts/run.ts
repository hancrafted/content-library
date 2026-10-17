// `npm run episode:run -- <slug> <command> ...`: the run-scoped commands (see run-commands.ts for what each does).
// This file only reads argv and the session id and prints the result.
import { runCommand } from './run-commands.ts';
import { USAGE } from './run-help.pure.ts';
import { realServers } from './servers.ts';

const [slug, ...argv] = process.argv.slice(2);
if (!slug || argv.length === 0) {
  console.error(USAGE);
  process.exit(1);
}
const result = runCommand(
  { root: '.', slug, sessionId: process.env.CLAUDE_CODE_SESSION_ID ?? process.env.SESSION_ID, servers: realServers },
  argv,
);
if (result.ok) console.log(result.output);
else {
  console.error(`✖ ${result.error}`);
  process.exitCode = 1;
}
