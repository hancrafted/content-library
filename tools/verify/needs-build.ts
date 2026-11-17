// CI's export gate: reads changed paths, one per line, from stdin and exits 0 when the export needs a build, 1 when it
// does not. CI's `export` job runs `git diff --name-only <merge-base> HEAD | npm run -s verify:needs-build`; pre-push
// asks `needsBuild` directly, through verify's push plan.
import { needsBuild } from './needs-build.pure.ts';

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
const paths = Buffer.concat(chunks).toString().split('\n').filter(Boolean);
process.exit(needsBuild(paths) ? 0 : 1);
