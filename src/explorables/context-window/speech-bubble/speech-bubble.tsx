// decision: FE-006 §1
import type { ReactNode } from 'react';
import { Sparkle } from '../../../shared/components/core-components/glyphs/glyphs';
import { AttentionFaces, type FaceLevel } from './attention-faces';
import styles from './speech-bubble.module.css';

interface Poll {
  readonly line: string;
  readonly labels: Readonly<Record<FaceLevel, string>>;
}

interface Props {
  readonly punchline: string;
  readonly poll?: Poll;
  readonly children: ReactNode;
}

export function SpeechBubble({ punchline, poll, children }: Props) {
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
      {children}
    </div>
  );
}
