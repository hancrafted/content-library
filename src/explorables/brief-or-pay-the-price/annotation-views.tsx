import type { ReactNode } from 'react';
import { ArrowView } from './annotation-arrow-view';
import { ChipView, TagView } from './annotation-pill-view';
import type { Annotation, Layout, MarkKind, Scenario } from './scenario.types';
import { groupBoxOf, rightEdgeOf } from './workflow-annotations.pure';
import { SizedText } from './workflow-text';

interface GroupProps {
  readonly annotation: Extract<Annotation, { type: 'group' }>;
  readonly layout: Layout;
  readonly text: string;
  readonly labelY: number;
}

export function GroupView({ annotation, layout, text, labelY }: GroupProps) {
  const box = groupBoxOf(layout, annotation.nodes);
  const narrow = layout.orient === 'vertical';
  const frame = { x: box.x, y: box.y, width: box.w, height: box.h, rx: narrow ? 12 : 18 };
  return (
    <g data-annotation="group">
      <rect className="fill-none stroke-ai" strokeWidth={2.5} strokeDasharray="10 7" {...frame} />
      <SizedText
        className="fill-ai font-semibold"
        size={narrow ? 15 : 19}
        x={narrow ? rightEdgeOf(layout) : box.x + box.w / 2}
        y={narrow ? labelY : box.y + box.h + 30}
        anchor={narrow ? 'end' : 'middle'}
      >
        {text}
      </SizedText>
    </g>
  );
}

function MarkIcon({ kind }: { readonly kind: MarkKind }) {
  if (kind === 'intent')
    return (
      <>
        <circle r={8} className="fill-none stroke-ai" strokeWidth={2} />
        <circle r={3} className="fill-ai" />
      </>
    );
  if (kind === 'check')
    return (
      <path
        d="M-7 0l4.5 4.5 9 -9"
        className="fill-none stroke-success"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  return (
    <>
      {[-9, -2.5, 4].map((x) => (
        <rect key={x} x={x} y={-4} width={5} height={8} className="fill-ai" />
      ))}
    </>
  );
}

export function MarkView({
  annotation,
  layout,
}: Pick<GroupProps, 'layout'> & { readonly annotation: Extract<Annotation, { type: 'mark' }> }) {
  return (
    <g data-annotation="mark">
      {annotation.nodes.map((id) => {
        const rect = layout.nodes[id];
        return rect === undefined ? null : (
          <g key={id} transform={`translate(${rect.x} ${rect.y})`}>
            <circle r={17} className="fill-card stroke-ai" strokeWidth={2.5} />
            <MarkIcon kind={annotation.kind} />
          </g>
        );
      })}
    </g>
  );
}

export interface AnnotationContext {
  readonly scenario: Scenario;
  readonly layout: Layout;
  readonly words: Readonly<Record<string, string>>;
  readonly past: boolean;
}

type Renderers = {
  readonly [T in Annotation['type']]: (
    annotation: Extract<Annotation, { type: T }>,
    context: AnnotationContext,
    text: string,
  ) => ReactNode;
};

const labelRowOf = (
  { scenario, layout }: AnnotationContext,
  annotation: Extract<Annotation, { type: 'group' }>,
): number => {
  const stage = scenario.nodes.find((node) => node.id === annotation.nodes[0])?.stage;
  return layout.stages.find((band) => band.id === stage)?.ly ?? 0;
};

const RENDER: Renderers = {
  highlight: () => null,
  arrow: (annotation, { layout }, text) => <ArrowView annotation={annotation} layout={layout} text={text} />,
  group: (annotation, context, text) => (
    <GroupView annotation={annotation} layout={context.layout} text={text} labelY={labelRowOf(context, annotation)} />
  ),
  tag: (annotation, { layout, past }, text) => (
    <TagView annotation={annotation} layout={layout} text={text} past={past} />
  ),
  chip: (annotation, { layout, past }, text) => (
    <ChipView annotation={annotation} layout={layout} text={text} past={past} />
  ),
  mark: (annotation, { layout }) => <MarkView annotation={annotation} layout={layout} />,
};

const textOf = (annotation: Annotation, words: AnnotationContext['words']): string =>
  'text' in annotation ? (words[annotation.text] ?? annotation.text) : '';

export function AnnotationView({
  annotation,
  context,
}: {
  readonly annotation: Annotation;
  readonly context: AnnotationContext;
}) {
  const render = RENDER[annotation.type] as (a: Annotation, c: AnnotationContext, t: string) => ReactNode;
  return render(annotation, context, textOf(annotation, context.words));
}
