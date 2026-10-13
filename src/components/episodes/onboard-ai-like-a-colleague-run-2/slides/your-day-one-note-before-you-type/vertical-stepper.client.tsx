'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import {
  FIRST_STATE,
  focusTarget,
  STEPPER_STEPS,
  stepStatus,
  toggleStep,
  type StepperStep,
  type StepStatus,
} from './vertical-stepper.pure';
import styles from './your-day-one-note-before-you-type.module.css';

export interface StepCopy {
  title: string;
  question: string;
  caption: string;
}

/** The accordion's state plus the arrow-key handler that moves focus between headers. */
function useStepper() {
  const [state, setState] = useState(FIRST_STATE);
  const headers = useRef<(HTMLButtonElement | null)[]>([]);
  const toggle = (index: number) => setState((now) => toggleStep(now, index));
  const onKeyDown = (index: number, event: KeyboardEvent) => {
    const next = focusTarget(index, event.key);
    if (next === null) return;
    event.preventDefault();
    headers.current[next]?.focus();
  };
  return { state, headers, toggle, onKeyDown };
}

interface StepperProps {
  label: string;
  items: Record<StepperStep, StepCopy>;
  /** Each state in words (done, current, upcoming), announced after a step's title. */
  states: Record<StepStatus, string>;
  /** A Speaker note's target per step, as plain `data-target` objects, spread on the step. */
  targets?: Partial<Record<StepperStep, { 'data-target': string }>>;
}

/**
 * Copied from the vertical-stepper master with changes: the four lines of the day-one note on one spine, each a
 * disclosure, one open at a time, and opening one makes it current. Each step carries its index as `--i` for the
 * Slide's entrance.
 */
export function VerticalStepper({ label, items, states, targets }: StepperProps) {
  const baseId = useId();
  const { state, headers, toggle, onKeyDown } = useStepper();
  return (
    <ol role="list" aria-label={label} data-slot="vertical-stepper" className="mt-6">
      {STEPPER_STEPS.map((step, index) => (
        <StepperItem
          key={step}
          index={index}
          copy={items[step]}
          target={targets?.[step]}
          status={stepStatus(index, state.current)}
          stateLabel={states[stepStatus(index, state.current)]}
          open={state.open === index}
          id={`${baseId}-${step}`}
          headerRef={(node) => {
            headers.current[index] = node;
          }}
          onToggle={() => toggle(index)}
          onKeyDown={(event) => onKeyDown(index, event)}
        />
      ))}
    </ol>
  );
}

interface ItemProps {
  index: number;
  copy: StepCopy;
  target?: { 'data-target': string };
  status: StepStatus;
  /** The step's state in words, for screen readers: the marker shows it only visually. */
  stateLabel: string;
  open: boolean;
  id: string;
  headerRef: (node: HTMLButtonElement | null) => void;
  onToggle: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

/** A step: the marker column beside its heading and panel, sized to sit inside the day-one note. */
const ITEM = 'relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-3 md:grid-cols-[3rem_1fr] md:gap-x-6';

function StepperItem({ index, copy, target, status, stateLabel, open, id, headerRef, onToggle, onKeyDown }: ItemProps) {
  const last = index === STEPPER_STEPS.length - 1;
  return (
    <li {...target} data-status={status} style={{ '--i': index } as CSSProperties} className={cn(ITEM, styles.step)}>
      {!last && <StepSpine filled={status === 'done'} />}
      <h4 className="contents">
        <button
          ref={headerRef}
          type="button"
          id={`${id}-header`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          aria-current={status === 'current' ? 'step' : undefined}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className="group col-span-2 grid grid-cols-subgrid items-center rounded-2xl py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <StepMarker index={index} status={status} />
          <StepHeading copy={copy} />
          <span className="sr-only">, {stateLabel}</span>
        </button>
      </h4>
      <StepPanel id={id} open={open} caption={copy.caption} />
    </li>
  );
}

/** The spine from this step's circle down to the next: hairline when ahead, solid once the step is done. */
function StepSpine({ filled }: { filled: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="absolute top-[3rem] bottom-[-0.25rem] left-[1.25rem] w-0.5 -translate-x-1/2 bg-border md:top-[3.5rem] md:left-[1.5rem]"
    >
      <span
        className={cn(
          'absolute inset-0 origin-top bg-foreground motion-safe:transition-[scale] motion-safe:duration-500 motion-safe:ease-out',
          filled ? 'scale-y-100' : 'scale-y-0',
        )}
      />
    </span>
  );
}

const MARKER: Record<StepStatus, string> = {
  done: 'border-foreground bg-background text-foreground',
  current: 'border-primary bg-primary text-primary-foreground ring-6 ring-primary/20',
  upcoming:
    'border-border bg-background text-muted-foreground group-hover:border-foreground group-hover:text-foreground',
};

/** The big numbered circle: a check once done, the number filled while current, the number outlined while ahead. */
function StepMarker({ index, status }: { index: number; status: StepStatus }) {
  return (
    <span
      aria-hidden="true"
      className={`text-body font-semibold ${cn(
        'relative grid size-10 place-items-center rounded-full border-2 tabular-nums md:size-12',
        'motion-safe:transition-[background-color,border-color,color,box-shadow] motion-safe:duration-300',
        MARKER[status],
      )}`}
    >
      {status === 'done' ? <Check className="size-5 md:size-6" strokeWidth={2.5} /> : index + 1}
    </span>
  );
}

/** The step's title over its question: a line of the note, standing on its own at rest whatever the status. */
function StepHeading({ copy }: { copy: StepCopy }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5 py-1">
      <span className="text-body font-semibold underline-offset-4 group-hover:underline">{copy.title}</span>
      <span className="text-body text-foreground">{copy.question}</span>
    </span>
  );
}

/** The caption under a header; its height opens with `grid-template-rows` 0fr→1fr, animated only when motion is welcome. */
function StepPanel({ id, open, caption }: { id: string; open: boolean; caption: string }) {
  return (
    <div
      id={`${id}-panel`}
      role="region"
      aria-labelledby={`${id}-header`}
      aria-hidden={!open}
      className={cn(
        'col-start-2 grid motion-safe:transition-[grid-template-rows] motion-safe:duration-300 motion-safe:ease-out',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <p className="max-w-prose pt-1 pb-4 text-caption text-pretty text-muted-foreground">{caption}</p>
      </div>
    </div>
  );
}
