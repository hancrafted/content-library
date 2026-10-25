/*
 * The allowlist (design-ADR 0016, Citations rule 9): the one place that decides which Sources a Speaker note may cite
 * directly. A host is on it when it is an accountable primary publisher of the claims it backs: a vendor's own
 * documentation of its product, a law's own text, or the scholarly record. There is one level, on or off. Adding a
 * host is a trust decision Han accepts in its own change, never a content edit.
 */

export const HIGH_TRUST_HOSTS = [
  { host: 'anthropic.com', reason: "Anthropic's own documentation of what its products do" },
  { host: 'claude.com', reason: "Anthropic's own documentation of Claude, its product" },
  { host: 'eur-lex.europa.eu', reason: "The official text of the European Union's law" },
  { host: 'arxiv.org', reason: "The scholarly record: papers under their authors' names" },
  { host: 'doi.org', reason: 'The scholarly record: resolves a published paper by its DOI' },
  { host: 'nber.org', reason: 'The scholarly record: working papers of the National Bureau of Economic Research' },
  { host: 'aeaweb.org', reason: "The scholarly record: the American Economic Association's journals" },
] as const satisfies readonly { readonly host: string; readonly reason: string }[];

function hostOf(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.hostname : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Whether a Speaker note may cite this Source directly: an `https://` URL whose host is an allowlisted host or one of
 * its subdomains. The match is anchored, so `docs.anthropic.com.evil.example` and `evilanthropic.com` are off it.
 */
export function isHighTrust(url: string): boolean {
  const host = hostOf(url);
  return host !== undefined && HIGH_TRUST_HOSTS.some((entry) => host === entry.host || host.endsWith(`.${entry.host}`));
}
