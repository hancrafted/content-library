// `npm run episode:approve -- <file>`: Han's approval of a staging file at its gate. Appends
// `{ by: human:han, at: <now UTC> }` to the file's `verified` list; never typed by hand.
import { readFileSync, writeFileSync } from 'node:fs';
import { appendVerified, HUMAN } from './verified.pure.ts';

const file = process.argv[2];
if (!file) {
  console.error('✖ usage: npm run episode:approve -- <file>');
  process.exit(1);
}
const at = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
writeFileSync(file, appendVerified(readFileSync(file, 'utf8'), { by: HUMAN, at }));
console.log(`✔ ${file}: verified by ${HUMAN} at ${at}`);
