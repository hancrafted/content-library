/** The two readiness flags the check skill puts on the Guide link: `?skills=true&local-setup=true`. */
export interface ReadyFlags {
  readonly skills: boolean | undefined;
  readonly localSetup: boolean | undefined;
}

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

/** Whether the check skill reported the whole setup as working: both flags true. */
export function isReady(flags: ReadyFlags): boolean {
  return flags.skills === true && flags.localSetup === true;
}
