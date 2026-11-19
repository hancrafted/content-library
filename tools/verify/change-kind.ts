import { changeKind } from './change-kind.pure.ts';

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
const paths = Buffer.concat(chunks).toString().split('\n').filter(Boolean);
const { build, docsOnly } = changeKind(paths);
console.log(`build=${build}\ndocs-only=${docsOnly}`);
