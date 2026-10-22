'use client';

import type { UiWords } from './human-in-the-loop.types';
import { PromptBox, type PromptKit } from './prompt-box.client';
import type { JobModalView, StepView } from './workflow-view.pure';

/*
 * The actionable area of the modal, the same for every job: numbered steps top to bottom, each one line saying what
 * to do and its prompt collapsed behind a row of icons. Technical shows the one-time setup above the command.
 */

interface StepsProps {
  readonly job: JobModalView;
  readonly kit: PromptKit;
}

function Setup({ setup, words }: { setup: string; words: UiWords }) {
  return (
    <section aria-label={words.setup}>
      <h4 className="text-caption font-medium text-muted-foreground">{words.setup}</h4>
      <pre className="mt-1 rounded-md bg-muted p-2 text-caption whitespace-pre-wrap">{setup}</pre>
    </section>
  );
}

interface StepProps extends Omit<StepsProps, 'job'> {
  readonly step: StepView;
  readonly number: number;
  readonly setup?: string;
}

function Step({ step, number, setup, kit }: StepProps) {
  const running = step.id === 'run';
  const { words } = kit;
  return (
    <li data-step={step.id} className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground"
      >
        {number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-body font-medium">{step.todo}</p>
        {running && step.prompt.kind === 'command' && setup ? <Setup setup={setup} words={words} /> : null}
        <PromptBox prompt={step.prompt} kit={{ ...kit, short: running && kit.short }} />
      </div>
    </li>
  );
}

export function ModalSteps({ job, ...rest }: StepsProps) {
  return (
    <ol className="flex flex-col gap-4" data-steps="">
      {job.steps.map((step, at) => (
        <Step key={step.id} step={step} number={at + 1} setup={job.setup} {...rest} />
      ))}
    </ol>
  );
}
