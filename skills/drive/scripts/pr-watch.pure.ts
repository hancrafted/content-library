export const DRIVE_MARKER = '<!-- drive -->';

interface Remark {
  id: string;
  body: string;
}

export interface InlineRemark extends Remark {
  path: string;
  line: number | null;
}

export interface PullRequestView {
  state: string;
  mergeCommit: { oid: string } | null;
  reviews: (Remark & { state?: string })[];
  comments: Remark[];
  reviewComments: InlineRemark[];
}

export type Verdict = { exit: 0; line: string } | { exit: 2; line: string } | { exit: 3; line: string } | null;

const isOperatorRemark = (remark: Remark): boolean => !remark.body.trimStart().startsWith(DRIVE_MARKER);

const allRemarks = (view: PullRequestView): (Remark & { state?: string; path?: string; line?: number | null })[] => [
  ...view.reviews,
  ...view.comments,
  ...view.reviewComments,
];

export function idsOf(view: PullRequestView): Set<string> {
  return new Set(allRemarks(view).map((remark) => remark.id));
}

function describeRemark(remark: Remark & { state?: string; path?: string; line?: number | null }): string {
  const body = remark.body.trim();
  const text = body === '' ? `(${remark.state ?? 'review'} without a body)` : body;
  if (remark.path === undefined) return text;
  return `${remark.path}${remark.line == null ? '' : `:${remark.line}`} ${text}`;
}

export function judge(view: PullRequestView, seen: ReadonlySet<string>): Verdict {
  if (view.state === 'MERGED') return { exit: 0, line: `merged ${view.mergeCommit?.oid ?? ''}`.trimEnd() };
  if (view.state === 'CLOSED') return { exit: 2, line: 'closed' };
  const fresh = allRemarks(view).filter((remark) => !seen.has(remark.id) && isOperatorRemark(remark));
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
      reviewComments: [],
    };
  } catch (error) {
    return {
      error: `gh pr view returned invalid JSON: ${(error as Error).message}`,
    };
  }
}

interface ApiReviewComment {
  id: number;
  body: string;
  path: string;
  line?: number | null;
  original_line?: number | null;
}

export function parseReviewComments(stdout: string): InlineRemark[] | { error: string } {
  try {
    const parsed = JSON.parse(stdout) as unknown[];
    const items = parsed.flat() as ApiReviewComment[];
    return items.map((item) => ({
      id: `rc${item.id}`,
      body: item.body,
      path: item.path,
      line: item.line ?? item.original_line ?? null,
    }));
  } catch (error) {
    return { error: `gh api returned invalid JSON: ${(error as Error).message}` };
  }
}
