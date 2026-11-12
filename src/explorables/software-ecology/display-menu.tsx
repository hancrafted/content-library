import type { PileStyle } from './paint-pile.ts';
import { Field, Segmented, SwitchField } from './settings-field.client';
import type { DisplayWords } from './software-ecology-words.types';

/*
 * The Settings popover's Display column (feature guide, Interaction 3): how the factory is drawn, never what it
 * computes. Belt motion and the pile-up style past the rack, as form fields; the theme follows the site header's switch.
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
  const items = PILES.map((k) => ({ id: k, label: w.piles[k].name, tip: w.piles[k].note }));
  return (
    <>
      <SwitchField label={w.beltMotion} tip={w.beltMotionNote} on={p.beltMotion} onFlip={p.onBeltMotion} />
      <Field label={w.pile} tip={w.pileTip}>
        {(l) => <Segmented labelId={l} items={items} on={p.pile} onPick={p.onPile} />}
      </Field>
    </>
  );
}
