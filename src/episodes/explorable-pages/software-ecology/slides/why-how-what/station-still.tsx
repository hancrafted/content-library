import { RACK } from '@/explorables/software-ecology/stage-readouts.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { StillDoc, StillStation } from './factory-still-state';
import { Doc, GlyphAt, type Formats } from './still-parts';

/** Where a station's waiting count shows its weeks of work: red from two weeks, amber from one, plain below. */
const LEVEL_CLASS = ['fill-muted-foreground', 'fill-(--warning) font-semibold', 'fill-destructive font-semibold'];

const cardClass = (s: StillStation, ringed: boolean) => {
  if (s.ai) return 'fill-ai/10 stroke-ai';
  if (ringed) return 'fill-card stroke-foreground';
  return s.waiting > RACK ? 'fill-card stroke-destructive' : 'fill-card stroke-border';
};

/** The rack of six slots at the card's left, filled from the bottom; a full rack's top slot red. */
function Rack({ s }: { s: StillStation }) {
  const full = s.waiting > RACK,
    { x, w, topY, slot } = s.rackAt;
  return (
    <g>
      {Array.from({ length: RACK }, (_, i) => {
        const top = full && i === RACK - 1;
        return (
          <rect
            key={i}
            x={x - w / 2}
            y={topY + (RACK - 1 - i) * slot - slot / 2}
            width={w}
            height={slot}
            strokeWidth={top ? 1.6 : 0.8}
            className={top ? 'fill-destructive/15 stroke-destructive' : 'fill-none stroke-border'}
          />
        );
      })}
      {s.rack.map((doc, i) => (
        <Doc key={i} doc={doc} scale={0.75} />
      ))}
    </g>
  );
}

/** A full rack's surplus, "+n", over the rack. */
function Overflow({ s, template, f }: { s: StillStation; template: string; f: Formats }) {
  if (s.waiting <= RACK) return null;
  return (
    <text x={s.rackAt.x - s.rackAt.w / 2} y={s.box[1] - 10} className="fill-destructive text-caption font-semibold">
      {fillTemplate(template, { n: f.number.format(s.waiting - RACK) })}
    </text>
  );
}

export interface StationWords {
  readonly waiting: string;
  /** "+{n}" past a full rack. */
  readonly overflow: string;
}

/** A work center as the Explorable's factory view draws it: card, rack, glyph and title, the document in work, its waiting count. */
export function Station(p: { s: StillStation; words: StationWords; f: Formats; ringed?: boolean }) {
  const { s, words, f } = p,
    ringed = !!p.ringed;
  const [x, y, w, h] = s.box;
  return (
    <g data-station={s.id}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        strokeWidth={s.ai || ringed ? 2 : 1.2}
        className={cardClass(s, ringed)}
      />
      <Rack s={s} />
      <GlyphAt name={s.icon} x={x + 58} y={y + 10} size={18} className="text-foreground" />
      <text x={x + 82} y={y + 25} className="fill-foreground text-caption font-semibold">
        {s.title}
      </text>
      {s.inspection && <GlyphAt name="qa" x={x + w - 12} y={y - 10} size={22} className="fill-card text-human" />}
      {s.work && <Doc doc={s.work} scale={1.8} />}
      <text x={x + w - 10} y={y + h - 10} textAnchor="end" className={`${LEVEL_CLASS[s.level] ?? ''} text-caption`}>
        {f.number.format(s.waiting)} {words.waiting}
      </text>
      <Overflow s={s} template={words.overflow} f={f} />
    </g>
  );
}

/** The turbo on the AI work center's out belt, and how many tasks it now hands on per task. */
export function Turbo({ s, label }: { s: StillStation; label: string }) {
  const [x, y, w, h] = s.box;
  const start = x + w + 8,
    mid = y + h / 2;
  return (
    <g>
      {[0, 11, 22].map((dx) => (
        <path
          key={dx}
          d={`M${start + dx} ${mid - 12}l7 7l-7 7`}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-ai"
        />
      ))}
      <text x={start} y={y + h + 22} className="fill-ai text-caption font-semibold">
        {label}
      </text>
    </g>
  );
}

/** At most this many documents draw the pile-up; one stands for about twenty waiting. */
const PILE = { max: 10, per: 20, rows: [4, 3, 2, 1] };

/** The surplus a full rack cannot hold, heaped at the end of the belt into it, AI-made as the work that fills it. */
export function Pile({ end, surplus }: { end: readonly [number, number]; surplus: number }) {
  const n = Math.min(PILE.max, Math.ceil(surplus / PILE.per));
  const docs: StillDoc[] = PILE.rows
    .flatMap((count, r) =>
      Array.from({ length: count }, (_, i) => ({
        x: end[0] - 44 + i * 11 + r * 5.5,
        y: end[1] - 24 - r * 11,
        good: (i + r) % 4 !== 1,
        ai: true,
        warn: false,
      })),
    )
    .slice(0, n);
  return (
    <g>
      {docs.map((doc, i) => (
        <Doc key={i} doc={doc} />
      ))}
    </g>
  );
}
