// decision: FE-011 §4
export type PollTone = 'info' | 'accent';

export interface PollQuestionProps {
  marker: number;
  question: string;
  hint?: string;
  answers: readonly string[];
  votes?: readonly number[];
  tone: PollTone;
}

const TAG_SEPARATOR = ' – ';

function tagOf(answer: string): string {
  return answer.split(TAG_SEPARATOR)[0];
}

const LOOK: Record<PollTone, { disc: string; chip: string }> = {
  info: { disc: 'bg-(--info) text-info-foreground', chip: 'bg-(--info)/10' },
  accent: { disc: 'bg-brand-accent text-primary-foreground', chip: 'bg-brand-accent/10' },
};

export function PollQuestion({ marker, question, hint, answers, votes, tone }: PollQuestionProps) {
  const look = LOOK[tone];
  return (
    <li data-tone-flip className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-body font-semibold ${look.disc}`}
        >
          {marker}
        </span>
        <p className="text-body font-semibold">
          {question}
          {hint !== undefined && (
            <span data-poll-hint="" className="block text-caption font-normal text-muted-foreground">
              {hint}
            </span>
          )}
        </p>
      </div>
      <AnswerChips answers={answers} votes={votes} chip={look.chip} />
    </li>
  );
}

function AnswerChips({
  answers,
  votes,
  chip,
}: {
  answers: readonly string[];
  votes?: readonly number[];
  chip: string;
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {answers.map((answer, index) => (
        <li
          key={answer}
          data-poll-answer=""
          title={answer}
          className={`rounded-full px-3 py-1 text-caption font-medium text-foreground ${chip}`}
        >
          {tagOf(answer)}
          {votes !== undefined && (
            <span data-poll-votes="" className="ml-1.5 font-semibold tabular-nums">
              {votes[index]}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
