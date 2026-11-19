import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { run } from './git.ts';
import { logPath, parseLog } from './log.pure.ts';
import { mainRootOf } from './log.ts';
import { fail } from './project.ts';
import {
  type Facts,
  lastCommand,
  mergedTicketsOf,
  pickIntegrationBranch,
  type PrFact,
  renderStatus,
  ticketsOfBodies,
} from './status.pure.ts';

interface GhPr extends PrFact {
  headRefName: string;
  body: string;
}

function listPrs(cwd: string): GhPr[] {
  const fields = 'number,state,isDraft,headRefName,body';
  const result = run('gh', ['pr', 'list', '--state', 'all', '--limit', '200', '--json', fields], { cwd });
  if (result.status !== 0) return [];
  return JSON.parse(result.stdout) as GhPr[];
}

const branchesOf = (cwd: string): string[] => {
  const result = run('git', ['branch', '-a', '--format=%(refname:short)'], {
    cwd,
  });
  return result.status === 0 ? result.stdout.split('\n').filter(Boolean) : [];
};

function mergeSubjects(branch: string, cwd: string): string[] {
  const result = run('git', ['log', '--merges', '--format=%s', branch], {
    cwd,
  });
  return result.status === 0 ? result.stdout.split('\n') : [];
}

function readLog(topic: string, cwd: string): { t?: string; cmd?: string }[] {
  const root = mainRootOf(cwd);
  const logFile = root === null ? null : path.join(root, logPath(topic));
  return logFile !== null && existsSync(logFile)
    ? (parseLog(readFileSync(logFile, 'utf8')) as { t?: string; cmd?: string }[])
    : [];
}

function prFacts(topic: string, integrationBranch: string | null, cwd: string) {
  const prs = listPrs(cwd);
  return {
    decisionPr: prs.find((pr) => pr.headRefName === `decisions/${topic}`) ?? null,
    integrationPr: prs.find((pr) => pr.headRefName === integrationBranch) ?? null,
  };
}

function gather(topic: string, cwd: string): Facts {
  const branches = branchesOf(cwd);
  const integrationBranch = pickIntegrationBranch(branches, topic);
  const { decisionPr, integrationPr } = prFacts(topic, integrationBranch, cwd);
  const merged = (branch: string) => mergedTicketsOf(mergeSubjects(branch, cwd), branch);
  return {
    topic,
    integrationBranch,
    pushed: branches.includes(`origin/${integrationBranch}`),
    decisionPr,
    integrationPr,
    tickets: ticketsOfBodies(integrationPr?.body ?? null, decisionPr?.body ?? null),
    mergedTickets: integrationBranch === null ? [] : merged(integrationBranch),
    lastLog: lastCommand(readLog(topic, cwd)),
  };
}

export function runStatus(argv: readonly string[]): void {
  const [topic] = argv;
  if (topic === undefined || topic.startsWith('-')) fail('usage: drive status <topic>');
  console.log(renderStatus(gather(topic, process.cwd())));
}
