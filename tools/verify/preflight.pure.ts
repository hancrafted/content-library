export interface CheckoutFacts {
  nodeModules: 'directory' | 'symlink' | 'missing';
  hooksInstalled: boolean;
  archgateTotal: number;
  coreBare: boolean;
  driveBindingProblem: string | null;
}

export const HEALTHY_CHECKOUT: CheckoutFacts = {
  nodeModules: 'directory',
  hooksInstalled: true,
  archgateTotal: 1,
  coreBare: false,
  driveBindingProblem: null,
};

export interface Violation {
  id: string;
  problem: string;
  fix: string;
}

type Check = Violation & { fails: (facts: CheckoutFacts) => boolean };

const CHECKS: Check[] = [
  {
    id: 'node-modules-symlink',
    fails: (facts) => facts.nodeModules === 'symlink',
    problem: 'node_modules is a symlink; Turbopack, mh check and the build refuse it.',
    fix: 'Remove the symlink and run `npm ci`, or recreate the worktree with `npm run wt:new <name>`.',
  },
  {
    id: 'node-modules-missing',
    fails: (facts) => facts.nodeModules === 'missing',
    problem: 'node_modules is missing; nothing in verify can run.',
    fix: 'Run `npm ci` in this checkout.',
  },
  {
    id: 'hooks-missing',
    fails: (facts) => !facts.hooksInstalled,
    problem: 'Husky hooks are not installed in this checkout, so commits and pushes run unguarded.',
    fix: 'Run `npx husky` in this checkout (`npm run wt:new` does it for new worktrees).',
  },
  {
    id: 'archgate-empty',
    fails: (facts) => facts.archgateTotal === 0,
    problem: 'archgate ran zero checks, so a pass proves nothing.',
    fix: 'Run `npm run archgate:full -- --verbose` and see why no rule ran; in CI, check out with fetch-depth 0.',
  },
  {
    id: 'core-bare',
    fails: (facts) => facts.coreBare,
    problem: 'core.bare=true is set on a checkout that has a working tree; git status, commit and worktrees misbehave.',
    fix: 'Run `git config core.bare false` in the main checkout.',
  },
  {
    id: 'drive-binding',
    fails: (facts) => facts.driveBindingProblem !== null,
    problem: 'the drive Binding names a skill that is not installed (`drive setup --check` fails).',
    fix: 'Rename or remove the binding in docs/drive/binding.yml, then rerun `npm run preflight`.',
  },
];

export function findViolations(facts: CheckoutFacts): Violation[] {
  return CHECKS.filter((check) => check.fails(facts)).map(({ id, problem, fix }) => ({ id, problem, fix }));
}
