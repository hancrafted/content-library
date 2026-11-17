// decision: FE-006 §5
import { SESSION_END, sessionParts, type SessionPart } from './context-bars.pure';
import type { SessionPlan } from './context-data';
import { fill } from './context-view';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';
import { vars } from './window-bits';

interface Props {
  readonly plan: SessionPlan;
  readonly words: ContextWords;
  readonly at: string | null;
}

function progressText(plan: SessionPlan, words: ContextWords['session'], at: string | null): string {
  if (at === null) return words.empty;
  if (at === SESSION_END) return words.full;
  const n = plan.sections.findIndex((section) => section.id === at) + 1;
  return fill(words.progress, { title: words.sections[at] ?? at, n: String(n), count: String(plan.sections.length) });
}

function Part({ part, words }: { readonly part: SessionPart; readonly words: ContextWords['session'] }) {
  return (
    <div
      className={styles.sessionPart}
      data-state={part.state}
      data-share={part.share}
      data-side={part.side}
      data-tone={part.tone % 4}
      style={vars({ '--z': part.share })}
    >
      {part.state === 'current' && (
        <span className={`${styles.sessionNow} font-semibold`}>{words.sections[part.id] ?? part.id}</span>
      )}
    </div>
  );
}

export function SessionBarView({ plan, words, at }: Props) {
  const text = progressText(plan, words.session, at);
  return (
    <figure className={`${styles.session} text-caption`} data-session={at ?? 'start'}>
      <figcaption>
        <span data-session-label className="font-medium">
          {words.session.label}
        </span>
      </figcaption>
      <div className={styles.sessionBar} role="img" aria-label={`${words.session.label}: ${text}`}>
        {sessionParts(plan.sections, at).map((part) => (
          <Part key={part.id} part={part} words={words.session} />
        ))}
      </div>
      <span data-session-note className={styles.sessionNote} aria-hidden="true">
        {at === null ? words.session.empty : at === SESSION_END ? words.session.full : ''}
      </span>
    </figure>
  );
}
