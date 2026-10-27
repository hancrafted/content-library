'use client';

import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useId } from 'react';
import type { ToolbarProps } from './part-props.types';
import { offers } from './toolbar-controls.pure';

/** One option of the picker: the title, and under it, muted, the one sentence the Workflow says about itself. */
function Choice({ title, description }: { readonly title: string; readonly description?: string }) {
  return (
    <span className="flex flex-col items-start gap-0.5 text-left">
      <span>{title}</span>
      {description && (
        <span data-choice-description="" className="text-caption font-normal text-muted-foreground">
          {description}
        </span>
      )}
    </span>
  );
}

/** The picker's options: the Workflows, after an uploaded one that is none of them. */
function Options({ bar, known }: { readonly bar: ToolbarProps; readonly known: boolean }) {
  return (
    <>
      {known ? null : (
        <SelectItem value={bar.workflow.id} disabled>
          <Choice title={bar.workflow.title} description={bar.workflow.description} />
        </SelectItem>
      )}
      {bar.choices.map((c) => (
        <SelectItem key={c.id} value={c.id} data-workflow={c.id}>
          <Choice title={c.title} description={c.description} />
        </SelectItem>
      ))}
    </>
  );
}

/** Whether the toolbar draws the picker: the Preset allows it and there is a choice. */
export const hasPicker = (bar: ToolbarProps) => offers(bar.controls, 'picker') && bar.choices.length > 1;

/** The use case picker: a visible label and a shadcn Select of the Workflows; an uploaded one joins as its own option. */
export function Picker({ bar }: { readonly bar: ToolbarProps }) {
  const id = useId();
  if (!offers(bar.controls, 'picker') || bar.choices.length < 2) return null;
  const known = bar.choices.some((c) => c.id === bar.workflow.id);
  return (
    <div className="flex min-w-0 items-center gap-2 pl-3" data-control="picker">
      <Label htmlFor={id} className="text-caption">
        {bar.words.workflow}:
      </Label>
      <Select value={bar.workflow.id} onValueChange={bar.onWorkflow}>
        <SelectTrigger id={id}>
          {/* The title as children: Radix renders an empty value until hydration, so the static page would show none. */}
          <SelectValue>{bar.workflow.title}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <Options bar={bar} known={known} />
        </SelectContent>
      </Select>
    </div>
  );
}
