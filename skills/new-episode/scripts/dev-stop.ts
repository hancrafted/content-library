// `npm run dev-stop -- <port>`: stops the server this worktree's Run started on <port> (its pid file under
// `.scratch/<slug>/servers/`), and nothing else.
import { stopServers } from '../../../src/pipeline/lib/servers.ts';

const port = Number(process.argv[2]);
if (!Number.isInteger(port)) {
  console.error('✖ usage: npm run dev-stop -- <port>');
  process.exit(1);
}
const stopped = stopServers('.', { port });
if (stopped.length === 0) {
  console.error(`✖ no server of this worktree's Run is recorded on port ${port}`);
  process.exit(1);
}
console.log(`✔ stopped the server on port ${port}`);
