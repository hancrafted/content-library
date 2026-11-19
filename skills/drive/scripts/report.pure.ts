export const CRITERIA_HEADING = '## Acceptance criteria';
export const TEMPLATE_LINE = '- [x] <acceptance criterion> — <evidence>';

export function reportPathFor(branch: string): string | null {
  const split = branch.indexOf('--');
  if (split === -1) return null;
  const task = branch.slice(split + 2);
  const slug = branch.slice(0, split).split('/').pop() ?? '';
  if (task === '' || slug === '') return null;
  return `.scratch/${slug}/${task}.report.md`;
}

function criteriaLines(report: string): string[] | null {
  const lines = report.split('\n');
  const start = lines.findIndex((line) => line.trim().toLowerCase() === CRITERIA_HEADING.toLowerCase());
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^#{1,2} /.test(line));
  return (end === -1 ? rest : rest.slice(0, end))
    .map((line) => line.trim())
    .filter((line) => /^- \[[ xX]\]/.test(line));
}

const DEFERRAL = /deferred:\s*https?:\/\/\S+/;

export function unmetCriteria(report: string): string[] {
  const criteria = criteriaLines(report);
  if (criteria === null)
    return [`the report has no "${CRITERIA_HEADING}" section; add it, one line per criterion: ${TEMPLATE_LINE}`];
  if (criteria.length === 0) return [`"${CRITERIA_HEADING}" has no criterion lines; add them as: ${TEMPLATE_LINE}`];
  return criteria
    .filter((line) => line.startsWith('- [ ]') && !DEFERRAL.test(line))
    .map((line) => `unchecked without "deferred: <ticket url>": ${line}`);
}
