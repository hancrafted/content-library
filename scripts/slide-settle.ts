// `npm run slides:settle`: deletes every instance no edit has touched and lists the pool Slide again in its Episode
// (design-ADR 0016, Slide reuse rule 3), so no unchanged instance outlives its Run. An edited instance stays for
// Promotion. Run it at the end of a Run, from the repository root. The rules live in slide-settle.pure.ts.
import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatted, repo, root } from './slide-repo.ts';
import { planSettle } from './slide-settle.pure.ts';

const plan = await planSettle(repo, formatted);
for (const folder of plan.removals) {
  rmSync(join(root, folder), { recursive: true, force: true });
  console.log(`removed untouched instance ${folder}`);
}
for (const { path, text } of plan.edits) {
  writeFileSync(join(root, path), await formatted(path, text));
  console.log(`edited ${path}`);
}
for (const reason of plan.kept) console.log(`kept ${reason}`);
