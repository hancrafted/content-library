import { closesIn } from './pr-watch.pure.ts';

export type Phase = 'Define' | 'Reason' | 'Implement' | 'Verify' | 'Evolve' | 'Stopped';

export interface PrFact {
  number: number;
  state: 'OPEN' | 'MERGED' | 'CLOSED';
  isDraft: boolean;
}

export interface Facts {
  topic: string;
  integrationBranch: string | null;
  pushed: boolean;
  decisionPr: PrFact | null;
  integrationPr: PrFact | null;
  tickets: readonly number[];
  mergedTickets: readonly number[];
  lastLog: { t: string; cmd: string } | null;
}

export interface Standing {
  phase: Phase;
  next: string;
}

const allMerged = (facts: Facts): boolean =>
  facts.tickets.length > 0 && facts.tickets.every((ticket) => facts.mergedTickets.includes(ticket));

function verifyNext(pr: PrFact | null): string {
  if (pr === null) return 'run `drive push`: it opens the draft Integration PR';
  if (pr.isDraft) return `review and triage, then \`drive pr ready ${pr.number}\` once CI is green`;
  return `the Operator contests the triage and merges #${pr.number}`;
}

type Rule = (facts: Facts) => Standing | null;

const stopped = (kind: string, pr: PrFact | null): Standing | null =>
  pr?.state === 'CLOSED'
    ? { phase: 'Stopped', next: `${kind} PR #${pr.number} closed unmerged: tell the Operator` }
    : null;

const unmergedTickets = (facts: Facts): number[] =>
  facts.tickets.filter((ticket) => !facts.mergedTickets.includes(ticket));

const evolve: Rule = ({ integrationPr }) =>
  integrationPr?.state === 'MERGED'
    ? { phase: 'Evolve', next: 'run Fortify from the base branch, then clean up' }
    : null;

const define: Rule = ({ integrationBranch, pushed }) =>
  integrationBranch === null || !pushed
    ? { phase: 'Define', next: 'create and push the Integration branch, then grill' }
    : null;

const reason: Rule = ({ decisionPr }) =>
  decisionPr?.state === 'OPEN'
    ? {
        phase: 'Reason',
        next: `the Operator passes the Decision gate: merge #${decisionPr.number} (\`drive pr watch ${decisionPr.number}\`)`,
      }
    : null;

const grilling: Rule = (facts) =>
  facts.decisionPr?.state === 'MERGED' || facts.tickets.length > 0
    ? null
    : { phase: 'Define', next: 'settle the requirements, then write the Decision docs and tickets' };

const verify: Rule = (facts) => (allMerged(facts) ? { phase: 'Verify', next: verifyNext(facts.integrationPr) } : null);

const implement: Rule = (facts) => ({
  phase: 'Implement',
  next: `merge ${unmergedTickets(facts)
    .map((ticket) => `#${ticket}`)
    .join(', ')}, then \`drive push\``,
});

const RULES: readonly Rule[] = [
  evolve,
  (facts) => stopped('Decision', facts.decisionPr),
  (facts) => stopped('Integration', facts.integrationPr),
  define,
  reason,
  grilling,
  verify,
  implement,
];

export function derivePhase(facts: Facts): Standing {
  for (const rule of RULES) {
    const standing = rule(facts);
    if (standing !== null) return standing;
  }
  throw new Error('unreachable: the last rule always answers');
}

const prLine = (label: string, pr: PrFact | null): string => {
  if (pr === null) return `${label}: none`;
  return `${label}: #${pr.number} ${pr.state === 'OPEN' && pr.isDraft ? 'draft' : pr.state.toLowerCase()}`;
};

export function renderStatus(facts: Facts): string {
  const { phase, next } = derivePhase(facts);
  const branch =
    facts.integrationBranch === null
      ? 'none'
      : `${facts.integrationBranch} (${facts.pushed ? 'pushed' : 'not pushed'})`;
  const last = facts.lastLog === null ? 'no log' : `\`${facts.lastLog.cmd}\` at ${facts.lastLog.t}`;
  return [
    `Workflow ${facts.topic}: ${phase}`,
    `Integration branch: ${branch}`,
    prLine('Decision PR', facts.decisionPr),
    prLine('Integration PR', facts.integrationPr),
    `Tickets: ${facts.mergedTickets.filter((ticket) => facts.tickets.includes(ticket)).length}/${facts.tickets.length} merged`,
    `Last command: ${last}`,
    `Next stop: ${next}`,
  ].join('\n');
}

export function pickIntegrationBranch(branches: readonly string[], topic: string): string | null {
  const names = branches.map((name) => name.replace(/^origin\//, ''));
  return (
    names.find(
      (name) => name.endsWith(`/${topic}`) && !name.startsWith('decisions/') && name.split('/').length === 2,
    ) ?? null
  );
}

export function mergedTicketsOf(mergeSubjects: readonly string[], integrationBranch: string): number[] {
  const prefix = `Merge branch '${integrationBranch}--`;
  const numbers = mergeSubjects.flatMap((subject) => {
    const found = subject.startsWith(prefix) ? /^(\d+)-/.exec(subject.slice(prefix.length)) : null;
    return found === null ? [] : [Number(found[1])];
  });
  return [...new Set(numbers)];
}

export function ticketsOfBodies(integrationBody: string | null, decisionBody: string | null): number[] {
  const closed = closesIn(integrationBody ?? '');
  if (closed.length > 0) return closed;
  const section = /^## Tickets\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(decisionBody ?? '');
  const listed = [...(section?.[1] ?? '').matchAll(/^\s*-\s*#(\d+)/gm)].map((found) => Number(found[1]));
  return [...new Set(listed)];
}

export function lastCommand(entries: readonly { t?: string; cmd?: string }[]): { t: string; cmd: string } | null {
  const commands = entries.filter((entry) => typeof entry.cmd === 'string' && typeof entry.t === 'string');
  const last = commands.at(-1);
  return last === undefined ? null : { t: last.t as string, cmd: last.cmd as string };
}
