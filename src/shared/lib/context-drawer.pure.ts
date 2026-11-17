// decision: FE-010 §3

import type { DrawerMode } from './prefs.pure';

export interface NoteSource {
  readonly slug: string;
  readonly url: string;
  readonly title: string;
}

export interface SpeakerNoteItem {
  readonly slug: string;
  readonly header: string;
  readonly description: string;
  readonly sources?: readonly NoteSource[];
  readonly image?: { readonly src: string; readonly alt: string };
  // decision: FE-010 §4
  readonly target: string;
}

export interface VoiceScriptSegment {
  readonly slug: string;
  readonly from: number;
  readonly to: number;
  readonly title: string;
  readonly keywords: readonly string[];
  readonly script: string;
  readonly bridge?: string;
}

export interface KeyEventLike {
  readonly code: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly repeat: boolean;
}

export const DRAWER_TABS = ['notes', 'script'] as const;
export type DrawerTab = (typeof DRAWER_TABS)[number];

export function sitsBeside(mode: DrawerMode, open: boolean): boolean {
  return open && mode === 'beside';
}

// decision: FE-009 §2
export const DRAWER_BESIDE_ATTR = 'data-drawer-beside';

export const DRAWER_PANEL_ID = 'context-panel';

export function drawerIds(tab: DrawerTab): { tab: string; panel: string } {
  return { tab: `context-tab-${tab}`, panel: `${DRAWER_PANEL_ID}-${tab}` };
}

export const SHORTCUT_LABEL = 'Alt+N';

export function matchesShortcut(event: KeyEventLike): boolean {
  const onlyAlt = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
  return onlyAlt && !event.repeat && event.code === 'KeyN';
}

export function drawerKeyAction(event: KeyEventLike, open: boolean): 'toggle' | 'close' | null {
  if (matchesShortcut(event)) return 'toggle';
  return open && event.code === 'Escape' ? 'close' : null;
}

export function titleOfItem(
  id: string | null,
  items: readonly { readonly id: string; readonly title?: string }[],
  fallback: string,
): string {
  return items.find((item) => item.id === id)?.title ?? fallback;
}

export function currentItemId(observed: string | null, ids: readonly string[]): string | null {
  if (observed !== null && ids.includes(observed)) return observed;
  return ids[0] ?? null;
}

export function formatMark(minutes: number): string {
  const total = Math.round(minutes * 60);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export type DescriptionPart = string | { readonly cite: number };

const CITATION_RE = /\[([1-9]\d*)\]/g;

export function splitCitations(text: string): DescriptionPart[] {
  const parts: DescriptionPart[] = [];
  let from = 0;
  for (const match of text.matchAll(CITATION_RE)) {
    if (match.index > from) parts.push(text.slice(from, match.index));
    parts.push({ cite: Number(match[1]) });
    from = match.index + match[0].length;
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts;
}

export function sourceDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

export interface RevealLayout {
  readonly offset: number;
  readonly inset: number;
  readonly scrollHeight: number;
  readonly clientHeight: number;
}

export function revealScrollTop(layout: RevealLayout): number {
  const furthest = Math.max(0, layout.scrollHeight - layout.clientHeight);
  return Math.min(furthest, Math.max(0, layout.offset - layout.inset));
}

export { keepReadingScroll } from './reading-line.pure';
