// The DOM side of the token editor: reads the loaded stylesheets into the plain
// snapshot token discovery works on, finds the current Slide, and applies edits.
import type { Edits, Scope } from './token-changes.pure';
import { editKey } from './token-changes.pure';
import {
  discoverGlobalTokens,
  discoverSlideTokens,
  type RuleSnapshot,
  type Theme,
  type Token,
} from './token-discovery.pure';

const TITLE_SLIDE_ID = 'top';

function snapshotRule(rule: CSSStyleRule, layer: string | undefined): RuleSnapshot | null {
  const declarations: Record<string, string> = {};
  for (const name of Array.from(rule.style)) {
    if (name.startsWith('--')) declarations[name] = rule.style.getPropertyValue(name).trim();
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

function readRules(): RuleSnapshot[] {
  const snapshots: RuleSnapshot[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collect(sheet.cssRules, undefined, snapshots);
    } catch {
      // A cross-origin stylesheet cannot be read; it holds none of ours.
    }
  }
  return snapshots;
}

export function readGlobalTokens(): Token[] {
  return discoverGlobalTokens(readRules());
}

function activeSlideElement(): HTMLElement | null {
  const id = decodeURIComponent(window.location.hash.slice(1)) || TITLE_SLIDE_ID;
  return document.querySelector<HTMLElement>(`[data-slide="${CSS.escape(id)}"]`);
}

/** The current Slide's scope and its own tokens; `null` when the page has no Slide (the landing page). */
export function readSlide(): TokenSet | null {
  const slide = activeSlideElement();
  if (!slide) return null;
  const appliesInSlide = (selector: string) => {
    try {
      return slide.querySelector(selector) !== null || slide.matches(selector);
    } catch {
      return false;
    }
  };
  const episode = document.querySelector<HTMLElement>('[data-episode]')?.dataset.episode ?? null;
  return {
    scope: { kind: 'slide', id: slide.dataset.slide ?? '', episode },
    tokens: discoverSlideTokens(readRules(), appliesInSlide),
  };
}

export interface TokenSet {
  scope: Scope;
  tokens: readonly Token[];
}

function carriers(scope: Scope, token: Token): HTMLElement[] {
  if (scope.kind === 'global') return [document.documentElement];
  const slide = document.querySelector<HTMLElement>(`[data-slide="${CSS.escape(scope.id)}"]`);
  if (!slide || !token.target) return [];
  return [...slide.querySelectorAll<HTMLElement>(token.target), ...(slide.matches(token.target) ? [slide] : [])];
}

/** Applies the active theme's edits as inline custom properties and clears the rest, so a theme switch shows the right values. */
export function applyEdits({ scope, tokens }: TokenSet, edits: Edits, theme: Theme) {
  for (const token of tokens) {
    const value = edits[editKey(scope, theme, token.name)];
    for (const element of carriers(scope, token)) {
      if (value === undefined) element.style.removeProperty(token.name);
      else element.style.setProperty(token.name, value);
    }
  }
}
