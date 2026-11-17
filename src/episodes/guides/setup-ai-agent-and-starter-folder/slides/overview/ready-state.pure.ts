import { isReady, type ReadyFlags } from '@/episodes/lib/guide-ready-flags.pure';

export type MissingPiece = 'skills' | 'localSetup';

export type OverviewView =
  | { readonly kind: 'normal' }
  | { readonly kind: 'ready' }
  | { readonly kind: 'missing'; readonly flags: ReadyFlags; readonly missing: readonly MissingPiece[] };

export function decideView(flags: ReadyFlags): OverviewView {
  const missing: MissingPiece[] = [];
  if (flags.skills === false) missing.push('skills');
  if (flags.localSetup === false) missing.push('localSetup');
  if (missing.length > 0) return { kind: 'missing', flags, missing };
  if (isReady(flags)) return { kind: 'ready' };
  return { kind: 'normal' };
}

export function viewFor(flags: ReadyFlags, skillRan: boolean): OverviewView {
  return skillRan ? { kind: 'ready' } : decideView(flags);
}
