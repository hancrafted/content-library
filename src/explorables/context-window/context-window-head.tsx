import { percentText } from './context-format.pure';
import type { ContextWindowProps } from './context-parts.types';
import { fill, k, type Say } from './context-view';
import styles from './context.module.css';
import { HeadToggles } from './head-toggles';

interface Part {
  readonly p: ContextWindowProps;
  readonly say: Say;
}

function Title({ p, say }: Part) {
  const percent = percentText((p.frame.used / p.window.tokens) * 100, say.locale);
  return (
    <span className={styles.title}>
      <b className="font-semibold">{say.words.contextWindow}</b>
      {p.meter ? <span className={styles.meterValue}> ({percent}%)</span> : null}
    </span>
  );
}

function WindowSwitch({ p, say }: Part) {
  return (
    <div className={styles.windows} role="group" aria-label={say.words.windowGroup}>
      {p.sizes.map((size, i) => (
        <button key={size.tokens} type="button" aria-pressed={p.sizeIndex === i} onClick={() => p.onSize(i)}>
          {k(say, size.tokens).toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Meter({ p, say }: Part) {
  const used = k(say, p.frame.used).toUpperCase();
  const [before = '', after = ''] = fill(say.words.meterOf, { used }).split('{window}');
  return (
    <span className={styles.meterOf}>
      {before}
      {p.switchable ? (
        <WindowSwitch p={p} say={say} />
      ) : (
        <b className="font-semibold">{k(say, p.window.tokens).toUpperCase()}</b>
      )}
      {after}
    </span>
  );
}

export function ContextWindowHead({ p, say }: Part) {
  return (
    <div className={styles.head}>
      <Title p={p} say={say} />
      <div className={styles.headEnd}>
        {p.meter ? <Meter p={p} say={say} /> : null}
        <HeadToggles toggles={p.toggles} say={say} />
      </div>
    </div>
  );
}
