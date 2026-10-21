import { durationText, sessionParts, type SessionPart } from './context-bars.pure';
import type { SessionPlan } from './context-data';
import { fill } from './context-view';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';
import { vars } from './window-bits';

/*
 * The session bar as a pure view: the audience's own attention over the session, one segment per Section sized by
 * its share. Sections up to and including the current one are filled, the current one is highlighted and named, the
 * rest stay empty; no current Section is a fresh session. Server-rendered, no hooks (FE-006 §5).
 */

interface Props {
  readonly plan: SessionPlan;
  readonly words: ContextWords;
  /** The Section the Slide opens, or null for the start, where nothing is used yet. */
  readonly at: string | null;
}

/** What the bar says in words: nothing used yet, or the current Section and its place. */
function progressText(plan: SessionPlan, words: ContextWords['session'], at: string | null): string {
  if (at === null) return words.empty;
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
      style={vars({ '--z': part.share })}
    >
      {part.state === 'current' && (
        <span className={`${styles.sessionNow} font-semibold`}>{words.sections[part.id] ?? part.id}</span>
      )}
    </div>
  );
}

export function SessionBarView({ plan, words, at }: Props) {
  const total = durationText(plan.minutes, words.mini);
  const text = progressText(plan, words.session, at);
  return (
    <figure className={`${styles.session} text-caption`} data-session={at ?? 'start'}>
      <figcaption>
        <span data-session-label className="font-medium">
          {words.session.label}
        </span>
        <small data-session-total className="text-caption">
          {total}
        </small>
      </figcaption>
      <div className={styles.sessionBar} role="img" aria-label={`${words.session.label}, ${total}: ${text}`}>
        {sessionParts(plan.sections, at).map((part) => (
          <Part key={part.id} part={part} words={words.session} />
        ))}
      </div>
      <span className={styles.sessionNote} aria-hidden="true">
        {at === null ? words.session.empty : ''}
      </span>
    </figure>
  );
}
