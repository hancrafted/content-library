import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadWorkflow } from './workflow-loader.pure';

/*
 * docs/features/agentic-workflow.md carries a complete one-stage Workflow file, written from the guide alone. This
 * loads that block, so the guide cannot drift from the loader.
 */

const GUIDE = new URL('../../../../docs/features/agentic-workflow.md', import.meta.url);

const fixture = (): string => {
  const block = /```yaml\n(# guide-fixture\n[\s\S]*?)```/.exec(readFileSync(GUIDE, 'utf8'));
  if (!block?.[1]) throw new Error('The guide has no "# guide-fixture" yaml block.');
  return block[1];
};

describe('success cases', () => {
  it('loads the one-stage file the guide holds', () => {
    // ARRANGE
    const source = fixture();
    // ACT
    const result = loadWorkflow(source);
    // ASSERT
    expect('problems' in result ? result.problems : []).toEqual([]);
    expect('file' in result && result.file.stages).toHaveLength(1);
  });
});

describe('failure cases', () => {
  it('reports a marker the guide does not list', () => {
    // ARRANGE
    const source = fixture().replace('{{task}}', '{{nope}}');
    // ACT
    const result = loadWorkflow(source);
    // ASSERT
    expect('problems' in result && result.problems.join('\n')).toContain('unknown marker {{nope}}');
  });
});

describe('edge cases', () => {
  it('reports a template with front matter as a problem, not a throw', () => {
    // ARRANGE
    const source = fixture().replace(
      '  greeting: |\n    # <Greeting',
      '  greeting: |\n    ---\n    kind: greeting\n    ---\n    # <Greeting',
    );
    // ACT
    const result = loadWorkflow(source);
    // ASSERT
    expect('problems' in result && result.problems.join('\n')).toContain('Template "greeting" has front matter');
  });
});
