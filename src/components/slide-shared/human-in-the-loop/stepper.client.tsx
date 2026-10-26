'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check } from 'lucide-react';
import { ChatTabs } from './chat-tabs.client';
import type { SlotState, StepKit } from './step-kit.types';
import { contextCount, resultKey } from './step-panel.client';
import { itemsOf, type Item } from './stepper-items.pure';
import { goalOf } from './task-goals.pure';
import type { JobModalView } from './workflow-view.pure';

/*
 * The vertical stepper of a stage's modal: one numbered item per job, titled by its goal in one sentence. An open item
 * lists its steps (context, prompt and result, check) with minimal chrome. The first is open at first. Built on the
 * shadcn Accordion: one item open at a time, closable.
 */

/** An item is done once every chat's result was pasted: its number turns into a tick. */
function isDone({ job, doSteps }: Item, slots: SlotState): boolean {
  return doSteps.length > 0 && doSteps.every((step) => Boolean(slots.values[resultKey(step, job.task)]?.trim()));
}

function Marker({ done, at }: { done: boolean; at: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground"
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

function StepItem({ item, at, kit, slots }: StepItemProps) {
  const { job, doSteps, reviewSteps } = item;
  const [lead] = doSteps;
  const reviewAt = (lead ? contextCount(lead, job.task, kit) + 1 : 0) + 1;
  return (
    <AccordionItem value={String(at)} data-job={job.id} className="last:border-b-0">
      <AccordionTrigger>
        <Marker done={isDone(item, slots)} at={at} />
        {goalOf(job.id, 'do', job.title)}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 sm:pl-10">
        {doSteps.length > 0 && <ChatTabs steps={doSteps} task={job.task} kind="do" kit={kit} slots={slots} first={1} />}
        {reviewSteps.length > 0 && (
          <ChatTabs steps={reviewSteps} task={job.task} kind="review" kit={kit} slots={slots} first={reviewAt} />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

interface StepperProps {
  readonly jobs: readonly JobModalView[];
  readonly kit: StepKit;
  readonly slots: SlotState;
}

export function Stepper({ jobs, kit, slots }: StepperProps) {
  return (
    <Accordion type="single" collapsible data-stepper="" defaultValue="0">
      {itemsOf(jobs).map((item, at) => (
        <StepItem key={item.key} {...{ item, at, kit, slots }} />
      ))}
    </Accordion>
  );
}
