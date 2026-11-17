/// <reference path="../rules.d.ts" />

import { describe, expect, it } from 'vitest';
import ruleSet from './GEN-004-escalated-tech-debt.rules';
import commentsRuleSet from './GEN-006-comments.rules';

interface Reported {
  message: string;
  file?: string;
  line?: number;
}

function globToRegExp(pattern: string): RegExp {
  const segments = pattern.split('/');
  let body = '';
  segments.forEach((segment, index) => {
    const separator = index === 0 ? '' : '/';
    if (segment === '**') {
      body += index === segments.length - 1 ? `${separator}.*` : `${separator}(?:[^/]+/)*`;
      return;
    }
    const literal = segment
      .split('*')
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
      .join('[^/]*');
    body += segments[index - 1] === '**' ? literal : separator + literal;
  });
  return new RegExp(`^${body}$`);
}

function makeCtx(files: Record<string, string>, scoped: string[] = Object.keys(files)) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: scoped,
    changedFiles: [],
    async glob(pattern: string) {
      const re = globToRegExp(pattern);
      return Object.keys(files).filter((f) => re.test(f));
    },
    async grepFiles(pattern: RegExp, fileGlob: string) {
      const re = globToRegExp(fileGlob);
      const matches: GrepMatch[] = [];
      for (const [file, content] of Object.entries(files)) {
        if (!re.test(file)) continue;
        content.split('\n').forEach((text, index) => {
          const found = text.match(pattern);
          if (found) {
            matches.push({ file, line: index + 1, column: (found.index ?? 0) + 1, content: text });
          }
        });
      }
      return matches;
    },
    async readFile(path: string) {
      if (path in files) return files[path];
      throw new Error(`ENOENT: ${path}`);
    },
    report: {
      violation: (detail: Reported) => violations.push(detail),
      warning: () => {},
      info: () => {},
    },
  } as unknown as RuleContext;
  return { ctx, violations };
}

const FILE = 'src/shared/lib/legacy-parser.ts';
const ISSUE = 'https://github.com/hancrafted/content-library/issues/317';
const WORKFLOW = '.github/workflows/ci.yml';

const ASSEMBLED_MARK = `tech-${'debt'}`;

const rule = ruleSet.rules['tech-debt-links-issue'];

async function run(files: Record<string, string>) {
  const { ctx, violations } = makeCtx(files);
  await rule.check(ctx);
  return violations;
}

describe('tech-debt-links-issue', () => {
  it('passes on a source file with no marker', async () => {
    // ARRANGE
    const files = { [FILE]: 'export const answer = 42;\n' };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toEqual([]);
  });

  const pointers: [label: string, file: string, source: string][] = [
    ['line pointer', FILE, `// ${ASSEMBLED_MARK}: ${ISSUE}\nexport const a = 1;\n`],
    ['indented line pointer', FILE, `function f() {\n  // ${ASSEMBLED_MARK}: ${ISSUE}\n  return 1;\n}\n`],
    ['YAML hash pointer', WORKFLOW, `jobs:\n  build:\n    # ${ASSEMBLED_MARK}: ${ISSUE}\n    runs-on: ubuntu-latest\n`],
    ['shell hash pointer', 'tools/sync.sh', `# ${ASSEMBLED_MARK}: ${ISSUE}\nrsync -a a b\n`],
    ['CSS block pointer', 'src/shared/ui/a.module.css', `/* ${ASSEMBLED_MARK}: ${ISSUE} */\n.a { color: red; }\n`],
  ];

  for (const [label, file, source] of pointers) {
    it(`passes on a ${label} holding only this repo's issue URL`, async () => {
      // ARRANGE
      const files = { [file]: source };
      // ACT
      const violations = await run(files);
      // ASSERT
      expect(violations).toEqual([]);
    });
  }

  const prose: [label: string, file: string, source: string][] = [
    ['old prose-style fence', FILE, `// ${ASSEMBLED_MARK}: fenced parser, ${ISSUE}\n`],
    ['prose after the URL', FILE, `// ${ASSEMBLED_MARK}: ${ISSUE} fenced parser\n`],
    ['YAML prose-style fence', WORKFLOW, `# ${ASSEMBLED_MARK}: pinned runner, ${ISSUE}\n`],
    ['pointer beside code', FILE, `const a = 1; // ${ASSEMBLED_MARK}: ${ISSUE}\n`],
    ['pointer to another repo', FILE, `// ${ASSEMBLED_MARK}: https://github.com/org/repo/issues/12\n`],
  ];

  for (const [label, file, source] of prose) {
    it(`fails on a ${label}, naming the pointer form`, async () => {
      // ARRANGE
      const files = { [file]: source };
      // ACT
      const violations = await run(files);
      // ASSERT
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain(
        `${ASSEMBLED_MARK}: https://github.com/hancrafted/content-library/issues/<n>`,
      );
      expect(violations[0].message).toContain('the issue holds the cost');
    });
  }

  const unlinked: [label: string, file: string, source: string][] = [
    ['line comment', FILE, `// ${ASSEMBLED_MARK}: fenced parser\n`],
    ['block comment', FILE, `/* ${ASSEMBLED_MARK}: fenced parser */\n`],
    ['hash comment', 'tools/sync.sh', `# ${ASSEMBLED_MARK}: fenced script\n`],
    ['YAML hash comment', WORKFLOW, `# ${ASSEMBLED_MARK}:\n`],
    ['bare line marker', FILE, `// ${ASSEMBLED_MARK}\n`],
    ['marker beside code', FILE, `const a = 1; // ${ASSEMBLED_MARK}: fenced\n`],
    ['bare issue number, no link', FILE, `// ${ASSEMBLED_MARK}: see #317\n`],
  ];

  for (const [label, file, source] of unlinked) {
    it(`fails on a ${label} without an issue link`, async () => {
      // ARRANGE
      const files = { [file]: source };
      // ACT
      const violations = await run(files);
      // ASSERT
      expect(violations).toHaveLength(1);
      expect(violations[0].file).toBe(file);
      expect(violations[0].message).toContain('file the issue');
    });
  }

  it('reports the line the marker sits on', async () => {
    // ARRANGE
    const expectedLine = 3;
    const files = { [FILE]: `export const a = 1;\nexport const b = 2;\n// ${ASSEMBLED_MARK}: fenced\n` };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations[0].line).toBe(expectedLine);
  });

  it('passes on prose naming the marker away from the comment opener', async () => {
    // ARRANGE
    const files = { [FILE]: `// Every ${ASSEMBLED_MARK} comment links an issue.\nexport const a = 1;\n` };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('leaves a file outside the ADR scope alone', async () => {
    // ARRANGE
    const outside = '.archgate/adrs/XX-001-probe.rules.test.ts';
    const files = { [outside]: `const s = '// ${ASSEMBLED_MARK}: ${ISSUE}\\nexport const a = 1;';\n` };
    const { ctx, violations } = makeCtx(files, []);
    // ACT
    await rule.check(ctx);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('leaves a markdown file alone', async () => {
    // ARRANGE
    const files = { 'docs/notes.md': `# ${ASSEMBLED_MARK}: heading, no link\n` };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('carries the GEN-004 provenance tag in its messages', async () => {
    // ARRANGE
    const provenance = '(GEN-004 [tech-debt-links-issue])';
    const files = { [FILE]: `// ${ASSEMBLED_MARK}: fenced\n` };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations[0].message).toContain(provenance);
  });

  describe('agrees with the comments rule on a TS pointer', () => {
    async function commentsVerdict(source: string): Promise<boolean> {
      const { ctx, violations } = makeCtx({ [FILE]: source });
      await commentsRuleSet.rules['no-comments'].check(
        Object.assign(ctx, { scopedFiles: [FILE], changedFiles: [FILE] }),
      );
      return violations.every((v) => v.file !== FILE);
    }

    const samples: [label: string, source: string][] = [
      ['bare pointer', `// ${ASSEMBLED_MARK}: ${ISSUE}\nexport const a = 1;\n`],
      ['prose-style fence', `// ${ASSEMBLED_MARK}: fenced parser, ${ISSUE}\nexport const a = 1;\n`],
      ['text after the URL', `// ${ASSEMBLED_MARK}: ${ISSUE} fenced parser\nexport const a = 1;\n`],
      ['another repo', `// ${ASSEMBLED_MARK}: https://github.com/org/repo/issues/12\nexport const a = 1;\n`],
      ['no URL', `// ${ASSEMBLED_MARK}:\nexport const a = 1;\n`],
    ];

    for (const [label, source] of samples) {
      it(`gives the same verdict on a ${label}`, async () => {
        // ARRANGE
        const files = { [FILE]: source };
        // ACT
        const passesHere = (await run(files)).length === 0;
        const passesThere = await commentsVerdict(source);
        // ASSERT
        expect(passesHere).toBe(passesThere);
      });
    }
  });
});
