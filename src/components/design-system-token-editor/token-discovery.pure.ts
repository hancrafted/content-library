// Finds design tokens in a plain snapshot of the loaded stylesheets. The DOM
// adapter (read-stylesheets.ts) builds the snapshot; nothing here touches it.

export type Theme = 'light' | 'dark';

/** One CSS style rule, reduced to what token discovery reads. */
export interface RuleSnapshot {
  selector: string;
  /** Custom-property declarations only, name to value. */
  declarations: Record<string, string>;
  /** Name of the `@layer` block the rule sits in, if any. */
  layer?: string;
}

export interface Token {
  name: string;
  light: string;
  dark: string;
  /** Slide tokens only: the selector of the rule that declares it, to find the element carrying it. It tells apart one name declared under several selectors. */
  target?: string;
}

export type TokenKind = 'colour' | 'size' | 'weight' | 'font' | 'other';

const COLOUR_VALUE = /^(#[0-9a-f]{3,8}|(oklch|oklab|hsla?|rgba?|lab|lch|hwb|color|color-mix)\()/i;

export function classifyToken(name: string, value: string): TokenKind {
  if (name.startsWith('--weight-')) return 'weight';
  if (name.startsWith('--font-')) return 'font';
  if (COLOUR_VALUE.test(value.trim())) return 'colour';
  if (/^--(size|leading|tracking|radius|drawer)/.test(name)) return 'size';
  return 'other';
}

/** A selector part that targets the root element in the light or dark theme. */
function rootTheme(part: string): Theme | null {
  if (part === ':root' || part === 'html') return 'light';
  if (part === '.dark' || part === ':root.dark' || part === 'html.dark') return 'dark';
  return null;
}

const DARK_PREFIX = /^(?::root|html)?\.dark\s+/;

function splitSelector(selector: string): string[] {
  return selector.split(',').map((part) => part.trim());
}

function isToolingName(name: string): boolean {
  return name.startsWith('--tw-');
}

interface Entry {
  name: string;
  theme: Theme;
  value: string;
  target?: string;
}

/** Accumulates values per token; a theme never declared falls back to the other one at the end. */
class TokenBook {
  private readonly tokens = new Map<string, { name: string; light?: string; dark?: string; target?: string }>();

  add({ name, theme, value, target }: Entry) {
    // A Slide token declared under several selectors is one token per selector.
    const key = `${name}|${target ?? ''}`;
    const entry = this.tokens.get(key) ?? { name, ...(target ? { target } : {}) };
    entry[theme] = value;
    this.tokens.set(key, entry);
  }

  list(): Token[] {
    return [...this.tokens.values()].map(({ name, light, dark, target }) => ({
      name,
      light: light ?? dark ?? '',
      dark: dark ?? light ?? '',
      ...(target ? { target } : {}),
    }));
  }
}

/** The theme a rule's selector list declares root tokens for; dark wins when it names both. */
function ruleTheme(selector: string): Theme | null {
  const themes = splitSelector(selector).map(rootTheme);
  if (themes.includes('dark')) return 'dark';
  return themes.includes('light') ? 'light' : null;
}

function ownDeclarations(rule: RuleSnapshot): [string, string][] {
  return Object.entries(rule.declarations).filter(([name]) => !isToolingName(name));
}

/** The global tokens: custom properties declared on `:root` (light) and `.dark` (dark). */
export function discoverGlobalTokens(rules: readonly RuleSnapshot[]): Token[] {
  const book = new TokenBook();
  for (const rule of rules.filter((r) => r.layer !== 'theme')) {
    const theme = ruleTheme(rule.selector);
    if (!theme) continue;
    for (const [name, value] of ownDeclarations(rule)) book.add({ name, theme, value });
  }
  return book.list();
}

/** The non-root selector parts of a rule that apply inside the Slide, split from their `.dark` prefix. */
function slideParts(selector: string, appliesInSlide: (selector: string) => boolean) {
  return splitSelector(selector)
    .filter((part) => !rootTheme(part))
    .map((part) => ({
      theme: (DARK_PREFIX.test(part) ? 'dark' : 'light') as Theme,
      scoped: part.replace(DARK_PREFIX, ''),
    }))
    .filter(({ scoped }) => appliesInSlide(scoped));
}

/**
 * The current Slide's own tokens: custom properties declared by rules whose
 * selector applies to an element inside the Slide. `appliesInSlide` answers that
 * for one selector (the adapter asks the DOM); a `.dark` prefix marks the dark value.
 */
export function discoverSlideTokens(
  rules: readonly RuleSnapshot[],
  appliesInSlide: (selector: string) => boolean,
): Token[] {
  const book = new TokenBook();
  for (const rule of rules) {
    for (const { theme, scoped } of slideParts(rule.selector, appliesInSlide)) {
      for (const [name, value] of ownDeclarations(rule)) book.add({ name, theme, value, target: scoped });
    }
  }
  return book.list();
}
