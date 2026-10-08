import { formatMark, type VoiceScriptSegment } from '@/lib/context-drawer.pure';
import type { ContextLabels } from './context-labels';

function Segment({ segment, labels }: { segment: VoiceScriptSegment; labels: ContextLabels }) {
  return (
    <li className="flex flex-col gap-1 break-inside-avoid border-t pt-3">
      <p className="font-mono text-xs text-muted-foreground tabular-nums">
        {formatMark(segment.from)}–{formatMark(segment.to)}
      </p>
      <h6 className="text-sm font-semibold">{segment.title}</h6>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium">{labels.keywords}:</span> {segment.keywords.join(', ')}
      </p>
      <p className="text-sm leading-relaxed">{segment.script}</p>
      {segment.bridge && (
        <p className="text-sm leading-relaxed italic">
          <span className="font-medium not-italic">{labels.bridge}:</span> {segment.bridge}
        </p>
      )}
    </li>
  );
}

/** One Slide's Voice script, or the empty state. Server-rendered into the page (FE-010 §2). */
export function SlideScript({ segments, labels }: { segments: readonly VoiceScriptSegment[]; labels: ContextLabels }) {
  if (segments.length === 0) return <p className="text-sm text-muted-foreground">{labels.empty.script}</p>;
  return (
    <ol className="flex flex-col gap-3">
      {segments.map((segment) => (
        <Segment key={segment.slug} segment={segment} labels={labels} />
      ))}
    </ol>
  );
}
