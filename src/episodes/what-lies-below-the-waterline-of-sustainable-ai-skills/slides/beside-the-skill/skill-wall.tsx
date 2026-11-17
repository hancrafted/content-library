import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { Words, type ViewWords } from '@/episodes/components/slide-shared/agent-view/view-words';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './slide.module.css';
import { SheetArt, WallArt } from './wall-art';

export interface SkillWallProps {
  readonly skillTag: string;
  readonly fileTag: string;
  readonly pointsTo: string;
  readonly card: {
    readonly title: ViewWords;
    readonly description: ViewWords;
    readonly steps: readonly ViewWords[];
    readonly focal: number;
  };
  readonly plan: {
    readonly title: ViewWords;
    readonly sub: string;
    readonly rows: readonly { readonly site: string; readonly label: string; readonly today: boolean }[];
    readonly today: string;
  };
}

const HEAD_ROW = 2;
const FIRST_STEP_ROW = 4;

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

function Sheets({ rows }: { readonly rows: Rows }) {
  return (
    <>
      <div aria-hidden className="relative" style={{ gridRow: `${HEAD_ROW} / ${rows.label}`, gridColumn: 2 }}>
        <SheetArt sheet="skill" className="absolute inset-0 -z-10 size-full" />
      </div>
      <div aria-hidden className="relative" style={{ gridRow: `${HEAD_ROW} / ${rows.last}`, gridColumn: 4 }}>
        <SheetArt sheet="plan" className="absolute inset-0 -z-10 size-full" />
      </div>
    </>
  );
}

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
            today ? styles.today : cn(styles.rule, 'rounded-none border-b'),
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
      <Cell row={HEAD_ROW + 1} column="4" className={cn(styles.rule, 'mx-3 border-b-2 pb-1')}>
        <InView view="chat" as="p" className="text-caption text-muted-foreground">
          {plan.sub}
        </InView>
      </Cell>
      <SiteRows plan={plan} />
    </>
  );
}

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

export function SkillWall({ skillTag, fileTag, pointsTo, card, plan }: SkillWallProps) {
  const last = FIRST_STEP_ROW + card.steps.length - 1;
  const rows = { last, focal: FIRST_STEP_ROW + card.focal, label: last + 1 };
  return (
    <div
      data-skill-wall
      className={cn(
        styles.art,
        'relative isolate grid grid-cols-[0.75rem_minmax(0,3fr)_2.5rem_minmax(0,2fr)] gap-y-1 overflow-hidden rounded-2xl p-4 pt-5 pl-2 text-card-foreground shadow-md',
      )}
    >
      <WallArt className="absolute inset-0 -z-20 size-full" />
      <Sheets rows={rows} />
      <SkillCells tag={skillTag} card={card} />
      <Leads rows={rows} pointsTo={pointsTo} />
      <PlanCells tag={fileTag} plan={plan} />
    </div>
  );
}
