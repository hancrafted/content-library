import type { CSSProperties, ReactNode } from 'react';
import { Sparkle } from '../venue-pipeline/glyphs';
import { AttentionFaces, type FaceLevel } from './attention-faces';
import { trickleDigits } from './digit-trickle.pure';
import styles from './speech-bubble.module.css';

/*
 * The "Your attention span" card as a speech bubble from the AI: its Sparkle avatar with a tail into the bubble, the
 * punchline in its voice, on a Section opener a poll line with three numbered emoji faces, and a 0/1 trickle falling from the
 * tail into whatever sits under it (the session bar, as `children`). The motion plays once when the Slide mounts and is
 * off under reduced motion; no client code (FE-006). The part owns no words: the Slide passes them.
 */

interface Poll {
  /** The Section's poll line, "So, how's your attention?". */
  readonly line: string;
  readonly labels: Readonly<Record<FaceLevel, string>>;
}

interface Props {
  readonly punchline: string;
  /** Absent on the Title slide, where the audience is still fresh. */
  readonly poll?: Poll;
  /** How many 0/1 digits fall into the bar, more the fuller it is. */
  readonly digits: number;
  /** The bar and what sits under it. */
  readonly children: ReactNode;
}

const style = (values: Record<string, string | number>): CSSProperties => values as CSSProperties;

/** The lane of digits under the bubble, decoration only. */
function Trickle({ digits }: { readonly digits: number }) {
  return (
    <div className={styles.lane} data-trickle="" aria-hidden="true">
      {trickleDigits(digits).map((digit, i) => (
        <span
          key={i}
          className={`${styles.digit} text-caption font-semibold`}
          data-digit=""
          style={style({ '--x': `${digit.x}%`, '--drift': `${digit.drift}rem`, '--delay': `${digit.delay}ms` })}
        >
          {digit.char}
        </span>
      ))}
    </div>
  );
}

export function SpeechBubble({ punchline, poll, digits, children }: Props) {
  return (
    <div className={styles.card} data-bubble="">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-ai/15 ring-1 ring-ai/40"
          data-avatar=""
        >
          <Sparkle className="size-5" />
        </span>
        <div className={styles.bubble}>
          <span className={styles.tail} data-bubble-tail="" aria-hidden="true" />
          <p className="m-0 text-body font-semibold" data-punchline="">
            {punchline}
          </p>
          {poll && (
            <div className="flex flex-col gap-2" data-poll="">
              <p className="m-0 text-caption" data-poll-line="">
                {poll.line}
              </p>
              <AttentionFaces labels={poll.labels} />
            </div>
          )}
        </div>
      </div>
      <Trickle digits={digits} />
      {children}
    </div>
  );
}
