'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check } from 'lucide-react';
import { ChatTabs } from './chat-tabs.client';
import type { SlotState, StepKit } from './step-kit.types';
import { contextCount } from './step-panel.client';
import { itemsOf, openItemOf, type Item } from './stepper-items.pure';
import type { StageRun } from './workflow-run.pure';
import type { StageView } from './workflow-view.pure';

/*
 * The vertical stepper of a stage's modal: one numbered item per job (per round of a repeated stage, titled by its H3), titled by its goal in one sentence. An open item
 * lists its steps (context, prompt and result, check) with minimal chrome. The first is open at first. Built on the
 * shadcn Accordion: one item open at a time, closable.
 */

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
        <Marker done={item.state !== 'open'} at={at} />
        {item.round ? `${item.round.title}: ${job.goal.do}` : job.goal.do}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 sm:pl-10">
        {doSteps.length > 0 && <ChatTabs steps={doSteps} task={job.task} kind="do" kit={kit} slots={slots} first={1} />}
        {reviewSteps.length > 0 && job.goal.review && (
          <p data-review-goal="" className="text-caption text-muted-foreground">
            {job.goal.review}
          </p>
        )}
        {reviewSteps.length > 0 && (
          <ChatTabs steps={reviewSteps} task={job.task} kind="review" kit={kit} slots={slots} first={reviewAt} />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

interface StepperProps {
  readonly stage: StageView;
  /** What the run says of this stage: each job's state and, in a repeated stage, its rounds. */
  readonly run: StageRun;
  readonly kit: StepKit;
  readonly slots: SlotState;
  /** The job whose card opened the modal: its first item starts open. */
  readonly jobId?: string | null;
}

export function Stepper({ stage, run, kit, slots, jobId = null }: StepperProps) {
  const items = itemsOf(stage, run);
  return (
    <Accordion type="single" collapsible data-stepper="" defaultValue={openItemOf(items, jobId)}>
      {items.map((item, at) => (
        <StepItem key={item.key} {...{ item, at, kit, slots }} />
      ))}
    </Accordion>
  );
}
