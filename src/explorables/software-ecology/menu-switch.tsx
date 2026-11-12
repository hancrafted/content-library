import styles from './software-ecology.module.css';

/** A setting that is on or off, with its name, an optional note under it and an optional tooltip. */
export function MenuSwitch(p: {
  readonly on: boolean;
  readonly onFlip: (on: boolean) => void;
  readonly title: string;
  readonly note?: string;
  readonly tip?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      className={styles.mswitch}
      aria-checked={p.on}
      data-tip={p.tip}
      onClick={() => p.onFlip(!p.on)}
    >
      <span className={styles.switchTrack} aria-hidden="true" />
      <span>
        <b className="font-semibold">{p.title}</b>
        {p.note ? <span className="text-muted-foreground">{p.note}</span> : null}
      </span>
    </button>
  );
}
