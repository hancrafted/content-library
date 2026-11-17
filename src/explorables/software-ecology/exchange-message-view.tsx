// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import type { ExchangeMessage } from './exchange-message.pure.ts';
import styles from './software-ecology.module.css';

export function ExchangeMessageView({ message }: { message: ExchangeMessage | null }) {
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
