import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './slide.module.css';

interface ViewWords {
  readonly chat: string;
  readonly coding: string;
}

export interface SkillWallProps {
  readonly skillTag: string;
  readonly fileTag: string;
  readonly pointsTo: string;
  readonly card: {
    readonly title: ViewWords;
    readonly description: ViewWords;
    /** The four steps; the focal one points to the project file. */
    readonly steps: readonly ViewWords[];
    readonly focal: number;
  };
  readonly plan: {
    readonly title: ViewWords;
    readonly sub: string;
    /** One row per site, level with the steps: today's row sits beside the focal step. */
    readonly rows: readonly { readonly site: string; readonly label: string; readonly today: boolean }[];
    readonly today: string;
  };
}

/** Grid rows of the wall: the tag, the sheets' heading and sub line, then one row per step, then the label. */
const HEAD_ROW = 2;
const FIRST_STEP_ROW = 4;

function Words({ words, mono = true }: { readonly words: ViewWords; readonly mono?: boolean }) {
  return (
    <>
      <InView view="chat">{words.chat}</InView>
      <InView view="coding" className={cn(mono && 'font-mono', 'break-words')}>
        {words.coding}
      </InView>
    </>
  );
}

/** The faceted wall and floor behind the sheets, lit from the upper left. Decoration only. */
function Wall() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 400"
      preserveAspectRatio="none"
      className={cn(styles.wall, 'absolute inset-0 -z-10 size-full')}
    >
      <polygon data-tone="wall-lit" points="0,0 260,0 140,180 0,240" />
      <polygon data-tone="wall" points="260,0 600,0 600,150 380,260 140,180" />
      <polygon data-tone="wall-shade" points="0,240 140,180 380,260 600,150 600,350 0,350" />
      <polygon data-tone="floor" points="0,350 600,350 600,400 0,400" />
    </svg>
  );
}

function Cell({
  row,
  column,
  className,
  children,
}: {
  row: number;
  column: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className} style={{ gridRow: row, gridColumn: column }}>
      {children}
    </div>
  );
}

interface Rows {
  readonly last: number;
  readonly focal: number;
  readonly label: number;
}

const PILL = 'w-fit rounded-full border border-foreground bg-card px-3 text-caption font-semibold';

/** The sheets' paper and the plan's tape, drawn first so the words sit on them. */
function Sheets({ rows }: { readonly rows: Rows }) {
  return (
    <>
      <div
        aria-hidden
        className={cn(styles.paper, 'rounded-md shadow-md')}
        style={{ gridRow: `${HEAD_ROW} / ${rows.label}`, gridColumn: 2 }}
      />
      <div
        aria-hidden
        className={cn(styles.plan, 'rounded-md shadow-md')}
        style={{ gridRow: `${HEAD_ROW} / ${rows.last}`, gridColumn: 4 }}
      />
      <span
        aria-hidden
        className={cn(styles.tape, 'mx-auto h-3 w-12 self-end')}
        style={{ gridRow: 1, gridColumn: 4 }}
      />
    </>
  );
}

/** The steps, one grid row each, so the focal step sits level with today's row. */
function Steps({ card }: { readonly card: SkillWallProps['card'] }) {
  return (
    <ol className="contents">
      {card.steps.map((step, index) => (
        <li
          key={step.chat}
          data-step={index + 1}
          data-focal={index === card.focal ? '' : undefined}
          className={cn(
            'mx-2 self-center px-2 py-1 text-caption',
            index === card.focal && 'rounded-md bg-card font-semibold ring-2 ring-primary',
          )}
          style={{ gridRow: FIRST_STEP_ROW + index, gridColumn: 2 }}
        >
          <Words words={step} />
        </li>
      ))}
    </ol>
  );
}

/** The skill's sheet: its tag, title, description and steps, the focal step ringed in primary. */
function SkillCells({ tag, card }: { readonly tag: string; readonly card: SkillWallProps['card'] }) {
  return (
    <>
      <Cell row={1} column="2" className="pb-1">
        <p className={PILL}>{tag}</p>
      </Cell>
      <Cell row={HEAD_ROW} column="2" className="px-4 pt-3">
        <p className="text-body font-semibold">
          <Words words={card.title} />
        </p>
      </Cell>
      <Cell row={HEAD_ROW + 1} column="2" className="px-4">
        <p className="text-caption text-muted-foreground">
          <Words words={card.description} />
        </p>
      </Cell>
      <Steps card={card} />
    </>
  );
}

/** One row per site, level with the steps; today's fills primary. */
function SiteRows({ plan }: { readonly plan: SkillWallProps['plan'] }) {
  return (
    <>
      {plan.rows.map(({ site, label, today }, index) => (
        <p
          key={site}
          data-site={site}
          data-today={today ? '' : undefined}
          className={cn(
            'flex flex-wrap items-baseline justify-between gap-x-2 self-center rounded-md px-3 py-1 text-body font-semibold',
            today && cn(styles.today, 'shadow-md'),
          )}
          style={{ gridRow: FIRST_STEP_ROW + index, gridColumn: 4 }}
        >
          {label}
          {today && <span className="text-caption font-normal">{plan.today}</span>}
        </p>
      ))}
    </>
  );
}

/** The project file: its heading, today's dive plan beneath, and one row per site, today's filled primary. */
function PlanCells({ tag, plan }: { readonly tag: string; readonly plan: SkillWallProps['plan'] }) {
  return (
    <>
      <Cell row={HEAD_ROW} column="4" className="flex flex-col gap-1 px-3 pt-3">
        <InView view="coding" className={PILL}>
          {tag}
        </InView>
        <p className="text-body font-semibold break-words">
          <Words words={plan.title} />
        </p>
      </Cell>
      <Cell row={HEAD_ROW + 1} column="4" className="px-3">
        <InView view="chat" as="p" className="text-caption text-muted-foreground">
          {plan.sub}
        </InView>
      </Cell>
      <SiteRows plan={plan} />
    </>
  );
}

/** The dotted lead from the focal step to its label, and the primary line from the step to today's row. */
function Leads({ rows, pointsTo }: { readonly rows: Rows; readonly pointsTo: string }) {
  return (
    <>
      <span
        aria-hidden
        className="my-3 ml-1 border-y-2 border-l-2 border-dotted border-foreground"
        style={{ gridRow: `${rows.focal} / ${rows.label + 1}`, gridColumn: 1 }}
      />
      <Cell row={rows.label} column="2" className="pt-2">
        <p className={PILL}>{pointsTo}</p>
      </Cell>
      <svg
        aria-hidden
        viewBox="0 0 40 12"
        preserveAspectRatio="none"
        className={cn(styles.link, 'h-3 w-full self-center')}
        style={{ gridRow: rows.focal, gridColumn: 3 }}
      >
        <line x1={0} y1={6} x2={32} y2={6} strokeWidth={3} vectorEffect="non-scaling-stroke" />
        <polygon points="30,0 40,6 30,12" />
      </svg>
    </>
  );
}

/**
 * The control-room wall of Option 17a: the skill's sheet taped on the left, today's dive plan, the project file, on
 * the right. The focal step and the Site 7 row share one grid row, so the primary line between them stays level at
 * every width and in either view. A dotted lead ties the "Points to a project file" label to the step.
 */
export function SkillWall({ skillTag, fileTag, pointsTo, card, plan }: SkillWallProps) {
  const last = FIRST_STEP_ROW + card.steps.length - 1;
  const rows = { last, focal: FIRST_STEP_ROW + card.focal, label: last + 1 };
  return (
    <div
      data-skill-wall
      className="relative isolate grid grid-cols-[0.75rem_minmax(0,3fr)_2.5rem_minmax(0,2fr)] gap-y-1 overflow-hidden rounded-2xl p-4 pl-2 text-card-foreground shadow-md"
    >
      <Wall />
      <Sheets rows={rows} />
      <SkillCells tag={skillTag} card={card} />
      <Leads rows={rows} pointsTo={pointsTo} />
      <PlanCells tag={fileTag} plan={plan} />
    </div>
  );
}
