import { formatMark, type VoiceScriptSegment } from '@/lib/context-drawer.pure';
import type { ContextLabels } from './context-labels';
import { FLAT_ITEM, FLAT_LIST } from './flat-list';

function Keywords({ keywords, label }: { keywords: readonly string[]; label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1">
      {keywords.map((keyword) => (
        <li key={keyword} className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          {keyword}
        </li>
      ))}
    </ul>
  );
}

function Segment({ segment, labels }: { segment: VoiceScriptSegment; labels: ContextLabels }) {
  return (
    <li data-segment={segment.slug} className={FLAT_ITEM}>
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs tabular-nums">
          {formatMark(segment.from)}–{formatMark(segment.to)}
        </span>
        <h6 className="text-base leading-snug font-semibold text-pretty">{segment.title}</h6>
      </div>
      <Keywords keywords={segment.keywords} label={labels.keywords} />
      <p className="text-sm leading-relaxed">{segment.script}</p>
      {segment.bridge && (
        <p className="border-l-2 border-foreground/30 pl-3 text-sm leading-relaxed italic">
          <span className="block text-xs font-medium tracking-wide text-muted-foreground uppercase not-italic">
            {labels.bridge}
          </span>
          {segment.bridge}
        </p>
      )}
    </li>
  );
}

/** One Slide's Voice script, or the empty state. Server-rendered into the page (FE-010 §2). */
export function SlideScript({ segments, labels }: { segments: readonly VoiceScriptSegment[]; labels: ContextLabels }) {
  if (segments.length === 0) return <p className="text-sm text-muted-foreground">{labels.empty.script}</p>;
  return (
    <ol className={FLAT_LIST}>
      {segments.map((segment) => (
        <Segment key={segment.slug} segment={segment} labels={labels} />
      ))}
    </ol>
  );
}
