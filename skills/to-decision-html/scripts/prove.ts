// `node scripts/prove.ts`: grades every fixture in the browser and confirms each proves what its name claims: a
// `valid-<mode>` page fails no check, a `<check-id>--<defect>` page fails that check and no other. Prints one
// proof per fixture as JSON; exits 1 when any fixture proves nothing.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fixtureNames, fixturePage } from './grader/fixtures.ts';
import { loadChecks } from './grader/registry.ts';
import { proofOf, type Proof } from './grader/report.pure.ts';
import { gradeFile, launch } from './grader/run.ts';

const checks = await loadChecks();
const dir = mkdtempSync(path.join(tmpdir(), 'decision-page-fixtures-'));
const browser = await launch();
const proofs: Proof[] = [];
try {
  for (const name of fixtureNames()) {
    const file = path.join(dir, `${name}.html`);
    writeFileSync(file, fixturePage(name));
    proofs.push(proofOf(name, await gradeFile(browser, checks, file)));
  }
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}
console.log(JSON.stringify(proofs, null, 2));
process.exitCode = proofs.every((proof) => proof.proves) ? 0 : 1;
