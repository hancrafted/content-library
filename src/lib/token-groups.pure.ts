// What the dev-only token editor shows around a token: the one-line description of a
// global token and the designer-convention groups it is listed in (shadcn / Material
// style: a colour beside its `-foreground` pair). No DOM, no React.
import { classifyToken, type Token } from './token-discovery.pure';

const DESCRIPTIONS: Record<string, string> = {
  '--primary': 'Main action colour: primary buttons and the strongest emphasis.',
  '--primary-foreground': 'Text and icons on a primary surface.',
  '--secondary': 'Second brand colour: secondary buttons and supporting emphasis.',
  '--secondary-foreground': 'Text and icons on a secondary surface.',
  '--accent': 'Neutral hover and highlight surface of menus and ghost buttons.',
  '--accent-foreground': 'Text and icons on the accent surface.',
  '--brand-accent': 'Signature orange: the hero promotion, About emphasis and method deliverables.',
  '--background': 'Page background behind everything.',
  '--foreground': 'Default text colour on the page background.',
  '--card': 'Surface of cards, panels and popovers.',
  '--card-foreground': 'Text on a card.',
  '--muted': 'Quiet surface for toggles, chips and disabled areas.',
  '--muted-foreground': 'Secondary text: captions, hints and labels.',
  '--header': 'Translucent bar behind the site header.',
  '--destructive': 'Danger: errors and destructive actions.',
  '--destructive-foreground': 'Text and icons on a destructive fill.',
  '--success': 'Success and positive status: fill, or text on the page.',
  '--success-foreground': 'Text and icons on a success fill.',
  '--warning': 'Caution and attention status: fill, or text on the page.',
  '--warning-foreground': 'Text and icons on a warning fill.',
  '--info': 'Neutral information status: fill, or text on the page.',
  '--info-foreground': 'Text and icons on an info fill.',
  '--border': 'Hairlines around cards, dividers and the header toggles.',
  '--input': 'Border of text fields and form controls.',
  '--ring': 'Keyboard focus ring.',
  '--highlight-target': 'Outline that marks the element a Context link points at.',
  '--machine': 'Domain colour for the machine side of a visualisation.',
  '--human': 'Domain colour for the human side of a visualisation.',
  '--ai': 'Domain colour for the AI side of a visualisation.',
  '--selected': 'Selected or active item: current nav link, drawer tab, active table-of-contents entry.',
  '--selected-foreground': 'Text on a selected item.',
  '--youtube': 'YouTube brand red, for links to the video.',
  '--overlay': 'Scrim behind the drawer video and the header shadow.',
  '--radius': 'Corner rounding of cards, buttons and inputs.',
  '--drawer-width': 'Width of the Context drawer card.',
  '--size-hero': 'Font size of the hero title, the one place it is used.',
  '--size-heading': 'Font size of Slide headings.',
  '--size-subheading': 'Font size of subheadings.',
  '--size-body': 'Font size of running text and card titles.',
  '--size-caption': 'Font size of captions and small labels.',
  '--leading-hero': 'Line height of the hero title.',
  '--leading-heading': 'Line height of headings.',
  '--leading-subheading': 'Line height of subheadings.',
  '--leading-body': 'Line height of running text.',
  '--leading-caption': 'Line height of captions.',
  '--tracking-heading': 'Letter spacing of hero, heading and subheading text.',
  '--weight-normal': 'Regular text weight.',
  '--weight-medium': 'Medium weight for labels and emphasis.',
  '--weight-semibold': 'Strongest weight, for titles and key words.',
  '--font-sans': 'Typeface of all text.',
  '--font-mono': 'Typeface of code and token names.',
};

/** One line on what a global token affects; `undefined` for a token not in the table (a Slide's own, say). */
export function describeToken(name: string): string | undefined {
  return DESCRIPTIONS[name];
}

export interface TokenGroup {
  id: string;
  label: string;
  tokens: Token[];
}

/** Each group lists exact names in display order; typography is matched by family prefix instead. */
const GROUPS: readonly { label: string; names?: readonly string[]; prefixes?: readonly string[] }[] = [
  {
    label: 'Brand',
    names: [
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--accent',
      '--accent-foreground',
      '--brand-accent',
    ],
  },
  {
    label: 'Surface & text',
    names: ['--background', '--foreground', '--card', '--card-foreground', '--muted', '--muted-foreground', '--header'],
  },
  {
    label: 'Feedback',
    names: [
      '--destructive',
      '--destructive-foreground',
      '--success',
      '--success-foreground',
      '--warning',
      '--warning-foreground',
      '--info',
      '--info-foreground',
    ],
  },
  { label: 'Lines & focus', names: ['--border', '--input', '--ring', '--highlight-target'] },
  { label: 'Domain', names: ['--machine', '--human', '--ai'] },
  { label: 'Chrome', names: ['--selected', '--selected-foreground', '--youtube', '--overlay'] },
  { label: 'Typography', prefixes: ['--size-', '--leading-', '--tracking-', '--weight-', '--font-'] },
  { label: 'Shape', names: ['--radius'] },
  { label: 'Layout', names: ['--drawer-width'] },
];

const OTHER = 'Other';

const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Position in the group's display order: listed names by index, prefixed families by family then name. */
function rank(group: (typeof GROUPS)[number], name: string): number {
  if (group.names) return group.names.indexOf(name);
  return (group.prefixes ?? []).findIndex((prefix) => name.startsWith(prefix));
}

/** The global tokens in designer order, empty groups left out and unlisted tokens last under Other. */
export function groupGlobalTokens(tokens: readonly Token[]): TokenGroup[] {
  const placed = new Set<Token>();
  const groups: TokenGroup[] = GROUPS.map((group) => ({
    id: slug(group.label),
    label: group.label,
    tokens: tokens
      .filter((token) => rank(group, token.name) >= 0)
      .sort((a, b) => rank(group, a.name) - rank(group, b.name)),
  }));
  for (const group of groups) for (const token of group.tokens) placed.add(token);
  const rest = tokens.filter((token) => !placed.has(token));
  return [...groups, { id: slug(OTHER), label: OTHER, tokens: rest }].filter((group) => group.tokens.length > 0);
}

const isColour = (token: Token) => classifyToken(token.name, token.light) === 'colour';

/** A Slide's tokens grouped by the selector of the rule that declares them, colours first within a group. */
export function groupSlideTokens(tokens: readonly Token[]): TokenGroup[] {
  const bySelector = new Map<string, Token[]>();
  for (const token of tokens) {
    const label = token.target ?? 'Slide root';
    bySelector.set(label, [...(bySelector.get(label) ?? []), token]);
  }
  return [...bySelector].map(([label, members]) => ({
    id: `slide-${slug(label)}`,
    label,
    tokens: [...members.filter(isColour), ...members.filter((token) => !isColour(token))],
  }));
}
