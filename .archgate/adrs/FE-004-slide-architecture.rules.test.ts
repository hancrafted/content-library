/// <reference path="../rules.d.ts" />

import { describe, expect, it } from 'vitest';
import ruleSet from './FE-004-slide-architecture.rules';

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

const SLIDE = 'src/episodes/demo/slides/loop/slide.tsx';

async function run(files: Record<string, string>) {
  const violations: Reported[] = [];
  const ctx = {
    projectRoot: '/repo',
    scopedFiles: Object.keys(files),
    changedFiles: [],
    async glob(pattern: string) {
      const re = globToRegExp(pattern);
      return Object.keys(files).filter((file) => re.test(file));
    },
    async readFile(path: string) {
      if (path in files) return files[path];
      throw new Error(`ENOENT: ${path}`);
    },
    async readJSON(path: string) {
      return JSON.parse(files[path]);
    },
    report: {
      violation: (detail: Reported) => violations.push(detail),
      warning: () => {},
      info: () => {},
    },
  } as unknown as RuleContext;
  await ruleSet.rules['no-retired-tone'].check(ctx);
  return violations;
}

describe('no-retired-tone', () => {
  it('fails a tone declaration in a Slide presentation', async () => {
    // ARRANGE
    const files = { [SLIDE]: "export default {\n  presentation: {\n    tone: 'inverse',\n  },\n};\n" };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ file: SLIDE, line: 3 });
  });

  it('fails data-tone-flip anywhere in Episode code', async () => {
    // ARRANGE
    const files = { 'src/episodes/components/x/x.module.css': '[data-tone-flip] {\n  color: red;\n}\n' };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toHaveLength(1);
  });

  it('fails a --foreground key in a presentation style', async () => {
    // ARRANGE
    const files = { [SLIDE]: "export default {\n  presentation: { style: { '--foreground': 'white' } },\n};\n" };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toHaveLength(1);
  });

  it('fails a --muted-foreground key in a SlidePresentation constant', async () => {
    // ARRANGE
    const files = {
      'src/episodes/components/slide-master/standard-looks.ts':
        "export const look: SlidePresentation = {\n  style: { '--muted-foreground': 'silver' },\n};\n",
    };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toHaveLength(1);
  });

  it('passes inverse and surface declarations and the layout offsets', async () => {
    // ARRANGE
    const files = {
      [SLIDE]:
        "export default {\n  presentation: {\n    inverse: true,\n    surface: { kind: 'solid' },\n    style: { '--slide-space-after': '265px' },\n  },\n};\n",
    };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('ignores a tone field or --foreground key outside a presentation', async () => {
    // ARRANGE
    const files = {
      [SLIDE]: "const BOARDS = [{ tone: 'ai' }];\nconst ink = { '--foreground': 'white' };\n",
    };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toEqual([]);
  });

  it('ignores test files', async () => {
    // ARRANGE
    const files = { 'src/episodes/demo/slides/loop/slide.test.ts': "presentation: { tone: 'x' }" };
    // ACT
    const violations = await run(files);
    // ASSERT
    expect(violations).toEqual([]);
  });
});
