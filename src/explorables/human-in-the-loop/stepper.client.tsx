'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { ChatTabs } from './chat-tabs.client';
import { needsInput } from './context-entries.pure';
import { scopeOf, type DebugBase } from './debug-footer.pure';
import { nextAction, type PanelProgress } from './next-action.pure';
import type { SlotState, StepKit } from './step-kit.types';
import { contextCount, entriesOfStep, panelKey, resultKey } from './step-panel.client';
import { itemsOf, openItemOf, type Item } from './stepper-items.pure';
import { filled, type StageRun } from './workflow-run.pure';
import type { StageView } from './workflow-view.pure';

function Marker({ done, at }: { done: boolean; at: number }) {
  return (
    <span
      aria-hidden="true"
      data-done={done || undefined}
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-semibold',
        done ? 'bg-(--success) text-(--success-foreground)' : 'bg-primary text-primary-foreground',
      )}
    >
      {done ? <Check className="size-4" /> : at + 1}
    </span>
  );
}

interface StepItemProps {
  readonly item: Item;
  readonly at: number;
  readonly kit: StepKit;
  readonly slots: SlotState;
}

function Review({ item, kit, slots, first }: Omit<StepItemProps, 'at'> & { first: number }) {
  const { job, reviewSteps } = item;
  if (reviewSteps.length === 0) return null;
  return (
    <>
      <ChatTabs
        steps={reviewSteps}
        task={job.task}
        kind="review"
        kit={kit}
        slots={slots}
        first={first}
        checkedAs={item.checkedAs}
      />
    </>
  );
}

interface Where {
  readonly stage: StageView;
  readonly debug: DebugBase | null;
  readonly rounds: number;
}

function kitOf(kit: StepKit, { item, stage, debug, rounds }: Pick<StepItemProps, 'item'> & Where): StepKit {
  if (!debug) return kit;
  const { job, round } = item;
  const at = {
    stage: { id: stage.id, name: stage.name },
    job: { id: job.id, title: job.title },
    ...(round && { round: { n: round.number, total: rounds } }),
  };
  return { ...kit, debug: scopeOf(debug, at) };
}

interface Run {
  readonly values: SlotState['values'];
  readonly copied: ReadonlySet<string>;
}

const thenOf = (step: Item['doSteps'][number], copied: ReadonlySet<string>): NonNullable<PanelProgress['then']> => {
  const key = panelKey('then', step);
  return { key, copied: copied.has(key) };
};

function progressOf(item: Item, kit: StepKit, { values, copied }: Run): PanelProgress[] {
  const { job, doSteps, reviewSteps } = item;
  const does = doSteps.map((step) => {
    const key = panelKey('do', step);
    const inputs = entriesOfStep(step, job.task, kit);
    return {
      key,
      copied: copied.has(key),
      done: filled(values, resultKey(step, job.task)),
      needsInput: needsInput(inputs, values),
      ...(step.then && { then: thenOf(step, copied) }),
    };
  });
  const reviews = reviewSteps.map((step) => {
    const key = panelKey('review', step);
    return { key, copied: copied.has(key), done: filled(values, item.checkedAs), optional: true };
  });
  return [...does, ...reviews];
}

function useLead(item: Item, kit: StepKit, values: SlotState['values']): StepKit {
  const [copied, setCopied] = useState<ReadonlySet<string>>(() => new Set());
  const onCopied = (panel: string) => setCopied((now) => (now.has(panel) ? now : new Set(now).add(panel)));
  return { ...kit, lead: { next: nextAction(progressOf(item, kit, { values, copied })), onCopied } };
}

function StepItem({ item, at, kit: shared, slots, stage, debug, rounds }: StepItemProps & Where) {
  const kit = useLead(item, kitOf(shared, { item, stage, debug, rounds }), slots.values);
  const { job, doSteps } = item;
  const [lead] = doSteps;
  const reviewAt = (lead ? contextCount(lead, job.task, kit) + 1 : 0) + 1;
  return (
    <AccordionItem value={String(at)} data-job={job.id} className="last:border-b-0">
      <AccordionTrigger>
        <Marker done={item.state !== 'open'} at={at} />
        {item.round ? `${item.round.title}: ${job.goal.do}` : job.goal.do}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-5.5 sm:pl-7">
        {doSteps.length > 0 && <ChatTabs steps={doSteps} task={job.task} kind="do" kit={kit} slots={slots} first={1} />}
        <Review item={item} kit={kit} slots={slots} first={reviewAt} />
      </AccordionContent>
    </AccordionItem>
  );
}

interface StepperProps {
  readonly stage: StageView;
  readonly run: StageRun;
  readonly kit: StepKit;
  readonly slots: SlotState;
  readonly jobId?: string | null;
  readonly round?: number | null;
  readonly debug: DebugBase | null;
}

export function Stepper({ stage, run, kit, slots, jobId = null, round = null, debug }: StepperProps) {
  const items = itemsOf(stage, run);
  return (
    <Accordion type="single" collapsible data-stepper="" defaultValue={openItemOf(items, jobId, round)}>
      {items.map((item, at) => (
        <StepItem key={item.key} {...{ item, at, kit, slots, stage, debug }} rounds={run.rounds.length} />
      ))}
    </Accordion>
  );
}
