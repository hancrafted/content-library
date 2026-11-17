/// <reference path="../rules.d.ts" />

const PROVENANCE = '(GEN-004 [tech-debt-links-issue])';
const SOURCE_GLOBS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.mjs',
  '**/*.cjs',
  '**/*.css',
  '**/*.sh',
  '**/*.yml',
  '**/*.yaml',
];

const MARKER_RE = /(?:\/\/|\/\*|#)[ \t]*tech-debt\b/;
const THIS_REPO_ISSUE = 'https://github\\.com/hancrafted/content-library/issues/\\d+';
const ANY_ISSUE_LINK = /https?:\/\/\S+\/issues\/\d+/;
const CSS_EXTENSION = /\.css$/;
const LINE_POINTER = new RegExp(`^\\s*(?://|#)[ \\t]*tech-debt: ${THIS_REPO_ISSUE}\\s*$`);
const CSS_POINTER = new RegExp(`^\\s*/\\*[ \\t]*tech-debt: ${THIS_REPO_ISSUE}[ \\t]*\\*/\\s*$`);

const POINTER_FORM = 'tech-debt: https://github.com/hancrafted/content-library/issues/<n>';
const ISSUE_HOLDS = 'the issue holds the cost and the undo';

function pointerForm(file: string): string {
  if (CSS_EXTENSION.test(file)) return `/* ${POINTER_FORM} */`;
  return /\.ya?ml$|\.sh$/.test(file) ? `# ${POINTER_FORM}` : `// ${POINTER_FORM}`;
}

function finding(file: string, line: string): string | null {
  const pointer = CSS_EXTENSION.test(file) ? CSS_POINTER : LINE_POINTER;
  if (pointer.test(line)) return null;
  const form = `\`${pointerForm(file)}\` on its own line`;
  if (!ANY_ISSUE_LINK.test(line))
    return `tech-debt marker without an issue link — file the issue, then write ${form}; ${ISSUE_HOLDS} ${PROVENANCE}.`;
  return `tech-debt fence is a pointer, not prose — write ${form}, nothing else; ${ISSUE_HOLDS} ${PROVENANCE}.`;
}

export default {
  rules: {
    'tech-debt-links-issue': {
      description:
        "Every tech-debt fence is a bare pointer to this repo's issue on its own line, in // or # form (/* */ in CSS). An accepted shortcut is fenced, marked and filed; the issue holds the cost and the undo, the pointer only the location.",
      severity: 'error',
      async check(ctx) {
        const scoped = new Set(ctx.scopedFiles);
        for (const glob of SOURCE_GLOBS) {
          for (const hit of await ctx.grepFiles(MARKER_RE, glob)) {
            if (!scoped.has(hit.file)) continue;
            const message = finding(hit.file, hit.content);
            if (message === null) continue;
            ctx.report.violation({ message, file: hit.file, line: hit.line });
          }
        }
      },
    },
  },
} satisfies RuleSet;
