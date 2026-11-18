import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse, stringify } from 'yaml';
import { MOVE_IDS, SCENES, TRAIT_IDS } from './brief-or-pay-the-price.types';
import { loadScenario } from './scenario.pure';
import { LETTERS, MARK_KINDS } from './scenario.types';

type Tree = Record<string, unknown>;

const GUIDE_PATH = 'docs/features/explorables/brief-or-pay-the-price-scenarios.md';
const guide = readFileSync(GUIDE_PATH, 'utf8');
const fixtureSource = /```yaml\n([\s\S]*?)```/.exec(guide)?.[1] ?? '';

const sectionOf = (heading: string): string => {
  const start = guide.indexOf(`## ${heading}`);
  const next = guide.indexOf('\n## ', start + 1);
  return guide.slice(start, next === -1 ? undefined : next);
};
const rowsOf = (heading: string): string[][] =>
  sectionOf(heading)
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .slice(2)
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );

const fixture = (): Tree => parse(fixtureSource) as Tree;
const parentOf = (tree: Tree, path: string): { parent: Tree; key: string } => {
  const keys = path.split('.');
  const key = keys.pop() as string;
  return {
    parent: keys.reduce<Tree>((at, each) => at[each] as Tree, tree),
    key,
  };
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

describe('success cases', () => {
  describe('the guide’s complete one-stage file', () => {
    it('loads clean through the Scenario module', () => {
      // ARRANGE
      const source = fixtureSource;
      // ACT
      const result = loadScenario('guide-fixture.yml', source);
      // ASSERT
      expect(result).toHaveProperty('scenario.id', 'guide-fixture');
      expect('problems' in result).toBe(false);
    });

    it('lays out in both orientations', () => {
      // ARRANGE
      const result = loadScenario('guide-fixture.yml', fixtureSource);
      // ACT
      const layouts = 'scenario' in result ? result.scenario.layouts : undefined;
      // ASSERT
      expect(Object.keys(layouts?.horizontal.nodes ?? {})).toEqual(['write']);
      expect(Object.keys(layouts?.vertical.nodes ?? {})).toEqual(['write']);
    });
  });

  describe('the guide’s ids match the shipped types', () => {
    const idsOf = (heading: string, label: string): string[] => {
      const line = sectionOf(heading)
        .split('\n')
        .find((each) => each.startsWith(`- ${label}:`));
      return [...(line ?? '').matchAll(/`([^`]+)`/g)].map((match) => match[1] as string);
    };

    it('lists the BRIEF moves', () => {
      // ARRANGE
      const expected = [...MOVE_IDS];
      // ACT
      const listed = idsOf('Cells', 'Moves');
      // ASSERT
      expect(listed).toEqual(expected);
    });

    it('lists the PRICE traits', () => {
      // ARRANGE
      const expected = [...TRAIT_IDS];
      // ACT
      const listed = idsOf('Cells', 'Traits');
      // ASSERT
      expect(listed).toEqual(expected);
    });

    it('lists the scenes', () => {
      // ARRANGE
      const expected = [...SCENES];
      // ACT
      const listed = [
        ...(/picked from a fixed catalogue[^:]*: ([^.]*)\./.exec(sectionOf('Stages and scenes'))?.[1] ?? '').matchAll(
          /`([^`]+)`/g,
        ),
      ].map((match) => match[1]);
      // ASSERT
      expect(listed).toEqual(expected);
    });

    it('lists the primitives with the fields the loader accepts', () => {
      // ARRANGE
      const listed = rowsOf('Annotations').map(([type]) => (type ?? '').replaceAll('`', ''));
      // ACT
      // ASSERT
      expect(listed).toEqual(['highlight', 'arrow', 'group', 'tag', 'chip', 'mark']);
    });

    it('lists the BRACE letters and mark kinds', () => {
      // ARRANGE
      const text = guide;
      // ACT
      const letters = LETTERS.map((letter) => `\`${letter}\``).join(', ');
      // ASSERT
      expect(text).toContain(letters);
      expect(text).toContain(`kind: ${MARK_KINDS.join(' \\| ')}`);
    });
  });
});

describe('failure cases', () => {
  describe('the guide’s "Problems the loader reports" table', () => {
    const cases: Record<string, { mutate: (tree: Tree) => void; path: string }[]> = {
      'A field missing, of the wrong type, or unknown': [
        { mutate: (t) => drop(t, 'edges'), path: 'edges' },
        { mutate: (t) => set(t, 'stages', 'draft'), path: 'stages' },
        { mutate: (t) => drop(t, 'nodes.0.stage'), path: 'nodes.write.stage' },
        { mutate: (t) => set(t, 'colour', 'red'), path: '(root).colour' },
        {
          mutate: (t) => set(t, 'nodes.0.colour', 'red'),
          path: 'nodes.write.colour',
        },
        {
          mutate: (t) => set(t, 'annotations.B.0.kind', 'check'),
          path: 'annotations.B[0].kind',
        },
      ],
      '`acronym` not one letter per Stage': [{ mutate: (t) => set(t, 'acronym', 'AB'), path: 'acronym' }],
      'An id used twice (Stage, node, Cell within its node)': [
        {
          mutate: (t) => set(t, 'stages.1', { id: 'draft', scene: 'draft' }),
          path: 'stages[1].id',
        },
        {
          mutate: (t) => set(t, 'nodes.1', { id: 'write', stage: 'draft', cells: [] }),
          path: 'nodes.write',
        },
        {
          mutate: (t) =>
            set(t, 'nodes.0.cells.1', {
              id: 'write-br',
              move: 'break-it-down',
              trait: 'relentless',
            }),
          path: 'nodes.write.cells[1]',
        },
      ],
      'A node named `goal`': [{ mutate: (t) => set(t, 'nodes.0.id', 'goal'), path: 'nodes.goal' }],
      'A `scene` outside the catalogue': [
        {
          mutate: (t) => set(t, 'stages.0.scene', 'dance'),
          path: 'stages.draft.scene',
        },
      ],
      'A node’s `stage`, an edge end or an Annotation target that does not resolve': [
        {
          mutate: (t) => set(t, 'nodes.0.stage', 'nope'),
          path: 'nodes.write.stage',
        },
        {
          mutate: (t) => set(t, 'edges.0.from', 'nope'),
          path: 'edges[0].from',
        },
        { mutate: (t) => set(t, 'edges.0.to', 'nope'), path: 'edges[0].to' },
        {
          mutate: (t) => set(t, 'annotations.B.0.to', 'nope'),
          path: 'annotations.B[0]',
        },
        {
          mutate: (t) => set(t, 'annotations.B', [{ type: 'tag', node: 'nope', text: 'b-arrow' }]),
          path: 'annotations.B[0].node',
        },
        {
          mutate: (t) => set(t, 'annotations.B', [{ type: 'chip', edge: 'write>nope', text: 'b-arrow' }]),
          path: 'annotations.B[0].edge',
        },
        {
          mutate: (t) => set(t, 'annotations.B', [{ type: 'highlight', stages: ['nope'] }]),
          path: 'annotations.B[0].stages',
        },
      ],
      'A Cell’s `move` or `trait` that is not a BRIEF move or PRICE trait': [
        {
          mutate: (t) => set(t, 'nodes.0.cells.0.move', 'shout'),
          path: 'nodes.write.cells[0].move',
        },
        {
          mutate: (t) => set(t, 'nodes.0.cells.0.trait', 'shy'),
          path: 'nodes.write.cells[0].trait',
        },
      ],
      'No edge reaching the goal': [
        {
          mutate: (t) => set(t, 'edges', [{ from: 'write', to: 'write' }]),
          path: 'edges',
        },
      ],
      'An `annotations` key that is not a BRACE letter, an unknown `type`, a wrong `route` or `kind`': [
        { mutate: (t) => set(t, 'annotations.Z', []), path: 'annotations.Z' },
        {
          mutate: (t) => set(t, 'annotations.B.0.type', 'blink'),
          path: 'annotations.B[0].type',
        },
        {
          mutate: (t) => set(t, 'annotations.B.0.route', 'sideways'),
          path: 'annotations.B[0].route',
        },
        {
          mutate: (t) => set(t, 'annotations.B', [{ type: 'mark', nodes: ['write'], kind: 'shout' }]),
          path: 'annotations.B[0].kind',
        },
      ],
      'A string missing in one locale': [
        {
          mutate: (t) => drop(t, 'i18n.de.stages.draft.ai'),
          path: 'i18n.de.stages.draft.ai',
        },
        {
          mutate: (t) => drop(t, 'i18n.en.nodes.write.role'),
          path: 'i18n.en.nodes.write.role',
        },
        {
          mutate: (t) => drop(t, 'i18n.de.cells.write-br.freelancer'),
          path: 'i18n.de.cells.write-br.freelancer',
        },
        {
          mutate: (t) => drop(t, 'i18n.en.annotations.b-arrow'),
          path: 'i18n.en.annotations.b-arrow',
        },
        { mutate: (t) => drop(t, 'i18n.de.title'), path: 'i18n.de.title' },
      ],
    };

    const unquote = (mistake: string): string => mistake.replaceAll('’', "'");
    const caseKeys = Object.keys(cases).map(unquote);
    const guideRows = rowsOf('Problems the loader reports').map(([mistake]) =>
      unquote((mistake ?? '').replaceAll('’', "'")),
    );

    it('has a case for exactly the rows the guide lists', () => {
      // ARRANGE
      const expected = [...guideRows].sort();
      // ACT
      const covered = [...caseKeys].sort();
      // ASSERT
      expect(covered).toEqual(expected);
    });

    const flat = Object.entries(cases).flatMap(([row, each]) => each.map((one) => ({ row, ...one })));

    it.each(flat.map((one) => [one.row, one.path, one] as const))('%s: names %s', (_row, path, one) => {
      // ARRANGE
      const tree = fixture();
      one.mutate(tree);
      // ACT
      const problems = problemsOf(tree);
      // ASSERT
      expect(problems.some((problem) => problem.startsWith(`t.yml: ${path}`))).toBe(true);
    });

    it('names the file on every problem and reports them all at once', () => {
      // ARRANGE
      const tree = fixture();
      set(tree, 'nodes.0.cells.0.move', 'shout');
      set(tree, 'stages.0.scene', 'dance');
      drop(tree, 'i18n.de.title');
      const mistakes = 3;
      // ACT
      const problems = problemsOf(tree);
      // ASSERT
      expect(problems).toHaveLength(mistakes);
      expect(problems.every((problem) => problem.startsWith('t.yml: '))).toBe(true);
    });

    it('names the catalogue with the scene problem', () => {
      // ARRANGE
      const tree = fixture();
      set(tree, 'stages.0.scene', 'dance');
      // ACT
      const problem = problemsOf(tree).find((each) => each.includes('stages.draft.scene')) ?? '';
      // ASSERT
      for (const scene of SCENES) expect(problem).toContain(scene);
    });
  });
});

describe('edge cases', () => {
  describe('claims in the guide’s prose', () => {
    it('rejects an unknown top-level field', () => {
      // ARRANGE
      const tree = fixture();
      set(tree, 'colour', 'red');
      // ACT
      const problems = problemsOf(tree);
      // ASSERT
      expect(problems.some((problem) => problem.startsWith('t.yml: (root).colour'))).toBe(true);
    });

    it('requires at least one Stage and one node', () => {
      // ARRANGE
      const tree = fixture();
      set(tree, 'stages', []);
      set(tree, 'nodes', []);
      // ACT
      const problems = problemsOf(tree);
      // ASSERT
      expect(problems.some((problem) => problem.startsWith('t.yml: stages: needs at least one'))).toBe(true);
      expect(problems.some((problem) => problem.startsWith('t.yml: nodes: needs at least one'))).toBe(true);
    });

    it('accepts a goal highlight and every primitive with its documented fields', () => {
      // ARRANGE
      const tree = fixture();
      set(tree, 'annotations', {
        B: [
          {
            type: 'highlight',
            nodes: ['write'],
            edges: ['write>goal'],
            stages: ['draft'],
            goal: true,
          },
        ],
        R: [{ type: 'group', nodes: ['write'], text: 'b-arrow' }],
        A: [{ type: 'tag', node: 'write', text: 'b-arrow' }],
        C: [{ type: 'chip', edge: 'write>goal', text: 'b-arrow' }],
        E: [{ type: 'mark', nodes: ['write'], kind: 'intent' }],
      });
      // ACT
      const problems = problemsOf(tree);
      // ASSERT
      expect(problems).toEqual([]);
    });

    it('allows an arrow to end at the goal and to start there', () => {
      // ARRANGE
      const tree = fixture();
      set(tree, 'annotations.B', [
        {
          type: 'arrow',
          from: 'write',
          to: 'goal',
          route: 'over',
          text: 'b-arrow',
        },
      ]);
      // ACT
      const problems = problemsOf(tree);
      // ASSERT
      expect(problems).toEqual([]);
    });
  });
});
