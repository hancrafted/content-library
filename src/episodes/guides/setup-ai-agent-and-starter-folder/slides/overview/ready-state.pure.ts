/** The two readiness flags the check skill puts on the Guide link: `?skills=true&local-setup=true`. */
export interface ReadyFlags {
  readonly skills: boolean | undefined;
  readonly localSetup: boolean | undefined;
}

export type MissingPiece = 'skills' | 'localSetup';

/** What the Overview shows: the plain checklist, the ready card, or the card naming what is still missing. */
export type OverviewView =
  | { readonly kind: 'normal' }
  | { readonly kind: 'ready' }
  | { readonly kind: 'missing'; readonly flags: ReadyFlags; readonly missing: readonly MissingPiece[] };

/** Only the exact words `true` and `false` count; anything else, or no value, is unknown. */
function flag(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

/** Reads the flags from a `location.search` string, with or without the leading `?`. */
export function parseReadyFlags(search: string): ReadyFlags {
  const params = new URLSearchParams(search);
  return { skills: flag(params.get('skills')), localSetup: flag(params.get('local-setup')) };
}

/** `ready` when both flags are true, `missing` when at least one is false, otherwise `normal`. */
export function decideView(flags: ReadyFlags): OverviewView {
  const missing: MissingPiece[] = [];
  if (flags.skills === false) missing.push('skills');
  if (flags.localSetup === false) missing.push('localSetup');
  if (missing.length > 0) return { kind: 'missing', flags, missing };
  if (flags.skills === true && flags.localSetup === true) return { kind: 'ready' };
  return { kind: 'normal' };
}

/** The view for the query flags, or `ready` once the viewer ticks that they ran the check skill: it only runs after the rest works. */
export function viewFor(flags: ReadyFlags, skillRan: boolean): OverviewView {
  return skillRan ? { kind: 'ready' } : decideView(flags);
}
