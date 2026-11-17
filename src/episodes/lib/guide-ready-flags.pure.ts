export interface ReadyFlags {
  readonly skills: boolean | undefined;
  readonly localSetup: boolean | undefined;
}

function flag(value: string | null): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function parseReadyFlags(search: string): ReadyFlags {
  const params = new URLSearchParams(search);
  return { skills: flag(params.get('skills')), localSetup: flag(params.get('local-setup')) };
}

export function isReady(flags: ReadyFlags): boolean {
  return flags.skills === true && flags.localSetup === true;
}
