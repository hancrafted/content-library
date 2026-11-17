/// <reference path="../rules.d.ts" />

// The lint config is the single source of truth for what this repo enforces; a directive comment
// forks that truth at one line and does it invisibly, since `npm run verify`
// stays green while the rule stops holding at that site.
// Self-contained by design: archgate forbids imports between rules files.
// decision: GEN-003 §1
const SRC_GLOB = 'src/**/*';

// A lint directive is only live as the FIRST token of a comment, so the
// opener must sit immediately before the keyword — prose naming a directive is
// not one, which is what keeps this ADR's own vocabulary writable. Matched
// textually rather than through ctx.ast(), so the ban reaches every language
// under src/, including files the linter is not configured to lint.
// `enable` rides along: once every disable is gone it is dead weight pointing
// at a suppression that is not there.
// decision: GEN-003 §1.1
const DIRECTIVE_RE = /(?:\/\/|\/\*)[ \t]*(?:eslint|oxlint)-(?:disable|enable)\b/;

export default {
  rules: {
    'no-eslint-disable': {
      description:
        'No file under src/ carries a lint directive comment — eslint-disable or oxlint-disable, their -line and -next-line variants, or the paired enable — in either the // or the /* */ form. A lint rule wrong for a class of files is turned off in the lint config behind a files: glob; a lint rule wrong at one site means the code is wrong.',
      severity: 'error',
      async check(ctx) {
        for (const hit of await ctx.grepFiles(DIRECTIVE_RE, SRC_GLOB)) {
          ctx.report.violation({
            message: `Inline lint suppression — delete the directive and fix the code, or turn the rule off in the lint config behind a files: glob carrying its reason (GEN-003 [no-eslint-disable]).`,
            file: hit.file,
            line: hit.line,
          });
        }
      },
    },
  },
} satisfies RuleSet;
