/** The colour a question takes: colour by question, structure only (FE-011). */
export type PollTone = 'info' | 'accent';

/** What `PollQuestion` takes: its number, its words, and its tone. */
export interface PollQuestionProps {
  /** The number on the disc: the question's place on its Slide. */
  marker: number;
  question: string;
  /** Under the question, for a question that takes several answers: "tick all that apply". */
  hint?: string;
  /** The answers in the order the poll lists them. */
  answers: readonly string[];
  /** Votes per answer, in the order of `answers`: a played Event's result, printed on each chip. */
  votes?: readonly number[];
  tone: PollTone;
}

/** Splits a poll answer: its tag before ` – `, the words the result screen keeps, and the explanation after it. */
const TAG_SEPARATOR = ' – ';

/** The tag of a `tag – explanation` answer, the whole answer when it has none. */
function tagOf(answer: string): string {
  return answer.split(TAG_SEPARATOR)[0];
}

const LOOK: Record<PollTone, { disc: string; chip: string }> = {
  info: { disc: 'bg-(--info) text-info-foreground', chip: 'bg-(--info)/10' },
  accent: { disc: 'bg-brand-accent text-primary-foreground', chip: 'bg-brand-accent/10' },
};

/**
 * One poll question printed on a Slide (a server part, an `<li>` for an ordered list): a numbered disc, the question,
 * its hint, and the tag of each answer as a chip (the whole answer as its title): the phone shows the whole answer, the Slide only what to look for.
 */
export function PollQuestion({ marker, question, hint, answers, votes, tone }: PollQuestionProps) {
  const look = LOOK[tone];
  return (
    <li className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 shadow-sm">
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

/** Each answer as a chip showing its tag, the whole answer as its title, and its vote count when the question has votes. */
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
