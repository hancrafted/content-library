import type { PileStyle } from './paint-pile.ts';
import type { MoreWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';

/*
 * The ⋮ menu (design-ADR 0024 §16): how the factory is drawn, never what it computes. Belt motion, the site's dark
 * theme, and the pile-up style past the rack. Ported from the reference build's ⋮ menu and `renderMore`.
 */

export interface MoreMenuProps {
  readonly words: MoreWords;
  readonly beltMotion: boolean;
  readonly onBeltMotion: (on: boolean) => void;
  readonly dark: boolean;
  readonly onDark: (on: boolean) => void;
  readonly pile: PileStyle;
  readonly onPile: (p: PileStyle) => void;
}

const PILES: readonly PileStyle[] = ['heap', 'stack', 'drift'];

function Switch(p: { on: boolean; onFlip: (on: boolean) => void; title: string; note?: string }) {
  return (
    <button type="button" role="switch" className={styles.mswitch} aria-checked={p.on} onClick={() => p.onFlip(!p.on)}>
      <span className={styles.switchTrack} aria-hidden="true" />
      <span>
        <b className="font-semibold">{p.title}</b>
        {p.note ? <span className="text-muted-foreground">{p.note}</span> : null}
      </span>
    </button>
  );
}

export function MoreMenu(p: MoreMenuProps) {
  const w = p.words;
  return (
    <>
      <Switch on={p.beltMotion} onFlip={p.onBeltMotion} title={w.beltMotion} note={w.beltMotionNote} />
      <Switch on={p.dark} onFlip={p.onDark} title={w.dark} />
      <div className={styles.moreOpts}>
        <p className="m-0">
          <b className="font-semibold">{w.pile}</b>
        </p>
        <div className={styles.seg} role="group" aria-label={w.pileLabel}>
          {PILES.map((k) => (
            <button
              key={k}
              type="button"
              className="text-caption"
              aria-pressed={p.pile === k}
              data-tip={w.piles[k].note}
              onClick={() => p.onPile(k)}
            >
              {w.piles[k].name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
