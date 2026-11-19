import { checkTickets, parseTicket, taskBranchGlob } from './dispatch.pure.ts';
import { capture, git } from './git.ts';
import { fail } from './project.ts';

const USAGE =
  'usage: drive dispatch check [--base <integration branch>] <issue number…> (the base defaults to the current branch)';

interface Issue {
  state: string;
  body: string;
}

function readArgs(argv: readonly string[]): {
  base: string | null;
  issues: number[];
} {
  const [verb, ...rest] = argv;
  if (verb !== 'check') fail(USAGE);
  const baseAt = rest.indexOf('--base');
  const base = baseAt === -1 ? null : (rest[baseAt + 1] ?? fail(USAGE));
  const numbers = rest.filter((_, index) => baseAt === -1 || (index !== baseAt && index !== baseAt + 1));
  const issues = numbers.map(Number);
  if (issues.length === 0 || issues.some((n) => !Number.isInteger(n) || n < 1)) fail(USAGE);
  return { base, issues };
}

function readIssue(number: number): Issue {
  return JSON.parse(capture('gh', ['issue', 'view', String(number), '--json', 'state,body'])) as Issue;
}

function hasMergeCommit(base: string, glob: string, cwd: string): boolean {
  const prefix = glob.slice(0, -1);
  return capture('git', ['log', base, '--format=%s', '--fixed-strings', `--grep=Merge branch '${prefix}`], cwd) !== '';
}

function hasMergedWorkBranch(base: string, glob: string, cwd: string): boolean {
  const tip = (ref: string) => capture('git', ['rev-parse', ref], cwd);
  const branches = capture('git', ['branch', '--list', '--format=%(refname:short)', glob], cwd).split('\n');
  return branches.some(
    (branch) =>
      branch !== '' &&
      tip(branch) !== tip(base) &&
      git(cwd, ['merge-base', '--is-ancestor', branch, base]).status === 0,
  );
}

function isClosedOrTaskBranchMerged(base: string, cwd: string): (number: number) => boolean {
  return (number) => {
    if (readIssue(number).state === 'CLOSED') return true;
    const glob = taskBranchGlob(base, number);
    return hasMergeCommit(base, glob, cwd) || hasMergedWorkBranch(base, glob, cwd);
  };
}

export function runDispatch(argv: readonly string[]): void {
  const { base: given, issues } = readArgs(argv);
  const cwd = process.cwd();
  const base = given ?? capture('git', ['branch', '--show-current'], cwd);
  if (base === '') fail('detached HEAD: pass --base <integration branch>');
  const tickets = issues.map((number) => parseTicket(number, readIssue(number).body));
  const problems = checkTickets(tickets, isClosedOrTaskBranchMerged(base, cwd));
  if (problems.length > 0) fail(`dispatch check failed:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
  console.log(`✔ ${issues.map((n) => `#${n}`).join(', ')} may be dispatched together`);
}
