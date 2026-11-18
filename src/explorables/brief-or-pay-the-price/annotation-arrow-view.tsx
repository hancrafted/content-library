import type { Annotation, Layout } from './scenario.types';
import { SizedText } from './workflow-text';

export const markerIdOf = (layout: Layout): string => `workflow-arrow-${layout.orient}`;

type Arrow = Extract<Annotation, { type: 'arrow' }>;

interface ArrowProps {
  readonly annotation: Arrow;
  readonly layout: Layout;
  readonly text: string;
}

const STROKE = 'fill-none stroke-ai';

function NarrowArrow({ annotation, layout, text }: ArrowProps) {
  const from = layout.box(annotation.from);
  const to = layout.box(annotation.to);
  const under = annotation.route === 'under';
  const lane = under ? layout.lanes.under : layout.lanes.over;
  const startX = under ? from.left - 10 : from.right + 10;
  const endX = under ? to.left - 14 : to.right + 14;
  const midY = (from.cy + to.cy) / 2;
  const textX = under ? lane + 20 : lane - 20;
  const d = `M${startX} ${from.cy}H${lane}V${to.cy}H${endX}`;
  return (
    <>
      <path className={STROKE} strokeWidth={4} d={d} markerEnd={`url(#${markerIdOf(layout)})`} />
      <SizedText className="fill-ai font-semibold" size={17} x={textX} y={midY} turn={under ? -90 : 90}>
        {text}
      </SizedText>
    </>
  );
}

function WideArrow({ annotation, layout, text }: ArrowProps) {
  const from = layout.box(annotation.from);
  const to = layout.box(annotation.to);
  const under = annotation.route === 'under';
  const lane = under ? layout.lanes.under : layout.lanes.over;
  const d = under
    ? `M${from.cx} ${from.bottom + 10}V${lane}H${to.cx}V${to.bottom + 14}`
    : `M${from.cx} ${from.top - 10}V${lane}H${to.cx}V${to.top - 14}`;
  return (
    <>
      <path className={STROKE} strokeWidth={4} d={d} markerEnd={`url(#${markerIdOf(layout)})`} />
      <SizedText
        className="fill-ai font-semibold"
        size={19}
        x={(from.cx + to.cx) / 2}
        y={under ? lane + 36 : lane - 16}
      >
        {text}
      </SizedText>
    </>
  );
}

export function ArrowView(props: ArrowProps) {
  return (
    <g data-annotation="arrow">
      {props.layout.orient === 'vertical' ? <NarrowArrow {...props} /> : <WideArrow {...props} />}
    </g>
  );
}
