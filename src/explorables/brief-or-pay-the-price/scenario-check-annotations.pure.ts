import { isTree, isText, list, strings, type Check, type Tree } from './scenario-check-context.pure';
import { LETTERS, MARK_KINDS } from './scenario.types';

const PRIMITIVES: Readonly<Record<string, readonly string[]>> = {
  highlight: ['nodes', 'edges', 'stages', 'goal'],
  arrow: ['from', 'to', 'route', 'text'],
  group: ['nodes', 'text'],
  tag: ['node', 'text'],
  chip: ['edge', 'text'],
  mark: ['nodes', 'kind'],
};
const TEXTED = ['arrow', 'group', 'tag', 'chip'];

function checkTargets(check: Check, annotation: Tree, at: string): void {
  const { ids, expect } = check;
  for (const node of strings(annotation.nodes)) expect(ids.nodes.has(node), `${at}.nodes`, `"${node}" is not a node`);
  for (const stage of strings(annotation.stages))
    expect(ids.stages.has(stage), `${at}.stages`, `"${stage}" is not a stage`);
  for (const edge of strings(annotation.edges)) expect(ids.edges.has(edge), `${at}.edges`, `"${edge}" is not an edge`);
  if (annotation.type === 'tag')
    expect(ids.nodes.has(String(annotation.node)), `${at}.node`, `"${String(annotation.node)}" is not a node`);
  if (annotation.type === 'chip')
    expect(ids.edges.has(String(annotation.edge)), `${at}.edge`, `"${String(annotation.edge)}" is not an edge`);
}

function checkArrow(check: Check, annotation: Tree, at: string): void {
  const end = (value: unknown): boolean => check.ids.nodes.has(String(value)) || value === 'goal';
  check.expect(end(annotation.from) && end(annotation.to), at, 'arrow ends must be nodes or goal');
  check.expect(['under', 'over'].includes(String(annotation.route)), `${at}.route`, 'must be under or over');
}

function checkKinds(check: Check, annotation: Tree, at: string): void {
  if (annotation.type === 'arrow') checkArrow(check, annotation, at);
  if (annotation.type === 'mark')
    check.expect(
      MARK_KINDS.includes(annotation.kind as never),
      `${at}.kind`,
      `must be one of ${MARK_KINDS.join(', ')}`,
    );
  if (!TEXTED.includes(String(annotation.type))) return;
  check.expect(isText(annotation.text), `${at}.text`, 'needs a text id');
  check.ids.texts.add(String(annotation.text));
}

function checkOne(check: Check, annotation: unknown, at: string): void {
  const type = isTree(annotation) ? String(annotation.type) : '';
  const known = type in PRIMITIVES;
  if (!check.expect(known, `${at}.type`, `"${type}" is not one of ${Object.keys(PRIMITIVES).join(', ')}`)) return;
  const fields = annotation as Tree;
  for (const key of Object.keys(fields).filter((each) => each !== 'type'))
    check.expect((PRIMITIVES[type] ?? []).includes(key), `${at}.${key}`, `is not a field of ${type}`);
  checkTargets(check, fields, at);
  checkKinds(check, fields, at);
}

export function checkAnnotations(check: Check, annotations: unknown): void {
  if (annotations === undefined) return;
  if (!check.expect(isTree(annotations), 'annotations', 'must be a mapping of BRACE letters')) return;
  const letters = annotations as Tree;
  for (const letter of Object.keys(letters))
    check.expect(LETTERS.includes(letter as never), `annotations.${letter}`, 'is not a BRACE letter');
  for (const letter of LETTERS)
    list(letters[letter]).forEach((annotation, index) =>
      checkOne(check, annotation, `annotations.${letter}[${index}]`),
    );
}
