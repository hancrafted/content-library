import { normaliseColour, toPickerHex } from './colour-convert.pure';
import type { Edits, Scope } from './token-changes.pure';
import { editKey } from './token-changes.pure';
import {
  discoverGlobalTokens,
  discoverSlideTokens,
  type RuleSnapshot,
  type Theme,
  type Token,
} from './token-discovery.pure';

function snapshotRule(rule: CSSStyleRule, layer: string | undefined): RuleSnapshot | null {
  const declarations: Record<string, string> = {};
  for (const name of Array.from(rule.style)) {
    if (name.startsWith('--')) declarations[name] = normaliseColour(rule.style.getPropertyValue(name).trim());
  }
  return Object.keys(declarations).length > 0 ? { selector: rule.selectorText, declarations, layer } : null;
}

function collect(rules: CSSRuleList, layer: string | undefined, into: RuleSnapshot[]) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const snapshot = snapshotRule(rule, layer);
      if (snapshot) into.push(snapshot);
    }
    const nested = (rule as { cssRules?: CSSRuleList }).cssRules;
    if (nested) collect(nested, rule instanceof CSSLayerBlockRule ? rule.name : layer, into);
  }
}

function rulesOfReadableSheet(sheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return sheet.cssRules;
  } catch {
    return null;
  }
}

function readRules(): RuleSnapshot[] {
  const snapshots: RuleSnapshot[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    const rules = rulesOfReadableSheet(sheet);
    if (rules) collect(rules, undefined, snapshots);
  }
  return snapshots;
}

export function readGlobalTokens(): Token[] {
  return discoverGlobalTokens(readRules());
}

function slideElement(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-slide="${CSS.escape(id)}"]`);
}

export function readSlide(id: string, folder: string | null): TokenSet | null {
  const slide = slideElement(id);
  if (!slide) return null;
  const appliesInSlide = (selector: string) => {
    try {
      return slide.querySelector(selector) !== null || slide.matches(selector);
    } catch {
      return false;
    }
  };
  return {
    scope: { kind: 'slide', id: slide.dataset.slide ?? '', folder },
    tokens: discoverSlideTokens(readRules(), appliesInSlide),
  };
}

export interface TokenSet {
  scope: Scope;
  tokens: readonly Token[];
}

export function carriers(scope: Scope, token: Token): HTMLElement[] {
  if (scope.kind === 'global') return [document.documentElement];
  const slide = slideElement(scope.id);
  if (!slide || !token.target) return [];
  return [...slide.querySelectorAll<HTMLElement>(token.target), ...(slide.matches(token.target) ? [slide] : [])];
}

const originalProperties = new WeakMap<CSSStyleDeclaration, Map<string, { value: string; priority: string }>>();

function applyProperty(style: CSSStyleDeclaration, name: string, value: string | undefined) {
  const originals = originalProperties.get(style) ?? new Map<string, { value: string; priority: string }>();
  if (value !== undefined) {
    if (!originals.has(name))
      originals.set(name, { value: style.getPropertyValue(name), priority: style.getPropertyPriority(name) });
    originalProperties.set(style, originals);
    style.setProperty(name, value);
    return;
  }
  const original = originals.get(name);
  if (!original) return;
  if (original.value === '') style.removeProperty(name);
  else style.setProperty(name, original.value, original.priority);
  originals.delete(name);
  if (originals.size === 0) originalProperties.delete(style);
}

export function applyEdits({ scope, tokens }: TokenSet, edits: Edits, theme: Theme) {
  for (const token of tokens) {
    const value = edits[editKey(scope, theme, token)];
    for (const element of carriers(scope, token)) applyProperty(element.style, token.name, value);
  }
}

export function pickerHexOf(value: string): string | null {
  const direct = toPickerHex(value);
  if (direct) return direct;
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  const resolve = (start: string) => {
    context.fillStyle = start;
    context.fillStyle = value;
    return context.fillStyle;
  };
  if (resolve('black') === resolve('white')) {
    context.clearRect(0, 0, 1, 1);
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return toPickerHex(`rgba(${r}, ${g}, ${b}, ${a / 255})`);
  }
  return null;
}
