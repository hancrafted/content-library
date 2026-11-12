import type { Level } from '@/explorables/software-ecology/dashboard-readouts.pure';
import { GLYPH } from '@/explorables/software-ecology/factory-glyphs.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { FactoryStillState } from './factory-still-state';

export interface DashboardStillWords {
  /** "· AI leaves it", after the effectiveness the AI switch does not change. */
  readonly aiLeavesIt: string;
  readonly people: string;
  readonly tools: string;
  readonly withAiHere: string;
  /** "Traffic light: {level}", the light's name. */
  readonly light: string;
}

type Dashboard = FactoryStillState['dashboard'];
type DashWords = FactoryStillState['words']['dash'];

const LIGHTS: readonly Level[] = ['red', 'amber', 'green'];
const LIGHT_ON: Readonly<Record<Level, string>> = {
  red: 'bg-destructive',
  amber: 'bg-(--warning)',
  green: 'bg-(--success)',
};
const SIGNAL_BG: Readonly<Record<Level, string>> = {
  red: 'bg-destructive/15',
  amber: 'bg-(--warning)/15',
  green: 'bg-(--success)/15',
};
type Parts = readonly (readonly [string, number])[];
type Pct = (n: number) => string;
/** The bars' full width: the most the efficiency reads with AI on. */
const BAR_MAX = 250;

function Trend({ line, primary }: { line: string; primary?: boolean }) {
  return (
    <svg viewBox="0 0 100 34" className="mt-1 h-8 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={line}
        fill="none"
        strokeWidth="1.6"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={primary ? 'stroke-primary' : 'stroke-foreground'}
      />
    </svg>
  );
}

function List({ items, dot }: { items: readonly string[]; dot: string }) {
  return (
    <ul className="mt-1 flex flex-col gap-0.5 text-caption text-foreground">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${dot}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** The traffic light and the AI switch, off: AI works at Engineering only. */
function Status({ d, w, light }: { d: Dashboard; w: DashWords; light: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex gap-0.5" role="img" aria-label={fillTemplate(light, { level: w.levels[d.r.light] })}>
        {LIGHTS.map((l) => (
          <span key={l} className={`size-2 rounded-full ${l === d.r.light ? LIGHT_ON[l] : 'bg-muted-foreground/25'}`} />
        ))}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 text-caption text-muted-foreground">
        <span className={`h-2.5 w-4 rounded-full ${d.r.dials.ai ? 'bg-ai' : 'bg-muted-foreground/30'}`} />
        {w.ai}
      </span>
    </div>
  );
}

/** The role's glyph and title, what it does, its traffic light and its AI switch, off. */
function Head({ d, w, light }: { d: Dashboard; w: DashWords; light: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="flex items-center gap-1.5 text-caption font-semibold text-foreground">
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: GLYPH[d.icon] ?? '' }}
          />
          {d.title}
        </p>
        <p className="text-caption text-muted-foreground">{d.role.job}</p>
      </div>
      <Status d={d} w={w} light={light} />
    </div>
  );
}

/** Output and outcome, each with its trend; outcome is the dial AI leaves alone, so it carries the focus. */
function Tiles({ d, w, number }: { d: Dashboard; w: DashWords; number: Intl.NumberFormat }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <div className="rounded-md border border-border p-2">
        <p className="text-caption text-muted-foreground">
          {w.rows.eff.label} {w.rows.eff.sub}
        </p>
        <p className="text-caption text-foreground">
          <b className="text-body font-semibold">{number.format(d.r.out.now)}</b> {w.trends.out.unit}
        </p>
        <Trend line={d.r.out.paths.line} />
      </div>
      <div className="rounded-md border-2 border-primary p-2">
        <p className="text-caption text-muted-foreground">
          {w.rows.effv.label} {w.rows.effv.sub}
        </p>
        <p className="text-caption text-foreground">
          <b className="text-body font-semibold text-primary">{d.r.good.now ?? '–'}</b> {w.trends.good.unit}
        </p>
        <Trend line={d.r.good.paths.line} primary />
      </div>
    </div>
  );
}

/** A bar of `BAR_MAX` percent, its parts laid end to end. */
function Bar({ parts }: { parts: Parts }) {
  return (
    <div className="flex h-1.5 overflow-hidden rounded-full bg-border">
      {parts.map(([tone, n]) => (
        <span key={tone} className={tone} style={{ width: `${(n / BAR_MAX) * 100}%` }} />
      ))}
    </div>
  );
}

/** One dial: its name, its value as set and a note beside it, over its bar. */
function Dial(p: { label: string; value: string; note: string; noteClass: string; parts: Parts }) {
  return (
    <>
      <p className="flex items-center justify-between gap-2 text-caption">
        <span className="text-muted-foreground">{p.label}</span>
        <span className="font-semibold text-foreground">
          {p.value} <span className={`font-normal ${p.noteClass}`}>{p.note}</span>
        </span>
      </p>
      <Bar parts={p.parts} />
    </>
  );
}

/** The two dials as set, and what AI would make of each: efficiency rises, effectiveness stays. */
function Dials({ d, w, words, pct }: { d: Dashboard; w: DashWords; words: DashboardStillWords; pct: Pct }) {
  const { eff, effv, aiSpeed } = d.r.dials,
    effAi = Math.round(eff * aiSpeed);
  return (
    <div className="mt-2 flex flex-col gap-1.5 rounded-md bg-muted p-2">
      <Dial
        label={w.rows.eff.label}
        value={pct(eff)}
        note={fillTemplate(w.withAi, { set: '', eff: pct(effAi) }).trim()}
        noteClass="text-ai"
        parts={[
          ['bg-foreground', eff],
          ['bg-ai', effAi - eff],
        ]}
      />
      <Dial
        label={w.rows.effv.label}
        value={pct(effv)}
        note={words.aiLeavesIt}
        noteClass="text-muted-foreground"
        parts={[['bg-primary', (effv / 100) * BAR_MAX]]}
      />
    </div>
  );
}

/** The role's people, tools and artefacts, and what AI does there. */
function Highlights({ d, words }: { d: Dashboard; words: DashboardStillWords }) {
  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-caption font-semibold text-human uppercase">{words.people}</p>
          <List items={d.role.tasks ?? []} dot="bg-human" />
        </div>
        <div>
          <p className="text-caption font-semibold text-machine uppercase">{words.tools}</p>
          <p className="mt-1 flex flex-wrap gap-1">
            {(d.role.artefacts ?? []).map((a) => (
              <span key={a} className="rounded-full border border-machine/40 px-1.5 text-caption text-foreground">
                {a}
              </span>
            ))}
          </p>
        </div>
      </div>
      <p className="mt-3 text-caption font-semibold text-ai uppercase">{words.withAiHere}</p>
      <List items={d.role.ai ?? []} dot="bg-ai" />
    </>
  );
}

/**
 * A work center's dashboard as a still, read from the Explorable's model at the still's moment: its role, traffic
 * light and signal, output and outcome with their trends, the two dials with what AI would make of them, and the
 * role's people, tools and what AI does there. The Explorable's own words; the still's few in `words`.
 */
export function DashboardStill({
  state,
  words,
  locale,
}: {
  state: FactoryStillState;
  words: DashboardStillWords;
  locale: string;
}) {
  const d = state.dashboard,
    w = state.words.dash,
    signal = d.r.signals[0];
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-md">
      <Head d={d} w={w} light={words.light} />
      {signal && (
        <p className={`mt-2 inline-flex rounded-full px-2 text-caption text-foreground ${SIGNAL_BG[signal.level]}`}>
          {fillTemplate(w.signals[signal.kind], { n: signal.n.toFixed(1) })}
        </p>
      )}
      <Tiles d={d} w={w} number={number} />
      <Dials d={d} w={w} words={words} pct={(n) => `${number.format(n)} %`} />
      <Highlights d={d} words={words} />
    </div>
  );
}
