// `node scripts/grade-page.ts <page.html>`: grades one decision page against every check in checks/ at 1440 and
// 1024 px with networking blocked. Prints the report as JSON; exits 0 when every check passes or skips, 1 when
// one fails, 2 when the page cannot be graded.
import { onePath } from './grader/cli.ts';
import { loadChecks } from './grader/registry.ts';
import { gradeFile, launch } from './grader/run.ts';

const file = onePath('node scripts/grade-page.ts <page.html>');
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
