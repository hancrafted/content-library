import { DocIcon } from '@/explorables/software-ecology/doc-icon-view';
import { RACK_SLOTS, rackOf, type Rack, type Release } from './factory-preview.pure';

/** One work center as the preview draws it: its words, its backlog and what marks it. */
export interface PreviewCenter {
  readonly key: string;
  readonly label: string;
  /** Documents in its backlog. */
  readonly waiting: number;
  /** AI is on here: its document in work and its out belt turn orange, with the turbo. */
  readonly ai?: boolean;
  /** Its rack is full: the card turns red and its label reads its weeks of work waiting. */
  readonly full?: boolean;
  /** It is the inspection: a `human` shield in its corner. */
  readonly inspection?: boolean;
}

export interface PreviewCustomer {
  readonly label: string;
  readonly output: string;
  readonly satisfied: string;
  /** The last twelve releases, oldest first, filling a 3×4 grid. */
  readonly releases: readonly Release[];
}

export interface FactoryPreviewProps {
  readonly customer: PreviewCustomer;
  /** The main path a request rides, left to right. */
  readonly centers: readonly PreviewCenter[];
  /** The full rack's "+n", already worded. */
  readonly overflow: string;
}

const CARD = { y: 40, width: 96, height: 72, gap: 28, first: 118 };
const BELT_Y = 76;
const SLOT = { x: 6, width: 13, height: 7, step: 9 };
const CUSTOMER_RIGHT = 100;

const leftOf = (index: number) => CARD.first + index * (CARD.width + CARD.gap);
/** Where the belt into the work center at `index` starts: the Customer's edge, or the previous card's. */
const beltStartOf = (index: number) => (index === 0 ? CUSTOMER_RIGHT : leftOf(index - 1) + CARD.width);
/** The rack slot `slot`, counted from the bottom. */
const slotY = (slot: number) => CARD.y + 58 - slot * SLOT.step;

function labelClass({ full, ai }: PreviewCenter) {
  if (full) return 'fill-destructive';
  return ai ? 'fill-ai' : 'fill-muted-foreground';
}

/** A rack slot's fill: waiting work tinted orange when AI made it, the top slot red when the rack is full. */
function slotClass(slot: number, rack: Rack, ai: boolean) {
  if (rack.full && slot === RACK_SLOTS - 1) return 'fill-destructive/25 stroke-destructive';
  if (slot >= rack.filled) return 'fill-none stroke-machine/40';
  return ai ? 'fill-ai/40 stroke-ai/60' : 'fill-foreground/25 stroke-foreground/30';
}

/** The rack of six slots on the card's left, with "+n" beside a full one. */
function RackSlots({ left, rack, ai, overflow }: { left: number; rack: Rack; ai: boolean; overflow: string }) {
  return (
    <>
      {Array.from({ length: RACK_SLOTS }, (_, slot) => (
        <rect
          key={slot}
          x={left + SLOT.x}
          y={slotY(slot)}
          width={SLOT.width}
          height={SLOT.height}
          rx="1.5"
          strokeWidth="1"
          className={slotClass(slot, rack, ai)}
        />
      ))}
      {rack.overflow > 0 && (
        <text x={left + 23} y={slotY(RACK_SLOTS - 1) + 3} className="fill-destructive text-caption font-semibold">
          {overflow}
        </text>
      )}
    </>
  );
}

/** The inspection's shield, `human`, in the card's top-right corner. */
function Shield({ left }: { left: number }) {
  return (
    <path
      d={`M${left + 80} 47l5 2v4c0 3-2.5 5-5 6c-2.5-1-5-3-5-6v-4z`}
      strokeWidth="1.4"
      className="fill-human/25 stroke-human"
    />
  );
}

interface CenterProps {
  readonly center: PreviewCenter;
  readonly index: number;
  /** Its input comes from the AI work center: its waiting work is AI-made. */
  readonly aiIn: boolean;
  readonly overflow: string;
}

function Center({ center, index, aiIn, overflow }: CenterProps) {
  const left = leftOf(index);
  const aiWork = Boolean(center.ai) || aiIn;
  return (
    <g>
      <text
        x={left + CARD.width / 2}
        y="33"
        textAnchor="middle"
        className={`${labelClass(center)} text-caption font-semibold`}
      >
        {center.label}
      </text>
      <rect
        x={left}
        y={CARD.y}
        width={CARD.width}
        height={CARD.height}
        rx="8"
        strokeWidth={center.full ? 2 : 1.2}
        className={center.full ? 'fill-card stroke-destructive' : 'fill-card stroke-foreground/25'}
      />
      {center.inspection && <Shield left={left} />}
      <RackSlots left={left} rack={rackOf(center.waiting)} ai={aiWork} overflow={overflow} />
      <DocIcon quality="good" ai={aiWork && center.waiting > 0} x={left + 50} y={68} scale={1.35} />
    </g>
  );
}

/** The turbo on an AI work center's out belt, and the AI-made documents it pushes on and piles at the belt's end. */
function Turbo({ index }: { index: number }) {
  const start = leftOf(index) + CARD.width + 2;
  return (
    <g>
      {[0, 9, 18].map((dx) => (
        <path
          key={dx}
          d={`M${start + dx} 55l5 5l-5 5`}
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-ai"
        />
      ))}
      <DocIcon quality="good" ai x={start + 1} y={69} />
      <DocIcon quality="bad" ai x={start + 9} y={72} />
      {/* The pile-up at the belt's end: the waiting documents themselves. */}
      <DocIcon quality="good" ai x={start - 2} y={90} />
      <DocIcon quality="good" ai x={start + 10} y={96} />
      <DocIcon quality="bad" ai x={start + 2} y={108} />
      <DocIcon quality="good" ai x={start + 12} y={122} />
      <DocIcon quality="good" ai x={start} y={130} />
    </g>
  );
}

/** The Customer's card: its last releases as a grid, its output beside them and its satisfaction under them. */
function Customer({ customer }: { customer: PreviewCustomer }) {
  return (
    <g>
      <rect x="8" y="40" width="92" height="100" rx="8" strokeWidth="1.2" className="fill-card stroke-foreground/25" />
      <text x="54" y="33" textAnchor="middle" className="fill-foreground text-caption font-semibold">
        {customer.label}
      </text>
      {customer.releases.map((release, index) => (
        <rect
          key={index}
          x={16 + (index % 3) * 12}
          y={50 + Math.floor(index / 3) * 12}
          width="9"
          height="9"
          rx="2"
          className={release === 'bad' ? 'fill-destructive/70' : 'fill-foreground/15'}
        />
      ))}
      <text x="92" y="68" textAnchor="end" className="fill-primary text-caption font-semibold">
        {customer.output}
      </text>
      <text x="16" y="129" className="fill-primary text-caption font-semibold">
        {customer.satisfied}
      </text>
    </g>
  );
}

/** The release belt over the top, from the last work center back to the Customer, with three releases on it. */
function ReleaseBelt({ last }: { last: number }) {
  return (
    <g>
      <path
        d={`M${last} ${BELT_Y}H${last + 38}V14H54V40`}
        fill="none"
        strokeWidth="10"
        strokeLinejoin="round"
        className="stroke-machine/15"
      />
      <DocIcon quality="good" x={640} y={7} />
      <DocIcon quality="bad" x={420} y={7} />
      <DocIcon quality="good" x={180} y={7} />
    </g>
  );
}

/** The belts into each work center; up to the AI work center each carries one plain document. */
function Belts({ centers, aiAt }: { centers: readonly PreviewCenter[]; aiAt: number }) {
  return centers.map((center, index) => (
    <g key={center.key}>
      <line
        x1={beltStartOf(index)}
        y1={BELT_Y}
        x2={leftOf(index)}
        y2={BELT_Y}
        strokeWidth="10"
        className="stroke-machine/15"
      />
      {(aiAt < 0 || index <= aiAt) && <DocIcon quality="good" x={beltStartOf(index) + 2} y={69} />}
    </g>
  ));
}

/**
 * The Title slide's preview of the software ecology factory, in the steady frame of the Visual language: the Customer
 * on the left, the main path a request rides as a row of work centers with their racks, the belts between them, and
 * the release belt over the top back to the Customer. Static, server-rendered and decorative: the `ToolPreview` around
 * it names the picture.
 */
export function FactoryPreview({ customer, centers, overflow }: FactoryPreviewProps) {
  const aiAt = centers.findIndex((center) => center.ai);
  return (
    <svg viewBox="0 0 960 150" className="h-auto w-full" aria-hidden="true">
      <ReleaseBelt last={leftOf(centers.length - 1) + CARD.width} />
      <Customer customer={customer} />
      <Belts centers={centers} aiAt={aiAt} />
      {centers.map((center, index) => (
        <Center
          key={center.key}
          center={center}
          index={index}
          aiIn={aiAt >= 0 && index === aiAt + 1}
          overflow={overflow}
        />
      ))}
      {aiAt >= 0 && <Turbo index={aiAt} />}
      {aiAt >= 0 && aiAt + 2 < centers.length && <DocIcon quality="bad" ai x={leftOf(aiAt + 2) - 24} y={69} />}
    </svg>
  );
}
