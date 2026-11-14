import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './slide.module.css';

interface CardLabel {
  readonly state: string;
  readonly kind: string;
}

function Label({ label }: { readonly label: CardLabel }) {
  return (
    <p className="text-caption font-semibold text-primary uppercase">
      {label.state} <span className="font-normal text-muted-foreground normal-case">{label.kind}</span>
    </p>
  );
}

const FIELD = 'mt-3 border-b-2 border-dashed border-border pb-1 text-caption';

/** The empty card of the first Slide: blank fields, and the open question of what is needed. */
export function EmptyCard({
  label,
  fields,
  question,
}: {
  readonly label: CardLabel;
  readonly fields: { readonly title: string; readonly useWhen: string };
  readonly question: string;
}) {
  return (
    <ZoneCard
      data-card="empty"
      className="flex h-full -rotate-1 flex-col rounded-lg border-2 border-dashed p-4 shadow-md"
    >
      <Label label={label} />
      <p className={cn(FIELD, 'text-muted-foreground')}>{fields.title}</p>
      <p className={cn(FIELD, 'text-muted-foreground')}>{fields.useWhen}</p>
      <ol className="mt-3 flex flex-col gap-3 text-caption text-muted-foreground">
        {['1.', '2.', '3.'].map((n) => (
          <li key={n} className="border-b border-dashed border-border pb-1">
            {n}
          </li>
        ))}
      </ol>
      <p className="mt-auto pt-3 text-caption text-muted-foreground italic">{question}</p>
    </ZoneCard>
  );
}

interface DraftStep {
  readonly text: ReactNode;
  readonly struck?: boolean;
}

/** The draft's steps in plain ink, a wrong one struck through. */
function DraftSteps({ steps }: { readonly steps: readonly DraftStep[] }) {
  return (
    <ol className="mt-3 flex flex-col gap-2 text-caption">
      {steps.map(({ text, struck }, index) => (
        <li
          key={index}
          data-struck={struck ? '' : undefined}
          className={cn('border-b border-dashed border-border pb-1', struck && 'text-muted-foreground line-through')}
        >
          {text}
        </li>
      ))}
    </ol>
  );
}

interface DraftCardProps {
  readonly label: CardLabel;
  readonly title: string;
  readonly useWhen: string;
  readonly steps: readonly DraftStep[];
  readonly question: string;
}

/** The draft: a title, steps in plain ink with one struck through, and the good result still a question. */
export function DraftCard({ label, title, useWhen, steps, question }: DraftCardProps) {
  return (
    <ZoneCard
      data-card="draft"
      className="flex h-full rotate-1 flex-col rounded-lg border-2 border-dashed p-4 shadow-md"
    >
      <Label label={label} />
      <p className={cn(FIELD, 'text-body font-semibold')}>{title}</p>
      <p className={cn(FIELD, 'text-muted-foreground')}>{useWhen}</p>
      <DraftSteps steps={steps} />
      <p className="mt-auto pt-3 text-caption text-muted-foreground italic">{question}</p>
    </ZoneCard>
  );
}

/** A line's place in the fill: the card writes itself line by line. */
const line = (index: number) => ({ '--line': index }) as CSSProperties;

/** The written steps, numbered, and the green good-result line last. */
function WrittenSteps({ steps, goodResult }: { readonly steps: readonly string[]; readonly goodResult: string }) {
  return (
    <>
      <ol className="mt-3 flex flex-col gap-1 text-caption">
        {steps.map((step, index) => (
          <li key={step} data-motion="fill" style={line(index)} className={cn(styles.line, 'flex gap-2')}>
            <span className="w-3 shrink-0 font-semibold text-primary">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <p
        data-good-result
        data-motion="fill"
        style={line(steps.length)}
        className={cn(styles.line, 'mt-3 rounded-md bg-(--success)/15 px-2 py-1 text-caption font-medium')}
      >
        <span aria-hidden className="mr-1 text-(--success)">
          ✓
        </span>
        {goodResult}
      </p>
    </>
  );
}

interface WrittenCardProps {
  readonly label: CardLabel;
  readonly title: string;
  readonly useWhen: ReactNode;
  readonly steps: readonly string[];
  readonly goodResult: string;
}

/** The written card: use-when line, six numbered steps, and the green good-result line; it fills line by line. */
export function WrittenCard({ label, title, useWhen, steps, goodResult }: WrittenCardProps) {
  return (
    <ZoneCard data-card="written" className="flex h-full flex-col rounded-lg border-2 border-primary p-4 shadow-md">
      <Label label={label} />
      <p className="mt-2 text-body font-semibold">{title}</p>
      <p className="mt-1 text-caption">{useWhen}</p>
      <WrittenSteps steps={steps} goodResult={goodResult} />
    </ZoneCard>
  );
}
