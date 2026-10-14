// The pure half of `npm run check:sources`: the URLs a research file cites, how one fetch outcome
// is judged, and when the whole run fails. The script fetches; nothing here touches the network.
import { parse } from 'yaml';

export type Verdict = 'ok' | 'dead' | 'unverifiable';

/** What one fetch ended in: an HTTP status, or the error code or `timeout` when none came. */
export type Outcome = { status: number } | { error: string };

/** Error codes that mean the host does not exist, as opposed to a network hiccup. */
const DEAD_ERRORS = ['ENOTFOUND', 'EAI_AGAIN', 'ENODATA'];

/** The `resource` of each entry of the frontmatter's `sources`; none when the file has no readable ones. */
export function resourcesOf(text: string): string[] {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1];
  if (block === undefined) return [];
  try {
    const sources = (parse(block) as { sources?: unknown } | null)?.sources;
    if (!Array.isArray(sources)) return [];
    return sources.flatMap((source: unknown) => {
      const resource = (source as { resource?: unknown } | null)?.resource;
      return typeof resource === 'string' ? [resource] : [];
    });
  } catch {
    return [];
  }
}

/** 2xx is ok; 404, 410 and a host that does not resolve are dead; everything else cannot be told from a blocked bot. */
export function classify(outcome: Outcome): Verdict {
  if ('error' in outcome) return DEAD_ERRORS.includes(outcome.error) ? 'dead' : 'unverifiable';
  if (outcome.status >= 200 && outcome.status < 300) return 'ok';
  return outcome.status === 404 || outcome.status === 410 ? 'dead' : 'unverifiable';
}

/** The count of each verdict; the run fails only when a link is dead. */
export function summarize(verdicts: readonly Verdict[]): Record<Verdict, number> & { failed: boolean } {
  const count = (wanted: Verdict): number => verdicts.filter((verdict) => verdict === wanted).length;
  return { ok: count('ok'), dead: count('dead'), unverifiable: count('unverifiable'), failed: count('dead') > 0 };
}
