'use client';

import type { Locale } from '@/shared/lib/locale.pure';
import { localizePath, stripLocale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { useState, type ReactNode } from 'react';
import { BOXES, isStepDone, startStep, type BoxId, type StepNumber } from './start-step.pure';

/** One step of the checklist, its words already in the viewer's language. */
export interface ChecklistStep {
  readonly n: StepNumber;
  readonly section: string;
  readonly title: string;
  /** The label of each box of this step, by box id. */
  readonly boxes: Readonly<Partial<Record<BoxId, string>>>;
}

export interface ChecklistWords {
  readonly label: string;
  readonly start: string;
  readonly allDone: string;
  readonly open: string;
}

/** A Slide link as `localizePath` takes it: the path and its anchor. */
export interface LinkParts {
  readonly path: string;
  readonly anchor: string | undefined;
}

export interface ChecklistProps {
  readonly steps: readonly ChecklistStep[];
  readonly words: ChecklistWords;
  /** Where each step's "Start at step N" lands: the localized href of its first Slide. */
  readonly hrefs: Readonly<Record<StepNumber, LinkParts>>;
  readonly locale: Locale;
  /** Marks the intro line the head-start note hangs on. */
  readonly intro: ReactNode;
  /** The rest of the right column, under the "Start at" card. */
  readonly children: ReactNode;
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
      <path
        d="M5 12h13M13 6l6 6-6 6"
        className="fill-none stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface StepItemProps {
  readonly step: ChecklistStep;
  readonly ticked: ReadonlySet<BoxId>;
  readonly start: StepNumber;
  readonly toggle: (id: BoxId) => void;
}

/** The real, labelled checkboxes of one step, each target 44px high. */
function BoxList({ step, ticked, toggle }: Omit<StepItemProps, 'start'>) {
  return (
    <ul className="ml-11 flex flex-col">
      {BOXES.filter((box) => box.step === step.n).map((box) => (
        <li key={box.id}>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-body has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
            <input
              type="checkbox"
              className="size-5 shrink-0 accent-primary"
              checked={ticked.has(box.id)}
              onChange={() => toggle(box.id)}
            />
            {step.boxes[box.id]}
          </label>
        </li>
      ))}
    </ul>
  );
}

/** One step: its number (filled when done, ringed when it is where to start) and its boxes. */
function StepItem({ step, ticked, start, toggle }: StepItemProps) {
  const done = isStepDone(step.n, ticked);
  const ring = start === step.n ? 'border-2 border-primary' : 'border border-border text-muted-foreground';
  return (
    <li
      data-step={step.n}
      data-state={done ? 'done' : start === step.n ? 'current' : 'upcoming'}
      className="flex flex-col gap-1"
    >
      <p className="flex items-center gap-3">
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-full text-caption font-semibold',
            done ? 'bg-primary text-primary-foreground' : ring,
          )}
        >
          {step.n}
        </span>
        <span className="flex flex-col">
          <span className="text-caption tracking-wide text-muted-foreground uppercase">{step.section}</span>
          <span className="text-body font-semibold">{step.title}</span>
        </span>
      </p>
      <BoxList step={step} ticked={ticked} toggle={toggle} />
    </li>
  );
}

/** The top card: names the first open step and links to its first Slide; with everything ticked, points at step 4. */
function StartCard({
  step,
  allDone,
  link,
  locale,
  words,
}: {
  step: ChecklistStep | undefined;
  allDone: boolean;
  link: LinkParts;
  locale: Locale;
  words: ChecklistWords;
}) {
  return (
    <a
      data-start-at={step?.n}
      href={localizePath(stripLocale(link.path), locale, link.anchor)}
      className="card-hover card-hover--raise flex items-center justify-between gap-4 rounded-2xl bg-primary px-6 py-5 text-primary-foreground"
    >
      <span className="flex flex-col">
        <span className="text-caption opacity-80">{allDone ? words.allDone : words.open}</span>
        <span className="text-subheading font-semibold" aria-live="polite">
          {words.start.replace('{n}', String(step?.n ?? ''))}
        </span>
        <span className="text-body">{step?.title}</span>
      </span>
      <Arrow />
    </a>
  );
}

/** The ticked boxes: transient client state (FE-001), so a reload starts clean. */
function useTicks() {
  const [ticked, setTicked] = useState<ReadonlySet<BoxId>>(new Set());
  const toggle = (id: BoxId) =>
    setTicked((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  return { ticked, toggle };
}

/**
 * The Overview's checklist and its "Start at step N" card: the viewer ticks what they already have, the card names the
 * first step with an open box and links to its first Slide. Ticks are transient (FE-001): they live until a reload.
 */
export function Checklist({ steps, words, hrefs, locale, intro, children }: ChecklistProps) {
  const { ticked, toggle } = useTicks();
  const { step: start, allDone } = startStep(ticked);
  return (
    <div className="grid gap-6 @3xl:grid-cols-12 @3xl:items-start">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 @3xl:col-span-7">
        <p className="text-caption text-muted-foreground">{intro}</p>
        <ol className="flex flex-col gap-4" aria-label={words.label}>
          {steps.map((step) => (
            <StepItem key={step.n} step={step} ticked={ticked} start={start} toggle={toggle} />
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-5 @3xl:col-span-5">
        <StartCard
          step={steps.find((step) => step.n === start)}
          allDone={allDone}
          link={hrefs[start]}
          locale={locale}
          words={words}
        />
        {children}
      </div>
    </div>
  );
}
