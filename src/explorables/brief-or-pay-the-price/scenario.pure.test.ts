import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse, stringify } from 'yaml';
import { loadScenario } from './scenario.pure';
import type { Layout, Scenario } from './scenario.types';
import driveSource from './scenarios/drive.yml';

type Tree = Record<string, unknown>;

const GUIDE_PATH = 'docs/features/explorables/brief-or-pay-the-price-scenarios.md';
const guideFixture = (): string => /```yaml\n([\s\S]*?)```/.exec(readFileSync(GUIDE_PATH, 'utf8'))?.[1] ?? '';
const fixture = (): Tree => parse(guideFixture()) as Tree;

const parentOf = (tree: Tree, path: string): { parent: Tree; key: string } => {
  const keys = path.split('.');
  const key = keys.pop() as string;
  return { parent: keys.reduce<Tree>((at, each) => at[each] as Tree, tree), key };
};
const set = (tree: Tree, path: string, value: unknown): void => {
  const { parent, key } = parentOf(tree, path);
  parent[key] = value;
};
const drop = (tree: Tree, path: string): void => {
  const { parent, key } = parentOf(tree, path);
  delete parent[key];
};
const problemsOf = (tree: Tree): readonly string[] => {
  const result = loadScenario('t.yml', stringify(tree));
  return 'problems' in result ? result.problems : [];
};
const drive = (): Scenario => {
  const result = loadScenario('drive.yml', driveSource);
  if (!('scenario' in result)) throw new Error(result.problems.join('\n'));
  return result.scenario;
};
const centres = (layout: Layout, ids: readonly string[]) => ids.map((id) => layout.nodes[id]);

describe('success cases', () => {
  it('loads the guide’s one-stage file', () => {
    // ARRANGE
    const source = guideFixture();
    // ACT
    const result = loadScenario('guide-fixture.yml', source);
    // ASSERT
    expect(result).toHaveProperty('scenario.id', 'guide-fixture');
  });

  it('loads DRIVE with every node and edge placed in both layouts', () => {
    // ARRANGE
    const expected = { nodes: 6, stages: 5, edges: 7 };
    // ACT
    const { horizontal, vertical } = drive().layouts;
    // ASSERT
    expect(Object.keys(horizontal.nodes)).toHaveLength(expected.nodes);
    expect(Object.keys(vertical.nodes)).toHaveLength(expected.nodes);
    expect(horizontal.stages).toHaveLength(expected.stages);
    expect(vertical.stages).toHaveLength(expected.stages);
    expect(horizontal.edges).toHaveLength(expected.edges);
  });

  it('stacks parallel nodes in the wide layout', () => {
    // ARRANGE
    const parallel = ['implement-a', 'implement-b'];
    // ACT
    const [first, second] = centres(drive().layouts.horizontal, parallel);
    // ASSERT
    expect(first?.cx).toBe(second?.cx);
    expect(first?.cy).not.toBe(second?.cy);
  });

  it('sets parallel nodes side by side in the narrow layout', () => {
    // ARRANGE
    const parallel = ['implement-a', 'implement-b'];
    // ACT
    const [first, second] = centres(drive().layouts.vertical, parallel);
    // ASSERT
    expect(first?.cy).toBe(second?.cy);
    expect(first?.cx).not.toBe(second?.cx);
  });

  it('draws the arrowhead on only the last edge into a merge point', () => {
    // ARRANGE
    const scenario = drive();
    // ACT
    const heads = scenario.layouts.horizontal.edges.filter((edge) => edge.to === 'verify').map((edge) => edge.arrow);
    // ASSERT
    expect(heads).toEqual([false, true]);
  });
});

describe('failure cases', () => {
  const mistakes: [string, (tree: Tree) => void, string][] = [
    ['a missing field', (t) => drop(t, 'stages'), 't.yml: stages: must be a list'],
    ['an unknown field', (t) => set(t, 'colour', 'red'), 't.yml: (root).colour'],
    ['a short acronym', (t) => set(t, 'acronym', 'AB'), 't.yml: acronym'],
    [
      'a Stage id used twice',
      (t) => set(t, 'stages.1', { id: 'draft', scene: 'draft' }),
      't.yml: stages[1].id: "draft" is used twice',
    ],
    ['a node named goal', (t) => set(t, 'nodes.0.id', 'goal'), 't.yml: nodes.goal'],
    [
      'a scene outside the catalogue',
      (t) => set(t, 'stages.0.scene', 'dance'),
      't.yml: stages.draft.scene: "dance" is not a scene; use one of grill',
    ],
    ['an unresolved node stage', (t) => set(t, 'nodes.0.stage', 'nope'), 't.yml: nodes.write.stage'],
    ['an unresolved edge end', (t) => set(t, 'edges.0.from', 'nope'), 't.yml: edges[0].from'],
    [
      'a Cell id used twice in a node',
      (t) => set(t, 'nodes.0.cells.1', { id: 'write-br', move: 'break-it-down', trait: 'relentless' }),
      't.yml: nodes.write.cells[1]',
    ],
    ['an unknown move', (t) => set(t, 'nodes.0.cells.0.move', 'shout'), 't.yml: nodes.write.cells[0].move'],
    ['an unknown trait', (t) => set(t, 'nodes.0.cells.0.trait', 'shy'), 't.yml: nodes.write.cells[0].trait'],
    [
      'no edge reaching the goal',
      (t) => set(t, 'edges', [{ from: 'write', to: 'write' }]),
      't.yml: edges: no edge reaches the goal',
    ],
    ['a key that is not a BRACE letter', (t) => set(t, 'annotations.Z', []), 't.yml: annotations.Z'],
    ['an unknown primitive', (t) => set(t, 'annotations.B.0.type', 'blink'), 't.yml: annotations.B[0].type'],
    ['a wrong route', (t) => set(t, 'annotations.B.0.route', 'sideways'), 't.yml: annotations.B[0].route'],
    ['a field a primitive lacks', (t) => set(t, 'annotations.B.0.kind', 'check'), 't.yml: annotations.B[0].kind'],
    [
      'an Annotation target that does not resolve',
      (t) => set(t, 'annotations.B.0.to', 'nope'),
      't.yml: annotations.B[0]',
    ],
    ['a string missing in German', (t) => drop(t, 'i18n.de.stages.draft.ai'), 't.yml: i18n.de.stages.draft.ai'],
    ['a text id with no words', (t) => drop(t, 'i18n.en.annotations.b-arrow'), 't.yml: i18n.en.annotations.b-arrow'],
    ['a missing locale', (t) => drop(t, 'i18n.de'), 't.yml: i18n.de: is missing'],
  ];

  it.each(mistakes)('reports %s', (_name, mutate, expected) => {
    // ARRANGE
    const tree = fixture();
    mutate(tree);
    // ACT
    const problems = problemsOf(tree);
    // ASSERT
    expect(problems.some((problem) => problem.startsWith(expected))).toBe(true);
  });

  it('reports every problem at once', () => {
    // ARRANGE
    const tree = fixture();
    set(tree, 'nodes.0.cells.0.move', 'shout');
    drop(tree, 'i18n.de.title');
    const expectedProblems = 2;
    // ACT
    const problems = problemsOf(tree);
    // ASSERT
    expect(problems).toHaveLength(expectedProblems);
  });

  it('reports a YAML syntax error with the file', () => {
    // ARRANGE
    const broken = 'a: [';
    // ACT
    const result = loadScenario('bad.yml', broken);
    // ASSERT
    expect('problems' in result && result.problems[0]).toMatch(/^bad\.yml: YAML:/);
  });
});

describe('edge cases', () => {
  it('accepts a Cell outside the counters table', () => {
    // ARRANGE
    const tree = fixture();
    set(tree, 'nodes.0.cells.0', { id: 'write-br', move: 'evaluate-each-step', trait: 'every-word-billed' });
    // ACT
    const problems = problemsOf(tree);
    // ASSERT
    expect(problems).toEqual([]);
  });

  it('loads a file without an acronym', () => {
    // ARRANGE
    const tree = fixture();
    // ACT
    const result = loadScenario('t.yml', stringify(tree));
    // ASSERT
    expect('scenario' in result && result.scenario.acronym).toBeUndefined();
  });

  it('shares Cells between parallel nodes through a YAML anchor', () => {
    // ARRANGE
    const scenario = drive();
    // ACT
    const [first, second] = ['implement-a', 'implement-b'].map(
      (id) => scenario.nodes.find((node) => node.id === id)?.cells,
    );
    // ASSERT
    expect(first).toEqual(second);
  });
});
