// The DOM side of token usage: sets a token to a sentinel, samples computed style
// before and after, and hands the plain samples to the pure diff. Also the
// outline and scroll the usage list drives. Reads and restores the page; adds nothing to it.
import { carriers } from '@/lib/page-tokens';
import type { Scope } from '@/lib/token-changes.pure';
import { classifyToken, type Theme, type Token } from '@/lib/token-discovery.pure';
import {
  diffUsage,
  sentinelsFor,
  USAGE_PROPERTIES,
  usageLabel,
  type Markers,
  type StyleSample,
} from './token-usage.pure';

const PANEL = '[data-testid="design-system-token-panel"]';
const OUTLINE = 'data-token-usage-outline';
const PSEUDOS = ['::before', '::after'] as const;
type Pseudo = (typeof PSEUDOS)[number];

/** An element the page renders, outside the editor's own panel and outline. */
function isRendered(element: Element): boolean {
  if (element.closest(`${PANEL}, [${OUTLINE}]`)) return false;
  if (['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE'].includes(element.tagName)) return false;
  return element.getClientRects().length > 0 || getComputedStyle(element).display === 'contents';
}

function readStyles(style: CSSStyleDeclaration): Record<string, string> {
  return Object.fromEntries(USAGE_PROPERTIES.map((property) => [property, style.getPropertyValue(property)]));
}

interface Subjects {
  elements: Element[];
  /** Pseudo-elements that generate a box; their sample ids follow the elements'. */
  pseudos: { host: number; pseudo: Pseudo }[];
}

function findSubjects(): Subjects {
  const elements = [document.documentElement, ...Array.from(document.body.querySelectorAll('*'))].filter(isRendered);
  const pseudos = elements.flatMap((element, host) =>
    PSEUDOS.filter((pseudo) => {
      const content = getComputedStyle(element, pseudo).content;
      return content !== 'none' && content !== 'normal';
    }).map((pseudo) => ({ host, pseudo })),
  );
  return { elements, pseudos };
}

function sample({ elements, pseudos }: Subjects): StyleSample[] {
  const index = new Map(elements.map((element, id) => [element, id]));
  const own = elements.map((element, id) => ({
    id,
    parent: element.parentElement ? (index.get(element.parentElement) ?? null) : null,
    styles: readStyles(getComputedStyle(element)),
  }));
  const generated = pseudos.map(({ host, pseudo }, n) => ({
    id: elements.length + n,
    parent: host,
    pseudo,
    styles: readStyles(getComputedStyle(elements[host], pseudo)),
  }));
  return [...own, ...generated];
}

/** Runs `probe` with transitions off, so a transitioning property reports its end value and nothing animates back from the sentinel. */
function withoutTransitions<T>(probe: () => T): T {
  const style = document.createElement('style');
  style.textContent = '*, *::before, *::after { transition: none !important; }';
  document.head.append(style);
  try {
    return probe();
  } finally {
    // Settle the restored style while transitions are still off, then let them back.
    void getComputedStyle(document.documentElement).color;
    style.remove();
  }
}

/** Sets the token inline on each carrier and returns what puts the exact previous inline value (or its absence) back. */
function setSentinel(carrierList: HTMLElement[], name: string, sentinel: string): () => void {
  const saved = carrierList.map((element) => ({
    element,
    value: element.style.getPropertyValue(name),
    priority: element.style.getPropertyPriority(name),
  }));
  for (const { element } of saved) element.style.setProperty(name, sentinel);
  return () => {
    for (const { element, value, priority } of saved) {
      if (value === '') element.style.removeProperty(name);
      else element.style.setProperty(name, value, priority);
    }
  };
}

function markersOf(element: Element): Markers {
  const { slot, slide, section, testid } = (element as HTMLElement).dataset ?? {};
  return {
    tag: element.tagName.toLowerCase(),
    ...(slot ? { slot } : {}),
    ...(slide ? { slide } : {}),
    ...(section ? { section } : {}),
    ...(testid ? { testid } : {}),
  };
}

function labelOf(element: Element): string {
  const chain: Markers[] = [];
  for (let at: Element | null = element; at; at = at.parentElement) chain.push(markersOf(at));
  return usageLabel(chain);
}

export interface UsageHit {
  element: Element;
  /** The nearest two markers, or the tag. */
  label: string;
  pseudo?: Pseudo;
  /** The computed properties that moved. */
  properties: string[];
}

/**
 * One probe: samples computed style, sets the sentinel, samples again and puts the
 * page back, all in one task so nothing paints in between. Transitions are off for
 * its length, and a carrier's previous inline value is restored exactly.
 */
function probeOnce(carrierList: HTMLElement[], token: Token, sentinel: string): UsageHit[] {
  const subjects = findSubjects();
  const { before, after } = withoutTransitions(() => {
    const first = sample(subjects);
    const restore = setSentinel(carrierList, token.name, sentinel);
    try {
      return { before: first, after: sample(subjects) };
    } finally {
      restore();
    }
  });
  return diffUsage(before, after).map(({ id, pseudo, properties }) => {
    const element = subjects.elements[pseudo ? subjects.pseudos[id - subjects.elements.length].host : id];
    return { element, label: pseudo ? `${labelOf(element)} ${pseudo}` : labelOf(element), pseudo, properties };
  });
}

function merge(hits: UsageHit[], more: UsageHit[]): UsageHit[] {
  for (const hit of more) {
    const known = hits.find((h) => h.element === hit.element && h.pseudo === hit.pseudo);
    if (known) known.properties = [...new Set([...known.properties, ...hit.properties])];
    else hits.push(hit);
  }
  return hits;
}

/**
 * The elements currently rendered whose style depends on the token: it is set to
 * an unmistakable value and whatever computed style moves is a use, which also
 * catches a token reached through another token or `color-mix`. Unmounted Slides
 * are not on the page and are not found. Runs when the browser is idle.
 */
export function findTokenUsage(scope: Scope, token: Token, theme: Theme): Promise<UsageHit[]> {
  const schedule = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 0));
  return new Promise((resolve) => {
    schedule(() => {
      const carrierList = carriers(scope, token);
      const sentinels = carrierList.length > 0 ? sentinelsFor(classifyToken(token.name, token[theme])) : [];
      resolve(
        sentinels.reduce<UsageHit[]>((hits, sentinel) => merge(hits, probeOnce(carrierList, token, sentinel)), []),
      );
    });
  });
}

let outline: HTMLElement | null = null;
let outlined: Element | null = null;

function placeOutline() {
  if (!outline || !outlined) return;
  const rect = outlined.getBoundingClientRect();
  Object.assign(outline.style, {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
}

/** Outlines an element with an overlay that touches nothing on the page; `null` removes it. */
export function outlineElement(element: Element | null) {
  outlined = element;
  if (!element) {
    outline?.remove();
    outline = null;
    window.removeEventListener('scroll', placeOutline, true);
    return;
  }
  if (!outline) {
    outline = document.createElement('div');
    outline.setAttribute(OUTLINE, '');
    outline.setAttribute('aria-hidden', 'true');
    Object.assign(outline.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '2147483000',
      outline: '2px solid var(--brand-accent, currentColor)',
      outlineOffset: '2px',
      borderRadius: '2px',
    });
    document.body.append(outline);
    window.addEventListener('scroll', placeOutline, true);
  }
  placeOutline();
}

/** Brings an element into the middle of the view. */
export function scrollToElement(element: Element) {
  element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
}
