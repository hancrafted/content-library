import { z } from 'zod';
import { sourceRecord } from './citations.pure';
import { isHighTrust } from './high-trust-hosts.pure';
import type { SlideSource } from './slide-source.pure';

/*
 * The Source baseline (design-ADR 0016, Citations rule 13): every Speaker note source that cited a Source off the
 * allowlist when the citation contract began, grandfathered in `source-baseline.json` until a Run touching its note
 * moves it to a Research question. It may only shrink: a direct url is high trust or listed here, and an entry whose
 * source is gone is refused, so fixing a source forces its entry out.
 */

/** Where the baseline lives, as a refusal names it. */
export const SOURCE_BASELINE_FILE = 'src/lib/source-baseline.json';

export const sourceBaselineEntrySchema = z
  .strictObject({
    source: z
      .string()
      .regex(/^[a-z0-9-]+(\/[a-z0-9-]+){3}$/, 'must name a source item as <episode>/<slide>/<note>/<slug>')
      .describe('The grandfathered source item, as <episode>/<slide>/<note>/<slug>'),
    url: z.url().describe('The off-list Source that item cites'),
  })
  .describe('One Speaker note source grandfathered off the allowlist until its note moves it to a Research question');

export type SourceBaselineEntry = z.infer<typeof sourceBaselineEntrySchema>;

/** One refusal: a direct url no allowlist or baseline vouches for, or a baseline entry that grandfathers nothing. */
interface Problem {
  readonly kind: 'slide-source' | 'source-baseline';
  readonly record: string;
  readonly message: string;
}

const keyOf = ({ source, url }: SourceBaselineEntry) => `${source} ${url}`;

/** Every direct url source off the allowlist, as baseline entries. */
function offListSources(sources: readonly SlideSource[]): SourceBaselineEntry[] {
  return sources.flatMap((each) =>
    each.url === undefined || isHighTrust(each.url) ? [] : [{ source: sourceRecord(each), url: each.url }],
  );
}

/**
 * One problem per direct url source that is neither high trust nor in the baseline, and one per baseline entry that
 * grandfathers no off-list source any more.
 */
export function sourceTrustProblems(
  sources: readonly SlideSource[],
  baseline: readonly SourceBaselineEntry[],
): Problem[] {
  const offList = offListSources(sources);
  const listed = new Set(baseline.map(keyOf));
  const cited = new Set(offList.map(keyOf));
  return [
    ...offList
      .filter((entry) => !listed.has(keyOf(entry)))
      .map(({ source, url }) => ({
        kind: 'slide-source' as const,
        record: source,
        message: `${url} is no high-trust Source and not in the Source baseline: cite a Research question that weighs it`,
      })),
    ...baseline
      .filter((entry) => !cited.has(keyOf(entry)))
      .map(({ source, url }) => ({
        kind: 'source-baseline' as const,
        record: source,
        message: isHighTrust(url)
          ? `${url} is high trust and needs no entry: delete it from ${SOURCE_BASELINE_FILE}`
          : `no Speaker note cites ${url} here any more: delete the entry from ${SOURCE_BASELINE_FILE}`,
      })),
  ];
}
