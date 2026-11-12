import { isReady, type ReadyFlags } from '@/episodes/lib/guide-ready-flags.pure';

export type MissingPiece = 'skills' | 'localSetup';

/** What the Overview shows: the plain checklist, the ready card, or the card naming what is still missing. */
export type OverviewView =
  | { readonly kind: 'normal' }
  | { readonly kind: 'ready' }
  | { readonly kind: 'missing'; readonly flags: ReadyFlags; readonly missing: readonly MissingPiece[] };

/** `ready` when both flags are true, `missing` when at least one is false, otherwise `normal`. */
export function decideView(flags: ReadyFlags): OverviewView {
  const missing: MissingPiece[] = [];
  if (flags.skills === false) missing.push('skills');
  if (flags.localSetup === false) missing.push('localSetup');
  if (missing.length > 0) return { kind: 'missing', flags, missing };
  if (isReady(flags)) return { kind: 'ready' };
  return { kind: 'normal' };
}

/** The view for the query flags, or `ready` once the viewer ticks that they ran the check skill: it only runs after the rest works. */
export function viewFor(flags: ReadyFlags, skillRan: boolean): OverviewView {
  return skillRan ? { kind: 'ready' } : decideView(flags);
}
