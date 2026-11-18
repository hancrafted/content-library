import type { CSSProperties, ReactNode } from 'react';
import { BOARD_TEAM_IDS, type BoardTeamId, type BoardThoughtExperimentWords } from './brief-or-pay-the-price.types';
import styles from './thought-experiment.module.css';

const delay = (seconds: number): CSSProperties => ({ '--delay': `${seconds}s` }) as CSSProperties;

export const SEAM: { readonly from: BoardTeamId; readonly to: BoardTeamId } = { from: 'food', to: 'venue' };

const NOTE =
  'whitespace-pre-line rounded-sm bg-[color-mix(in_oklab,var(--warning)_20%,var(--card))] p-2 text-caption shadow-sm';

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0 fill-none stroke-current stroke-2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function Team({
  id,
  index,
  words,
}: {
  readonly id: BoardTeamId;
  readonly index: number;
  readonly words: BoardThoughtExperimentWords;
}) {
  const fails = id === SEAM.to;
  return (
    <div data-team={id} style={delay(0.4 + index * 0.3)} className={`${styles.rise} flex min-w-0 flex-col gap-2`}>
      <div className="flex items-center gap-1 text-caption font-semibold">
        <PersonIcon />
        {words.teams[id].name}
      </div>
      <div data-note={id} data-state={fails ? 'fail' : 'ok'} className={`${NOTE} ${fails ? styles.fail : styles.ok}`}>
        {words.teams[id].note}
      </div>
    </div>
  );
}

const BOARD =
  'relative grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted p-3 pb-18 @3xl:grid-cols-4 @3xl:gap-6 @3xl:p-6 @3xl:pb-18';

// decision: FE-012 §4.5
export function BoardThoughtExperimentView({
  words,
  seam,
}: {
  readonly words: BoardThoughtExperimentWords;
  readonly seam?: ReactNode;
}) {
  return (
    <section
      aria-label={words.title}
      data-thought-experiment="board"
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 @3xl:p-6"
    >
      <p style={delay(0)} className={`${styles.rise} font-semibold`}>
        {words.intro}
      </p>
      <div className={BOARD}>
        {BOARD_TEAM_IDS.map((id, index) => (
          <Team key={id} {...{ id, index, words }} />
        ))}
        {seam}
      </div>
      <p style={delay(2.8)} className={`${styles.rise} text-caption text-muted-foreground`}>
        {words.caption}
      </p>
    </section>
  );
}
