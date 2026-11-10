// `node scripts/grade.ts <page.html>`: grades one decision page against every check in checks/ at 1440 and
// 1024 px with networking blocked. Prints the report as JSON; exits 0 when every check passes or skips, 1 when
// one fails, 2 when the page cannot be graded.
import { existsSync } from 'node:fs';
import { loadChecks } from './grader/registry.ts';
import { gradeFile, launch } from './grader/run.ts';

const [file, ...extra] = process.argv.slice(2);
if (file === undefined || extra.length > 0 || !existsSync(file)) {
  console.error('usage: node scripts/grade.ts <page.html>');
  process.exit(2);
}

const browser = await launch();
try {
  const report = await gradeFile(browser, await loadChecks(), file);
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.pass ? 0 : 1;
} catch (error) {
  console.error(`cannot grade ${file}: ${(error as Error).message}`);
  process.exitCode = 2;
} finally {
  await browser.close();
}
