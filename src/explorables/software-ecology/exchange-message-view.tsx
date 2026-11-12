import type { ExchangeMessage } from './exchange-message.pure.ts';
import styles from './software-ecology.module.css';

/*
 * The message under the toolbar after Download or Upload (design-ADR 0024 §11): always in the page, so a screen reader
 * hears the first message too.
 */

/** The message under the toolbar after Download or Upload; a refusal lists its reasons. */
export function ExchangeMessageView({ message }: { message: ExchangeMessage | null }) {
  // always in the page, so a screen reader hears the first message too
  return (
    <div className={`${styles.ioMsg} text-caption`} data-bad={!!message?.bad} aria-live="polite" hidden={!message}>
      {message?.text}
      {message?.list.length ? (
        <ul>
          {message.list.map((m, i) => (
            <li key={`${i}:${m}`}>{m}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
