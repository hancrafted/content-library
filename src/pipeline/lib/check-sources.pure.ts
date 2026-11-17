import { parse } from 'yaml';

export type Verdict = 'ok' | 'dead' | 'unverifiable';

export type Outcome = { status: number } | { error: string };

const DEAD_ERRORS = ['ENOTFOUND', 'EAI_AGAIN', 'ENODATA'];

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

export function linksIn(text: string): string[] {
  const found = [...text.matchAll(/https?:\/\/[^\s"'`<>\]]+/g)].map(([url]) => url.replace(/[).,;:!?]+$/, ''));
  return [...new Set(found)];
}

export function classify(outcome: Outcome): Verdict {
  if ('error' in outcome) return DEAD_ERRORS.includes(outcome.error) ? 'dead' : 'unverifiable';
  if (outcome.status >= 200 && outcome.status < 300) return 'ok';
  return outcome.status === 404 || outcome.status === 410 ? 'dead' : 'unverifiable';
}

export function summarize(verdicts: readonly Verdict[]): Record<Verdict, number> & { failed: boolean } {
  const count = (wanted: Verdict): number => verdicts.filter((verdict) => verdict === wanted).length;
  return { ok: count('ok'), dead: count('dead'), unverifiable: count('unverifiable'), failed: count('dead') > 0 };
}
