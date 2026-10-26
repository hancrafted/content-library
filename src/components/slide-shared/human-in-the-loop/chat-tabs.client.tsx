'use client';

import { cn } from '@/lib/utils';
import { useId, useState } from 'react';
import type { UiWords } from './human-in-the-loop.types';
import type { SlotState, StepKit } from './step-kit.types';
import { StepPanel } from './step-panel.client';
import type { Item } from './stepper-items.pure';
import { chatName } from './words.pure';

interface TabsProps {
  readonly steps: Item['doSteps'];
  readonly task: Item['job']['task'];
  readonly kind: 'do' | 'review';
  readonly kit: StepKit;
  readonly slots: SlotState;
  readonly first: number;
  readonly checkedAs?: string;
}

function TabButton({
  label,
  selected,
  id,
  onSelect,
}: {
  label: string;
  selected: boolean;
  id: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-tab`}
      aria-selected={selected}
      aria-controls={`${id}-panel`}
      onClick={onSelect}
      className={cn(
        'inline-flex min-h-9 cursor-pointer items-center rounded-full border border-border px-3 text-caption font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent',
      )}
    >
      {label}
    </button>
  );
}

function TabList({
  steps,
  words,
  id,
  selected,
  onSelect,
}: {
  steps: Item['doSteps'];
  words: UiWords;
  id: string;
  selected: number;
  onSelect: (at: number) => void;
}) {
  return (
    <div role="tablist" aria-label={words.doIt} className="flex flex-wrap gap-1.5">
      {steps.map((chat, at) => (
        <TabButton
          key={chat.chat}
          id={`${id}-${at}`}
          label={chatName(words, chat.chat ?? at + 1)}
          selected={at === selected}
          onSelect={() => onSelect(at)}
        />
      ))}
    </div>
  );
}

/** One panel for a single chat; for a fan-out a tab per chat, every panel mounted so what is pasted survives a switch. */
export function ChatTabs({ steps, task, kind, kit, slots, first, checkedAs }: TabsProps) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const several = steps.length > 1;
  return (
    <div className="flex flex-col gap-4">
      {several && <TabList steps={steps} words={kit.words} id={id} selected={selected} onSelect={setSelected} />}
      {steps.map((step, at) => (
        <div
          key={step.chat ?? 'one'}
          role={several ? 'tabpanel' : undefined}
          id={`${id}-${at}-panel`}
          hidden={at !== selected}
        >
          <StepPanel {...{ step, task, kind, kit, slots, first, checkedAs }} />
        </div>
      ))}
    </div>
  );
}
