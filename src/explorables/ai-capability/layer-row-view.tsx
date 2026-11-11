import { externalHref } from '@/shared/lib/external-link.pure';
import type { ReactNode } from 'react';
import type { LayerItemId, LayerItemWords, LayerWords } from './ai-capability.types';

/*
 * The two layer rows' pure parts: the mini workflow each card draws, and the line under a row that names the lit card
 * (pure views). One vocabulary for both rows: boxes are steps, the part an item acts on is drawn in the card's tone
 * (`currentColor`), the rest muted. The cards themselves and their state live in layer-row.client.tsx.
 */

/** A step box; `on` fills it faintly in the card's tone, `dashed` marks a frame around it. */
function Box(props: { x: number; y: number; w: number; h: number; on?: boolean; dashed?: boolean }) {
  const { x, y, w, h, on, dashed } = props;
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="3"
      strokeWidth="1.3"
      strokeDasharray={dashed ? '3 2' : undefined}
      className={on ? 'fill-card stroke-current' : 'fill-card stroke-muted-foreground'}
    />
  );
}

/** An arrow from one step to the next. */
function Arrow({ x1, x2, y, on }: { x1: number; x2: number; y: number; on?: boolean }) {
  const tone = on ? 'stroke-current' : 'stroke-muted-foreground';
  return (
    <g className={`fill-none ${tone}`} strokeWidth="1.2">
      <path d={`M${x1} ${y}H${x2 - 1}`} />
      <path d={`M${x2 - 4} ${y - 2.5}L${x2} ${y}L${x2 - 4} ${y + 2.5}`} />
    </g>
  );
}

/** A person: a head and shoulders; faint when they stand outside the run. */
function Person({ x, y, faint }: { x: number; y: number; faint?: boolean }) {
  return (
    <g
      className={`fill-none ${faint ? 'stroke-muted-foreground' : 'stroke-current'}`}
      opacity={faint ? 0.4 : 1}
      strokeWidth="1.4"
    >
      <circle cx={x} cy={y} r="3" />
      <path d={`M${x - 5} ${y + 10}c0-3.5 2.3-5.5 5-5.5s5 2 5 5.5`} />
    </g>
  );
}

/** Three steps in a row, the workflow the Oversight cards share. */
const STEPS = (on: boolean) => (
  <>
    <Box x={4} y={22} w={22} h={12} on={on} />
    <Arrow x1={26} x2={49} y={28} on={on} />
    <Box x={49} y={22} w={22} h={12} on={on} />
    <Arrow x1={71} x2={94} y={28} on={on} />
    <Box x={94} y={22} w={22} h={12} on={on} />
  </>
);

/** Input → model → output, the flow the AI disciplines cards share; `model` replaces the middle box. */
const MODEL_FLOW = (input: ReactNode, model: ReactNode) => (
  <>
    {input}
    <Arrow x1={34} x2={50} y={28} />
    {model}
    <Arrow x1={76} x2={94} y={28} />
    <Box x={94} y={22} w={22} h={12} />
  </>
);
const MODEL = <Box x={50} y={18} w={26} h={20} />;

/** Each card's drawing, hoisted: built once, never per render. */
const FLOWS: Record<LayerItemId, ReactNode> = {
  prompt: MODEL_FLOW(
    <>
      <Box x={4} y={20} w={30} h={16} on />
      <path d="M9 25h20M9 29h16M9 33h12" className="stroke-current" strokeWidth="1.2" />
    </>,
    MODEL,
  ),
  context: MODEL_FLOW(
    <>
      <Box x={6} y={6} w={18} h={14} on />
      <Box x={10} y={10} w={18} h={14} on />
      <Box x={14} y={14} w={18} h={14} on />
    </>,
    MODEL,
  ),
  harness: (
    <>
      <Box x={4} y={22} w={18} h={12} />
      <Arrow x1={22} x2={38} y={28} />
      <rect
        x="38"
        y="6"
        width="50"
        height="32"
        rx="5"
        strokeWidth="1.4"
        strokeDasharray="3 2"
        className="fill-none stroke-current"
      />
      <Box x={50} y={18} w={26} h={16} />
      <rect x="42" y="9" width="7" height="7" rx="1.5" className="fill-current" />
      <rect x="77" y="9" width="7" height="7" rx="1.5" className="fill-current" />
      <Arrow x1={88} x2={100} y={28} />
      <Box x={100} y={22} w={16} h={12} />
    </>
  ),
  loop: (
    <>
      <Box x={4} y={22} w={18} h={12} />
      <Arrow x1={22} x2={46} y={28} />
      <Box x={46} y={20} w={28} h={16} />
      <g className="fill-none stroke-current" strokeWidth="1.5">
        <path d="M74 24 C92 4, 28 4, 46 24" />
        <path d="M43 19 L46 24 L50 20" />
      </g>
      <Arrow x1={74} x2={98} y={30} />
      <Box x={98} y={24} w={18} h={12} />
    </>
  ),
  graph: (
    <>
      <path d="M20 20 L44 8 M20 20 L44 32 M60 8 L84 20 M60 32 L84 20" className="stroke-current" strokeWidth="1.3" />
      <Box x={4} y={15} w={16} h={10} on />
      <Box x={44} y={3} w={16} h={10} on />
      <Box x={44} y={27} w={16} h={10} on />
      <Box x={84} y={15} w={16} h={10} on />
      <path d="M100 20H116" className="stroke-muted-foreground" strokeWidth="1.2" />
    </>
  ),
  hitl: (
    <>
      {STEPS(false)}
      <Person x={37.5} y={4} />
      <Person x={82.5} y={4} />
      <g className="fill-none stroke-current" strokeWidth="1.4">
        <path d="M37.5 16v8M82.5 16v8" />
        <path d="M34 27l2.5 2.5 4.5-4.5M79 27l2.5 2.5 4.5-4.5" />
      </g>
    </>
  ),
  hotl: (
    <>
      {STEPS(false)}
      <Person x={60} y={3} />
      <path
        d="M54 15 L18 21 M60 15 V21 M66 15 L102 21"
        className="stroke-current"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <rect x="72" y="2" width="9" height="9" rx="1.5" className="fill-none stroke-current" strokeWidth="1.3" />
      <rect x="75" y="5" width="3" height="3" className="fill-current" />
    </>
  ),
  hootl: (
    <>
      {STEPS(true)}
      <Person x={9} y={5} faint />
    </>
  ),
};

/** A card's mini workflow, 120 by 40: where in a run the discipline acts, or where the person sits. */
export function LayerFlowView({ id }: { readonly id: LayerItemId }) {
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-26 shrink-0" aria-hidden="true">
      {FLOWS[id]}
    </svg>
  );
}

/** The labels the line under a layer row shares with the cards. */
export interface LayerDetailLabels {
  readonly source: string;
  readonly newTab: string;
  readonly emerging: string;
}

/** The source a pinned card cites, opening in a new tab. */
function SourceLink(props: { readonly url: string; readonly label: string; readonly labels: LayerDetailLabels }) {
  return (
    <a
      href={externalHref(props.url)}
      target="_blank"
      rel="noopener noreferrer"
      className="w-fit font-semibold underline underline-offset-2"
    >
      {props.labels.source}: {props.label}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> ({props.labels.newTab})</span>
    </a>
  );
}

/** What a pinned card adds: the quote its term comes from, for an oversight mode, and its source. */
function Pinned({
  row,
  item,
  labels,
}: {
  readonly row: LayerWords;
  readonly item: LayerItemWords;
  readonly labels: LayerDetailLabels;
}) {
  const url = item.sourceUrl ?? row.sourceUrl;
  const label = item.sourceLabel ?? row.sourceLabel;
  return (
    <>
      {item.quote ? (
        <blockquote className="border-l-3 border-(--ai) bg-muted px-3 py-1">
          “{item.quote}” <span className="text-muted-foreground">{row.origin}</span>
        </blockquote>
      ) : null}
      {url && label ? <SourceLink url={url} label={label} labels={labels} /> : null}
    </>
  );
}

/**
 * The line under a layer row: the hint while no card is lit; the lit card's name and definition while one is hovered;
 * and, once a card is clicked, its source too, or for an oversight mode the quote its term comes from.
 */
export function LayerDetailView(props: {
  readonly row: LayerWords;
  readonly item: LayerItemWords | null;
  readonly emerging: boolean;
  readonly pinned: boolean;
  readonly labels: LayerDetailLabels;
}) {
  const { row, item, labels } = props;
  if (item === null) return <p className="text-caption text-muted-foreground">{row.hint}</p>;
  return (
    <div className="flex flex-col gap-1 text-caption">
      <p>
        <span className="font-semibold">{item.name}</span>
        {props.emerging ? <span className="ml-2 text-muted-foreground italic">{labels.emerging}</span> : null}
        <span className="text-muted-foreground"> · </span>
        {item.definition}
      </p>
      {props.pinned ? <Pinned row={row} item={item} labels={labels} /> : null}
    </div>
  );
}
