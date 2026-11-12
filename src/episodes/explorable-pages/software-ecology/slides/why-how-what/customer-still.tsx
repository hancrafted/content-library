import { leadTimeText } from '@/explorables/software-ecology/customer-card-view';
import type { Release } from '@/explorables/software-ecology/stage-readouts.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { FactoryStillState } from './factory-still-state';
import { GlyphAt, type Formats } from './still-parts';

const CELL = 18;
/** Where the readouts start under the grid, and the room each takes: its label, then its value right-aligned under it. */
const ROWS = { top: 122, step: 32, value: 15 };

const cellClass = (r: Release | null) => {
  if (r === null) return 'fill-muted';
  return r.good ? 'fill-(--success)/35' : 'fill-destructive/40';
};

/** The last twelve releases as a 3 × 4 grid: good, bad, and a red warning on one that brought a complaint. */
function Releases({ releases, x, y }: { releases: readonly (Release | null)[]; x: number; y: number }) {
  return (
    <g>
      {releases.map((r, i) => {
        const cx = x + (i % 3) * CELL,
          cy = y + Math.floor(i / 3) * CELL;
        return (
          <g key={i}>
            <rect x={cx} y={cy} width="14" height="14" rx="3" className={cellClass(r)} />
            {r?.complaint && <path d={`M${cx + 7} ${cy + 3}l4.5 8h-9z`} className="fill-destructive" />}
          </g>
        );
      })}
    </g>
  );
}

/** The Customer card's readouts, label left and value right. */
function rowsOf(state: FactoryStillState, f: Formats): [string, string][] {
  const c = state.customer,
    w = state.words.customer;
  return [
    [w.satisfied, f.percent.format(c.sat)],
    [w.leadTime, leadTimeText(c.leadDays, w)],
    [w.couldServe, fillTemplate(w.demand, { n: f.number.format(c.headroom) })],
    [w.bugs, f.number.format(c.bugs)],
  ];
}

/** The Customer card's readouts, a row each from `y`. */
function Readouts({ state, f, x, w, y }: { state: FactoryStillState; f: Formats; x: number; w: number; y: number }) {
  return rowsOf(state, f).map(([label, value], i) => (
    <g key={label}>
      <text x={x + 12} y={y + i * ROWS.step} className="fill-muted-foreground text-caption">
        {label}
      </text>
      <text
        x={x + w - 12}
        y={y + i * ROWS.step + ROWS.value}
        textAnchor="end"
        className="fill-foreground text-caption font-semibold"
      >
        {value}
      </text>
    </g>
  ));
}

/** The Customer card, the still's focal point: its releases, output relative to ideal and the readouts under them. */
export function CustomerStill({ state, f }: { state: FactoryStillState; f: Formats }) {
  const c = state.customer,
    [x, y, w, h] = c.box;
  return (
    <g data-station="customer">
      <rect x={x} y={y} width={w} height={h} rx="10" strokeWidth="2.5" className="fill-card stroke-primary" />
      <GlyphAt name="customer" x={x + 12} y={y + 12} size={18} className="text-foreground" />
      <text x={x + 36} y={y + 27} className="fill-foreground text-caption font-semibold">
        {c.title}
      </text>
      <Releases releases={c.releases} x={x + 12} y={y + 42} />
      <text x={x + w - 12} y={y + 64} textAnchor="end" className="fill-primary text-body font-semibold">
        {f.number.format(c.output)}×
      </text>
      <text x={x + w - 12} y={y + 82} textAnchor="end" className="fill-muted-foreground text-caption">
        {state.words.customer.ofIdeal}
      </text>
      <Readouts state={state} f={f} x={x} w={w} y={y + ROWS.top} />
    </g>
  );
}
