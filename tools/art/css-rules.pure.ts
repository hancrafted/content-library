import postcss, { type AtRule, type Declaration, type Node, type Rule } from 'postcss';

export interface CssRule {
  readonly selector: string;
  readonly decls: readonly (readonly [property: string, value: string])[];
  readonly order: number;
  readonly conditional: boolean;
}

export type Specificity = readonly [ids: number, classes: number, types: number];

const CONDITIONAL_AT_RULES = new Set(['media', 'supports', 'container']);

function placeOf(rule: Rule) {
  let conditional = false;
  for (let parent: Node | undefined = rule.parent; parent; parent = parent.parent) {
    const name = parent.type === 'atrule' ? (parent as AtRule).name : '';
    if (name.endsWith('keyframes')) return { keyframe: true, conditional };
    conditional ||= CONDITIONAL_AT_RULES.has(name);
  }
  return { keyframe: false, conditional };
}

export function cssRules(css: string): CssRule[] {
  const rules: CssRule[] = [];
  postcss.parse(css).walkRules((rule: Rule) => {
    const { keyframe, conditional } = placeOf(rule);
    const decls = rule.nodes
      .filter((node): node is Declaration => node.type === 'decl')
      .map((decl) => [decl.prop, decl.value] as const);
    if (keyframe || decls.length === 0) return;
    for (const selector of rule.selectors) {
      rules.push({ selector: selector.trim(), decls, order: rules.length, conditional });
    }
  });
  return rules;
}

export function specificity(selector: string): Specificity {
  const bare = selector.replace(/\[[^\]]*\]/g, '.attribute');
  const ids = (bare.match(/#[\w-]+/g) ?? []).length;
  const classes = (bare.match(/\.[\w-]+|:(?!:)[\w-]+/g) ?? []).length;
  const types = (bare.match(/(^|[\s>+~])[a-zA-Z][\w-]*/g) ?? []).length + (bare.match(/::[\w-]+/g) ?? []).length;
  return [ids, classes, types];
}

export const compareSpecificity = (a: Specificity, b: Specificity) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

export function subjectTokens(selector: string): string[] {
  const flat = selector.replace(/\[[^\]]*\]/g, (attribute) => attribute.replace(/[\s>+~]/g, ''));
  const subject = flat.split(/[\s>+~]+/).at(-1) ?? '';
  const classes = (subject.match(/\.[\w-]+/g) ?? []).map((name) => name.slice(1));
  const attributes = (subject.match(/\[([\w-]+)/g) ?? []).map((name) => name.slice(1));
  return [...classes, ...attributes];
}
