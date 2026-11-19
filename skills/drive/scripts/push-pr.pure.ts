export type BranchPrState = 'none' | 'open' | 'merged';

export function branchPrState(pulls: readonly { number: number; state: string }[]): BranchPrState {
  if (pulls.some((pull) => pull.state === 'OPEN')) return 'open';
  return pulls.some((pull) => pull.state === 'MERGED') ? 'merged' : 'none';
}

export function refuseMerged(branch: string, state: BranchPrState): string | null {
  return state === 'merged'
    ? `the PR of ${branch} has merged; branch anew from the base branch (drive worktree new) instead of pushing more commits here`
    : null;
}

export function openingBody(spec: number, tickets: readonly number[]): string {
  return [`Spec: #${spec}`, '', ...tickets.map((ticket) => `Closes #${ticket}`)].join('\n');
}

export function missingCloses(body: string, tickets: readonly number[]): number[] {
  const closed = new Set([...body.matchAll(/^Closes #(\d+)\s*$/gim)].map((found) => Number(found[1])));
  return tickets.filter((ticket) => !closed.has(ticket));
}
