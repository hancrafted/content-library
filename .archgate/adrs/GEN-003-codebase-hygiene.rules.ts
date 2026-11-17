/// <reference path="../rules.d.ts" />

// decision: GEN-003 §1
const SRC_GLOB = 'src/**/*';

// decision: GEN-003 §1.1
const DIRECTIVE_AS_FIRST_TOKEN_OF_COMMENT_INCLUDING_ENABLE_RE =
  /(?:\/\/|\/\*)[ \t]*(?:eslint|oxlint)-(?:disable|enable)\b/;

export default {
  rules: {
    'no-eslint-disable': {
      description:
        'No file under src/ carries a lint directive comment — eslint-disable or oxlint-disable, their -line and -next-line variants, or the paired enable — in either the // or the /* */ form. A lint rule wrong for a class of files is turned off in the lint config behind a files: glob; a lint rule wrong at one site means the code is wrong.',
      severity: 'error',
      async check(ctx) {
        for (const hit of await ctx.grepFiles(DIRECTIVE_AS_FIRST_TOKEN_OF_COMMENT_INCLUDING_ENABLE_RE, SRC_GLOB)) {
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
