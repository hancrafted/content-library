'use client';

import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useId, useState } from 'react';
import { needsInput, shownValue, type Entry } from './context-entries.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { SlotState } from './step-kit.types';

const EXPANDED_ROWS = 8;

function FieldLabel({ id, label, info }: Pick<Entry, 'label' | 'info'> & { id: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <Label htmlFor={id} className="text-caption">
        {label}
      </Label>
      {info && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={info}
              className="size-5 text-muted-foreground"
            >
              <Info aria-hidden="true" className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent align="start">{info}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function EyeToggle({ full, words, onToggle }: { full: boolean; words: UiWords; onToggle: () => void }) {
  const Icon = full ? EyeOff : Eye;
  const label = full ? words.collapse : words.showFull;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={label} aria-pressed={full} onClick={onToggle}>
          <Icon aria-hidden="true" className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export interface FieldProps extends Omit<Entry, 'key'> {
  readonly field: string;
  readonly value: string;
  readonly words: UiWords;
  readonly onValue: (value: string) => void;
  readonly lead?: boolean;
}

export const LEAD_FRAME = 'border-(--info) ring-2 ring-(--info)';

const textareaClass = (full: boolean, lead: boolean) =>
  cn('resize-none', !full && 'overflow-hidden whitespace-pre', lead && LEAD_FRAME);

export function ContextField({ field, label, info, placeholder, value, words, onValue, lead = false }: FieldProps) {
  const id = useId();
  const [full, setFull] = useState(false);
  return (
    <div data-field={field} data-lead={lead || undefined} className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel id={id} label={label} info={info} />
      <div className={cn('flex min-w-0 gap-2', full ? 'items-start' : 'items-center')}>
        <Textarea
          id={id}
          rows={full ? EXPANDED_ROWS : 1}
          wrap={full ? 'soft' : 'off'}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onValue(event.target.value)}
          className={textareaClass(full, lead)}
        />
        <EyeToggle full={full} words={words} onToggle={() => setFull((now) => !now)} />
      </div>
    </div>
  );
}

interface FieldsProps {
  readonly entries: readonly Entry[];
  readonly slots: SlotState;
  readonly words: UiWords;
  readonly lead?: boolean;
}

export function Fields({ entries, slots, words, lead = false }: FieldsProps) {
  return entries.map((entry) => (
    <ContextField
      key={entry.key}
      field={entry.key}
      label={entry.label}
      info={entry.info}
      placeholder={entry.placeholder}
      value={shownValue(entry, slots.values)}
      words={words}
      onValue={(value) => slots.onChange({ ...slots.values, [entry.key]: value })}
      lead={lead && needsInput([entry], slots.values)}
    />
  ));
}
