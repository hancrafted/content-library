'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  FIRST_STATE,
  focusTarget,
  STEPPER_STEPS,
  stepStatus,
  toggleStep,
  type StepperStep,
  type StepStatus,
} from './vertical-stepper.pure';

export interface StepCopy {
  date: string;
  title: string;
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

/** A numbered process on one spine: each step is a disclosure, one open at a time, and opening one makes it current. */
export function VerticalStepper({ label, items }: { label: string; items: Record<StepperStep, StepCopy> }) {
  const baseId = useId();
  const { state, headers, toggle, onKeyDown } = useStepper();
  return (
    <ol role="list" aria-label={label} data-slot="vertical-stepper" className="max-w-2xl">
      {STEPPER_STEPS.map((step, index) => (
        <StepperItem
          key={step}
          index={index}
          copy={items[step]}
          status={stepStatus(index, state.current)}
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
  status: StepStatus;
  open: boolean;
  id: string;
  headerRef: (node: HTMLButtonElement | null) => void;
  onToggle: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

function StepperItem({ index, copy, status, open, id, headerRef, onToggle, onKeyDown }: ItemProps) {
  const last = index === STEPPER_STEPS.length - 1;
  return (
    <li
      data-status={status}
      className="relative grid pb-3 grid-cols-[3.5rem_1fr] gap-x-5 md:grid-cols-[4.5rem_1fr] md:gap-x-8"
    >
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
          <StepHeading copy={copy} status={status} open={open} />
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
      className="absolute top-[4.25rem] bottom-[-0.25rem] left-[1.75rem] w-0.5 -translate-x-1/2 bg-border md:top-[5.25rem] md:left-[2.25rem]"
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
  done: 'border-foreground bg-foreground text-background',
  current: 'border-brand-accent bg-brand-accent text-background ring-6 ring-brand-accent/20',
  upcoming:
    'border-border bg-background text-muted-foreground group-hover:border-foreground group-hover:text-foreground',
};

/** The big numbered circle: a check once done, the number filled while current, the number outlined while ahead. */
function StepMarker({ index, status }: { index: number; status: StepStatus }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid size-14 place-items-center rounded-full border-2 text-xl font-semibold tabular-nums md:size-[4.5rem] md:text-3xl',
        'motion-safe:transition-[background-color,border-color,color,box-shadow] motion-safe:duration-300',
        MARKER[status],
      )}
    >
      {status === 'done' ? <Check className="size-6 md:size-8" strokeWidth={2.5} /> : index + 1}
    </span>
  );
}

function StepHeading({ copy, status, open }: { copy: StepCopy; status: StepStatus; open: boolean }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5 py-2">
      <span className="text-sm text-muted-foreground tabular-nums">{copy.date}</span>
      <span
        className={cn(
          'text-xl font-semibold tracking-tight underline-offset-4 group-hover:underline md:text-2xl',
          status === 'upcoming' && !open && 'text-muted-foreground',
        )}
      >
        {copy.title}
      </span>
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
        <p className="max-w-prose pt-1 pb-8 text-base text-pretty text-muted-foreground md:text-lg">{caption}</p>
      </div>
    </div>
  );
}
