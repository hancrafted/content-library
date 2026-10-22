'use client';

import { cn } from '@/lib/utils';
import { useId, useState } from 'react';
import { Tip } from '../core-components/tip/tip.client';
import { TryPrompt, type PromptKit } from '../core-components/try-prompt/try-prompt.client';
import type { UiWords } from './human-in-the-loop.types';
import { MarkdownView } from './markdown-view';
import { tryWords } from './words.pure';
import type { TaskModalView } from './workflow-view.pure';

/*
 * A new-schema task in the popover: its numbered steps (the do prompts, then the review) through TryPrompt, and its
 * details (why it matters, the example result, what good looks like), which the modal part places beside the steps
 * on a wide screen and folds under them on a phone. A fanned-out task shows its chats as tabs, Chat 1…N.
 */

type Step = TaskModalView['steps'][number];

/** The Workflow-wide pasted values, owned by the parent, and how a TryPrompt reports a change. */
export interface SlotState {
  readonly values: Readonly<Record<string, string>>;
  readonly onChange: (values: Readonly<Record<string, string>>) => void;
}

interface TaskProps {
  readonly task: TaskModalView;
  readonly kit: PromptKit & { readonly words: UiWords };
  /** Called when a press or focus lands on the task, so the details column can follow it. */
  readonly onActive?: () => void;
  readonly slots: SlotState;
}

function StepNumber({ at }: { at: number }) {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground"
    >
      {at}
    </span>
  );
}

const chatName = (words: UiWords, chat: number) => words.chatN.replace('{n}', String(chat));

interface ChatTabProps {
  readonly chat: Step;
  readonly at: number;
  readonly selected: boolean;
  readonly id: string;
  readonly words: UiWords;
  readonly onSelect: () => void;
}

function ChatTab({ chat, at, selected, id, words, onSelect }: ChatTabProps) {
  return (
    <Tip text={words.chatTip.replace('{n}', String(chat.chat))} place="above" align="start">
      <button
        type="button"
        role="tab"
        id={`${id}-tab-${at}`}
        aria-selected={selected}
        aria-controls={`${id}-panel-${at}`}
        onClick={onSelect}
        className={cn(
          'inline-flex min-h-9 cursor-pointer items-center rounded-full border border-border px-3 text-caption font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring',
          selected ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent',
        )}
      >
        {chatName(words, chat.chat ?? at + 1)}
      </button>
    </Tip>
  );
}

interface ChatTabsProps {
  readonly chats: readonly Step[];
  readonly kit: TaskProps['kit'];
  readonly promptKit: PromptKit;
  readonly slots: SlotState;
}

/** The chats of a fan-out as tabs; every chat stays mounted, so what is opened or pasted in one survives a switch. */
function ChatTabs({ chats, kit, promptKit, slots }: ChatTabsProps) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <div role="tablist" aria-label={kit.words.doIt} className="flex flex-wrap gap-1.5">
        {chats.map((chat, at) => (
          <ChatTab
            key={chat.chat}
            {...{ chat, at, selected: at === selected, id, words: kit.words }}
            onSelect={() => setSelected(at)}
          />
        ))}
      </div>
      {chats.map((chat, at) => (
        <div
          key={chat.chat}
          role="tabpanel"
          id={`${id}-panel-${at}`}
          aria-labelledby={`${id}-tab-${at}`}
          hidden={at !== selected}
        >
          <TryPrompt prompt={chat.prompt} kit={promptKit} values={slots.values} onChange={slots.onChange} />
        </div>
      ))}
    </div>
  );
}

export function TaskSteps({ task, kit, onActive, slots }: TaskProps) {
  const promptKit = { ...kit, words: tryWords(kit.words) };
  const chats = task.steps.filter((step) => step.id === 'do' && step.chat !== undefined);
  const rows = task.steps.filter((step) => !(step.id === 'do' && step.chat !== undefined));
  const lead = chats.length > 0 ? [{ tabs: true as const }, ...rows] : rows;
  return (
    <ol className="flex flex-col gap-4" data-steps="" onClickCapture={onActive} onFocusCapture={onActive}>
      {lead.map((step, at) => {
        const tabs = 'tabs' in step;
        const id = tabs ? 'do' : step.id;
        return (
          <li key={id} data-step={id} className="flex gap-3">
            <StepNumber at={at + 1} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-body font-medium">{id === 'review' ? kit.words.reviewIt : kit.words.doIt}</p>
              {tabs ? (
                <ChatTabs chats={chats} kit={kit} promptKit={promptKit} slots={slots} />
              ) : (
                <TryPrompt prompt={step.prompt} kit={promptKit} values={slots.values} onChange={slots.onChange} />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

interface DetailsProps {
  readonly jobId: string;
  readonly task: TaskModalView;
  readonly words: UiWords;
  /** On a phone the details fold under their task; on a wide screen they stand in a column. */
  readonly folded: boolean;
}

function Body({ task, words }: Pick<DetailsProps, 'task' | 'words'>) {
  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="text-caption font-medium text-muted-foreground">{words.sectionWhy}</h3>
        <p className="mt-1">{task.why}</p>
      </section>
      <section>
        <h3 className="text-caption font-medium text-muted-foreground">{words.sectionExample}</h3>
        {task.examples.map((example, at) => (
          <div key={at} className="mt-1" data-example={at + 1}>
            {task.examples.length > 1 && (
              <p className="text-caption font-medium text-muted-foreground">{chatName(words, at + 1)}</p>
            )}
            <MarkdownView markdown={example} />
          </div>
        ))}
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

export function TaskDetails({ jobId, task, words, folded }: DetailsProps) {
  if (!folded) {
    return (
      <div data-details="" data-task={jobId}>
        <Body task={task} words={words} />
      </div>
    );
  }
  return (
    <details data-details="" data-task={jobId} className="rounded-xl border border-border p-3">
      <summary className="min-h-6 cursor-pointer text-body font-medium">{words.sectionAbout}</summary>
      <div className="mt-3">
        <Body task={task} words={words} />
      </div>
    </details>
  );
}
