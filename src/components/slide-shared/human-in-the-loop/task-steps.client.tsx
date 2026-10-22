'use client';

import { TryPrompt, type PromptKit } from '../core-components/try-prompt/try-prompt.client';
import type { UiWords } from './human-in-the-loop.types';
import { MarkdownView } from './markdown-view';
import { tryWords } from './words.pure';
import type { TaskModalView } from './workflow-view.pure';

/*
 * A new-schema task in the popover, drawn plainly: its steps (the do prompts, then the review) as numbered rows
 * through TryPrompt, then why it matters, the example result and what good looks like. Layout polish is issue 284.
 */

interface TaskProps {
  readonly task: TaskModalView;
  readonly kit: PromptKit & { readonly words: UiWords };
}

function stepLabel(step: TaskModalView['steps'][number], words: UiWords): string {
  if (step.id === 'review') return words.reviewIt;
  return step.chat === undefined ? words.doIt : words.chatN.replace('{n}', String(step.chat));
}

export function TaskSteps({ task, kit }: TaskProps) {
  const promptKit = { ...kit, words: tryWords(kit.words) };
  return (
    <ol className="flex flex-col gap-4" data-steps="">
      {task.steps.map((step, at) => (
        <li key={`${step.id}-${step.chat ?? 0}`} data-step={step.id} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground"
          >
            {at + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-body font-medium">{stepLabel(step, kit.words)}</p>
            <TryPrompt prompt={step.prompt} kit={promptKit} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function TaskDetails({ task, words }: { readonly task: TaskModalView; readonly words: UiWords }) {
  return (
    <div className="flex flex-col gap-4" data-details="">
      <section>
        <h3 className="text-caption font-medium text-muted-foreground">{words.sectionWhy}</h3>
        <p className="mt-1">{task.why}</p>
      </section>
      <section>
        <h3 className="text-caption font-medium text-muted-foreground">{words.sectionExample}</h3>
        <div className="mt-1">
          <MarkdownView markdown={task.example} />
        </div>
      </section>
      <section>
        <h3 className="text-caption font-medium text-muted-foreground">{words.sectionCriteria}</h3>
        <ul className="mt-1 list-disc pl-5">
          {task.goodLooksLike.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
