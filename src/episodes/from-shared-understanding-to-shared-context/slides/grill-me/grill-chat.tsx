import type { ReactNode } from 'react';

export interface GrillRound {
  readonly slug: string;
  /** The round's label, a Context marker beside it where the Slide gives one. */
  readonly label: ReactNode;
  readonly questions: readonly string[];
  readonly answer: string;
  /** A collapsed round shows its label and answer on one line, without its questions. */
  readonly collapsed: boolean;
  /** The `data-target` the round's questions carry, where a Speaker note points at them. */
  readonly target?: { readonly 'data-target': string };
}

export interface GrillChatProps {
  readonly task: string;
  readonly roleSwitch: string;
  readonly rounds: readonly GrillRound[];
  readonly closing: string;
  /** "in rounds, not one by one", its Context marker beside it; it closes the collapsed round's line. */
  readonly roundsNote: ReactNode;
}

const ASKS = 'rounded-2xl rounded-bl-sm border border-ai/40 bg-ai/10';
const ROUND_LABEL = 'inline-flex items-center gap-1 text-caption font-semibold text-muted-foreground uppercase';

function OpenRound({ round }: { round: GrillRound }) {
  return (
    <section data-round={round.slug} className="flex flex-col gap-2">
      <p className={ROUND_LABEL}>{round.label}</p>
      <ol {...round.target} className={`${ASKS} w-full list-decimal py-3 pr-4 pl-8 text-caption @2xl:w-3/4`}>
        {round.questions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ol>
      <p className="w-full self-end rounded-2xl rounded-br-sm bg-human/15 px-4 py-3 text-caption @2xl:w-3/4">
        {round.answer}
      </p>
    </section>
  );
}

function CollapsedRound({ round, note }: { round: GrillRound; note: ReactNode }) {
  return (
    <section
      data-round={round.slug}
      data-collapsed
      className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground"
    >
      <span className="rounded-full border border-border px-3 py-1">{round.label}</span>
      <span>{round.answer}</span>
      <span className="ml-auto inline-flex items-center gap-1">{note}</span>
    </section>
  );
}

/**
 * The interview as a real chat: the role switch in the loudest pill, then rounds of numbered questions in `ai`, each
 * with one answer in `human`, the last round collapsed to its answer, and the AI's closing line.
 */
export function GrillChat({ task, roleSwitch, rounds, closing, roundsNote }: GrillChatProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <p className="text-body font-semibold">{task}</p>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1 text-caption font-semibold text-primary-foreground">
          {roleSwitch}
        </span>
      </div>
      {rounds.map((round) =>
        round.collapsed ? (
          <CollapsedRound key={round.slug} round={round} note={roundsNote} />
        ) : (
          <OpenRound key={round.slug} round={round} />
        ),
      )}
      <p className={`${ASKS} self-start px-4 py-2 text-caption font-semibold`}>{closing}</p>
    </div>
  );
}
