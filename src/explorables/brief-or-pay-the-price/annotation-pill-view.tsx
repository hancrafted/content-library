import { cn } from '@/shared/lib/utils';
import { tagSpot, type Point } from './annotation-spots.pure';
import type { Annotation, Layout } from './scenario.types';
import { pillAt } from './workflow-annotations.pure';
import { SizedText } from './workflow-text';

type PillKind = 'tag' | 'chip';

const OUTLINE: Record<PillKind, string> = {
  tag: 'fill-(--success)/20 stroke-(--success)',
  chip: 'fill-card stroke-ai',
};
const PAST = 'fill-card stroke-foreground/25';

interface PillProps {
  readonly at: Point;
  readonly text: string;
  readonly kind: PillKind;
  readonly past: boolean;
  readonly size?: number;
  readonly room?: number;
  readonly align?: 'middle' | 'end';
}

export function PillView({ at, text, kind, past, size, room, align }: PillProps) {
  const pill = pillAt(at, text, { size, room, align });
  const box = { x: pill.x, y: pill.y, width: pill.w, height: pill.h, rx: pill.h / 2 };
  return (
    <g data-annotation={kind} data-past={past}>
      <rect className={past ? PAST : OUTLINE[kind]} strokeWidth={2} {...box} />
      <SizedText
        className={cn('font-semibold', past ? 'fill-muted-foreground' : 'fill-foreground')}
        size={pill.size}
        x={pill.textX}
        y={pill.textY}
      >
        {text}
      </SizedText>
    </g>
  );
}

interface AnnotationPillProps<T extends Annotation> {
  readonly annotation: T;
  readonly layout: Layout;
  readonly text: string;
  readonly past: boolean;
}

export function TagView({ annotation, layout, text, past }: AnnotationPillProps<Extract<Annotation, { type: 'tag' }>>) {
  const rect = layout.nodes[annotation.node];
  if (rect === undefined) return null;
  const { at, size, align } = tagSpot(layout, rect);
  return <PillView at={at} text={text} kind="tag" past={past} size={size} align={align} />;
}

export function ChipView({
  annotation,
  layout,
  text,
  past,
}: AnnotationPillProps<Extract<Annotation, { type: 'chip' }>>) {
  const edge = layout.edges.find((each) => each.id === annotation.edge);
  if (edge === undefined) return null;
  return <PillView at={edge.mid} text={text} kind="chip" past={past} size={15} room={edge.mid.room} />;
}
