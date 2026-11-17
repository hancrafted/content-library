import { needsBuild } from './needs-build.pure.ts';

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
const paths = Buffer.concat(chunks).toString().split('\n').filter(Boolean);
process.exit(needsBuild(paths) ? 0 : 1);
