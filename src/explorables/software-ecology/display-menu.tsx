import { MenuSwitch } from './menu-switch';
import type { PileStyle } from './paint-pile.ts';
import type { DisplayWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

/*
 * The Settings popover's Display column (feature guide, Interaction 3): how the factory is drawn, never what it
 * computes. Belt motion and the pile-up style past the rack; the theme follows the site header's switch.
 */

export interface DisplayMenuProps {
  readonly words: DisplayWords;
  readonly beltMotion: boolean;
  readonly onBeltMotion: (on: boolean) => void;
  readonly pile: PileStyle;
  readonly onPile: (p: PileStyle) => void;
}

const PILES: readonly PileStyle[] = ['heap', 'stack', 'drift'];

export function DisplayMenu(p: DisplayMenuProps) {
  const w = p.words;
  return (
    <>
      <MenuSwitch on={p.beltMotion} onFlip={p.onBeltMotion} title={w.beltMotion} note={w.beltMotionNote} />
      <div className={styles.moreOpts}>
        <p className="m-0">
          <b className="font-semibold">{w.pile}</b>
        </p>
        <div className={styles.seg} role="group" aria-label={w.pileLabel}>
          {PILES.map((k) => (
            <ToolTip key={k} tip={w.piles[k].note}>
              <button type="button" className="text-caption" aria-pressed={p.pile === k} onClick={() => p.onPile(k)}>
                {w.piles[k].name}
              </button>
            </ToolTip>
          ))}
        </div>
      </div>
    </>
  );
}
