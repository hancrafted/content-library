import { fillTemplate } from '@/shared/lib/template.pure';
import { CustomerStill } from './customer-still';
import type { FactoryStillState } from './factory-still-state';
import { Pile, Station, Turbo } from './station-still';
import { Doc, formatsOf, type Formats } from './still-parts';

/** A numbered pin on the still: the note of the same number explains what it points at. */
export interface Pin {
  readonly n: 1 | 2 | 3;
  readonly at: 'qa' | 'ba';
}

export interface FactoryStillWords {
  readonly label: string;
  /** "+{n}" past a full rack. */
  readonly overflow: string;
  /** "{n} pull requests per task", beside the AI work center's turbo. */
  readonly aiExtra: string;
}

const PIN_R = 16;
/** The belts whose names the still shows: the path the story follows, and the bug reports coming back; the rest stay unnamed, as at rest in the Explorable. */
const NAMED = new Set(['sales-ba', 'ba-eng', 'support-eng', 'eng-qa', 'qa-ops', 'ops-customer']);
const PAD = 12;
/** Room over the floor for the "+n" over a full rack and the pins. */
const HEADROOM = 40;

function Lanes({ state }: { state: FactoryStillState }) {
  return state.belts.map((b) =>
    b.back ? (
      <path
        key={b.key}
        d={b.back}
        fill="none"
        strokeWidth="8"
        strokeLinejoin="round"
        className="stroke-destructive/30"
      />
    ) : null,
  );
}

/** The junction plates where belts meet. */
function Plates({ state }: { state: FactoryStillState }) {
  return state.plates.map(([x, y]) => (
    <rect
      key={`${x},${y}`}
      x={x - 14}
      y={y - 14}
      width="28"
      height="28"
      rx="3"
      className="fill-card stroke-muted-foreground/40"
    />
  ));
}

/** The belts as the Explorable draws them: rail and surface, the junction plates, and the rework lanes in use. */
function Belts({ state }: { state: FactoryStillState }) {
  return (
    <g>
      <Lanes state={state} />
      {state.belts.map((b) => (
        <path
          key={b.key}
          d={b.d}
          fill="none"
          strokeWidth="24"
          strokeLinejoin="round"
          className="stroke-muted-foreground/40"
        />
      ))}
      {state.belts.map((b) => (
        <path key={b.key} d={b.d} fill="none" strokeWidth="18" strokeLinejoin="round" className="stroke-card" />
      ))}
      <Plates state={state} />
    </g>
  );
}

/** Each belt's name at the place the Explorable gives its hover label. */
function BeltLabels({ state }: { state: FactoryStillState }) {
  return state.belts
    .filter((b) => NAMED.has(b.key))
    .map((b) => (
      <text
        key={b.key}
        x={b.labelAt.x}
        y={b.labelAt.y + 4}
        textAnchor={b.labelAt.anchor}
        strokeWidth="5"
        strokeLinejoin="round"
        paintOrder="stroke"
        className="fill-muted-foreground stroke-card text-caption"
      >
        {b.label}
      </text>
    ));
}

/** Quality assurance's pin sits over the pile-up at its belt's end, Analysis's on its card's corner. */
const pinAt = (state: FactoryStillState, at: Pin['at']): [number, number] => {
  const s = state.stations.find((x) => x.id === at);
  if (!s) return [0, 0];
  const [x, y, w] = s.box;
  return at === 'qa' ? [x - 44, y - 44] : [x + w, y];
};

function Pins({ state, pins }: { state: FactoryStillState; pins: readonly Pin[] }) {
  return pins.map((p) => {
    const [x, y] = pinAt(state, p.at);
    return (
      <g key={p.n}>
        <circle cx={x} cy={y} r={PIN_R} strokeWidth="3" className="fill-foreground stroke-card" />
        <text x={x} y={y + 5} textAnchor="middle" className="fill-background text-caption font-semibold">
          {p.n}
        </text>
      </g>
    );
  });
}

/** The belt that floods a full rack: the one from an AI work center, else the first into it. */
const floodOf = (state: FactoryStillState, id: string) => {
  const into = state.belts.filter((b) => b.to === id);
  const ai = new Set(state.stations.filter((s) => s.ai).map((s) => s.id));
  return into.find((b) => ai.has(b.from)) ?? into[0];
};

/** The pile-up at the end of the belt that floods each full rack. */
function Piles({ state }: { state: FactoryStillState }) {
  return state.stations.map((s) => {
    const into = s.waiting > s.rack.length ? floodOf(state, s.id) : undefined;
    return into ? <Pile key={s.id} end={into.end} surplus={s.waiting - s.rack.length} /> : null;
  });
}

/** Every work center; the one a note opens the dashboard of is ringed. */
function Stations(p: { state: FactoryStillState; pins: readonly Pin[]; overflow: string; f: Formats }) {
  const words = { waiting: p.state.words.card.waiting, overflow: p.overflow };
  return p.state.stations.map((s) => (
    <Station key={s.id} s={s} ringed={p.pins.some((x) => x.at === s.id && s.id !== 'qa')} words={words} f={p.f} />
  ));
}

/**
 * The software ecology factory at one moment, drawn from the Explorable's own model, layout and words
 * (`factoryStillState`): every belt with the documents riding it, each work center with its rack and the document in
 * work, the rework lanes that carry work back, the pile-up past a full rack, the Customer card, and numbered pins.
 * Static and server-rendered; its `label` names the picture.
 */
export function FactoryStill(p: {
  state: FactoryStillState;
  words: FactoryStillWords;
  pins: readonly Pin[];
  locale: string;
}) {
  const { state, words } = p,
    f = formatsOf(p.locale),
    ai = state.stations.find((s) => s.ai);
  const box = [-PAD, state.top - PAD - HEADROOM, state.width + 2 * PAD, state.height + 2 * PAD + HEADROOM];
  return (
    <svg viewBox={box.join(' ')} className="h-auto w-full" role="img" aria-label={words.label}>
      <Belts state={state} />
      {state.belts.flatMap((b) => b.docs.map((d, i) => <Doc key={`${b.key}-${i}`} doc={d} />))}
      <BeltLabels state={state} />
      <Piles state={state} />
      <CustomerStill state={state} f={f} />
      <Stations state={state} pins={p.pins} overflow={words.overflow} f={f} />
      {ai && <Turbo s={ai} label={fillTemplate(words.aiExtra, { n: f.number.format(ai.aiExtra) })} />}
      <Pins state={state} pins={p.pins} />
    </svg>
  );
}
