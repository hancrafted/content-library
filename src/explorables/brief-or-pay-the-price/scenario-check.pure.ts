import { MOVE_IDS, SCENES, TRAIT_IDS } from './brief-or-pay-the-price.types';
import { checkAnnotations } from './scenario-check-annotations.pure';
import { isTree, isText, list, unknownFields, type Check, type Ids, type Tree } from './scenario-check-context.pure';
import { checkWords } from './scenario-check-words.pure';

const ROOT_FIELDS = ['id', 'acronym', 'stages', 'nodes', 'edges', 'annotations', 'i18n'];

function checkStage(check: Check, stage: unknown, index: number): void {
  const at = `stages[${index}]`;
  if (!check.expect(isTree(stage) && isText(stage.id), `${at}.id`, 'must be a non-empty string')) return;
  const { id, scene } = stage as Tree & { id: string };
  unknownFields(check, stage as Tree, { at, fields: ['id', 'scene'] });
  check.expect(!check.ids.stages.has(id), `${at}.id`, `"${id}" is used twice`);
  check.ids.stages.add(id);
  check.expect(
    SCENES.includes(scene as never),
    `stages.${id}.scene`,
    `"${String(scene)}" is not a scene; use one of ${SCENES.join(', ')}`,
  );
}

function checkCell(check: Check, cell: unknown, where: { readonly at: string; readonly own: Set<string> }): void {
  const { at, own } = where;
  if (!check.expect(isTree(cell) && isText(cell.id), `${at}.id`, 'must be a non-empty string')) return;
  const { id, move, trait } = cell as Tree & { id: string };
  unknownFields(check, cell as Tree, { at, fields: ['id', 'move', 'trait'] });
  check.expect(!own.has(id), at, `"${id}" is used twice in this node`);
  own.add(id);
  check.ids.cells.add(id);
  check.expect(MOVE_IDS.includes(move as never), `${at}.move`, `"${String(move)}" is not a BRIEF move`);
  check.expect(TRAIT_IDS.includes(trait as never), `${at}.trait`, `"${String(trait)}" is not a PRICE trait`);
}

function checkNode(check: Check, node: unknown, index: number): void {
  if (!check.expect(isTree(node) && isText(node.id), `nodes[${index}].id`, 'must be a non-empty string')) return;
  const { id, stage, cells } = node as Tree & { id: string };
  unknownFields(check, node as Tree, { at: `nodes.${id}`, fields: ['id', 'stage', 'cells'] });
  check.expect(id !== 'goal', `nodes.${id}`, '"goal" is reserved for the goal marker');
  check.expect(!check.ids.nodes.has(id), `nodes.${id}`, 'id is used twice');
  check.ids.nodes.add(id);
  check.expect(check.ids.stages.has(String(stage)), `nodes.${id}.stage`, `"${String(stage)}" is not a stage`);
  const own = new Set<string>();
  const at = `nodes.${id}.cells`;
  if (check.expect(Array.isArray(cells), at, 'must be a list'))
    list(cells).forEach((cell, at2) => checkCell(check, cell, { at: `${at}[${at2}]`, own }));
}

function checkEdge(check: Check, edge: unknown, index: number): void {
  const at = `edges[${index}]`;
  if (!check.expect(isTree(edge), at, 'must be a mapping with from and to')) return;
  const { from, to } = edge as Tree;
  unknownFields(check, edge as Tree, { at, fields: ['from', 'to'] });
  check.expect(check.ids.nodes.has(String(from)), `${at}.from`, `"${String(from)}" is not a node`);
  check.expect(check.ids.nodes.has(String(to)) || to === 'goal', `${at}.to`, `"${String(to)}" is not a node or goal`);
  check.ids.edges.add(`${String(from)}>${String(to)}`);
}

function listAt(check: Check, root: Tree, key: string): unknown[] {
  check.expect(Array.isArray(root[key]), key, 'must be a list');
  const items = list(root[key]);
  if (key !== 'edges') check.expect(items.length > 0, key, `needs at least one ${key === 'stages' ? 'stage' : 'node'}`);
  return items;
}

function checkStructure(check: Check, data: Tree): void {
  const stages = listAt(check, data, 'stages');
  if (data.acronym !== undefined)
    check.expect(
      isText(data.acronym) && data.acronym.length === stages.length,
      'acronym',
      'must have one letter per stage',
    );
  stages.forEach((stage, index) => checkStage(check, stage, index));
  listAt(check, data, 'nodes').forEach((node, index) => checkNode(check, node, index));
  const edges = listAt(check, data, 'edges');
  edges.forEach((edge, index) => checkEdge(check, edge, index));
  check.expect(
    edges.some((edge) => isTree(edge) && edge.to === 'goal'),
    'edges',
    'no edge reaches the goal',
  );
}

export function scenarioProblems(data: unknown): string[] {
  const found: string[] = [];
  const ids: Ids = { stages: new Set(), nodes: new Set(), cells: new Set(), edges: new Set(), texts: new Set() };
  const expect = (ok: boolean, at: string, message: string): boolean => {
    if (!ok) found.push(`${at}: ${message}`);
    return ok;
  };
  const check: Check = { ids, expect };
  if (!expect(isTree(data), '(root)', 'must be a mapping')) return found;
  const root = data as Tree;
  unknownFields(check, root, { at: '(root)', fields: ROOT_FIELDS });
  expect(isText(root.id), 'id', 'must be a non-empty string');
  checkStructure(check, root);
  checkAnnotations(check, root.annotations);
  checkWords(check, root.i18n);
  return found;
}
