export const DRIVE_MARKER = '<!-- drive -->';

interface Remark {
  id: string;
  body: string;
}

export interface PullRequestView {
  state: string;
  mergeCommit: { oid: string } | null;
  reviews: (Remark & { state?: string })[];
  comments: Remark[];
}

export type Verdict = { exit: 0; line: string } | { exit: 2; line: string } | { exit: 3; line: string } | null;

const isOperatorRemark = (remark: Remark): boolean => !remark.body.trimStart().startsWith(DRIVE_MARKER);

export function idsOf(view: PullRequestView): Set<string> {
  return new Set([...view.reviews, ...view.comments].map((remark) => remark.id));
}

function describeRemark(remark: Remark & { state?: string }): string {
  const body = remark.body.trim();
  return body === '' ? `(${remark.state ?? 'review'} without a body)` : body;
}

export function judge(view: PullRequestView, seen: ReadonlySet<string>): Verdict {
  if (view.state === 'MERGED') return { exit: 0, line: `merged ${view.mergeCommit?.oid ?? ''}`.trimEnd() };
  if (view.state === 'CLOSED') return { exit: 2, line: 'closed' };
  const fresh = [...view.reviews, ...view.comments].filter(
    (remark) => !seen.has(remark.id) && isOperatorRemark(remark),
  );
  if (fresh.length === 0) return null;
  return { exit: 3, line: fresh.map(describeRemark).join('\n---\n') };
}

export function parseView(stdout: string): PullRequestView | { error: string } {
  try {
    const parsed = JSON.parse(stdout) as Partial<PullRequestView>;
    if (typeof parsed.state !== 'string') return { error: 'gh pr view returned no state' };
    return {
      state: parsed.state,
      mergeCommit: parsed.mergeCommit ?? null,
      reviews: parsed.reviews ?? [],
      comments: parsed.comments ?? [],
    };
  } catch (error) {
    return {
      error: `gh pr view returned invalid JSON: ${(error as Error).message}`,
    };
  }
}
