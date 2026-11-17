// spec: docs/features/explorables/software-ecology.md#interaction
import type { PileStyle } from './paint-pile.ts';
import { Field, Segmented, SwitchField } from './settings-field.client';
import type { DisplayWords } from './software-ecology-words.types';

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
      <SwitchField
        label={w.beltMotion}
        control="settings.belt-motion"
        tip={w.beltMotionNote}
        on={p.beltMotion}
        onFlip={p.onBeltMotion}
      />
      <Field label={w.pile} control="settings.pile" tip={w.pileTip}>
        {(l) => <Segmented labelId={l} control="settings.pile" items={items} on={p.pile} onPick={p.onPile} />}
      </Field>
    </>
  );
}
