import { controlOf } from './context-controls.pure';
import { percentText } from './context-format.pure';
import type { ContextWindowProps } from './context-parts.types';
import { fill, k, type Say } from './context-view';
import styles from './context.module.css';
import { ControlIcon, IconButton } from './control-icons';

/* The context-window head: `Context window (64%)   128K of [200K | 1M]` and the icon buttons the Preset offers. */

interface Part {
  readonly p: ContextWindowProps;
  readonly say: Say;
}

/** `Context window (64%)`: the part's name and how full it is. */
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

/** `128K of [200K | 1M]`: the used tokens, then the window as a switch, or as plain text without one. */
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

function HeadToggles({ p, say }: Part) {
  return p.toggles.map((toggle) => {
    const def = controlOf({ controls: {} }, toggle.id);
    if (def.type !== 'toggle') return null;
    return (
      <IconButton
        key={toggle.id}
        label={say.words[def.label]}
        tip={say.words[def.tip]}
        pressed={toggle.pressed}
        control={toggle.id}
        onClick={toggle.onToggle}
      >
        <ControlIcon name={def.icon} />
      </IconButton>
    );
  });
}

export function ContextWindowHead({ p, say }: Part) {
  return (
    <div className={styles.head}>
      <Title p={p} say={say} />
      <div className={styles.headEnd}>
        {p.meter ? <Meter p={p} say={say} /> : null}
        <HeadToggles p={p} say={say} />
      </div>
    </div>
  );
}
