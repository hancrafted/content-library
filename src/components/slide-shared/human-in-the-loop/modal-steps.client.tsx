'use client';

import type { UiWords } from './human-in-the-loop.types';
import { PromptBox } from './prompt-box.client';
import type { JobModalView, StepView } from './workflow-view.pure';

/*
 * The actionable area of the modal, the same for every job: numbered steps top to bottom, each one line saying what
 * to do and its prompt collapsed behind a row of icons. Technical shows the one-time setup above the command.
 */

interface StepsProps {
  readonly job: JobModalView;
  readonly short: boolean;
  readonly words: UiWords;
  readonly onShort: () => void;
  readonly onCopy: (text: string) => void;
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

function Step({ step, number, setup, short, words, onShort, onCopy }: StepProps) {
  const running = step.id === 'run';
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
        <PromptBox prompt={step.prompt} short={running && short} words={words} onShort={onShort} onCopy={onCopy} />
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
