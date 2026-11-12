'use client';

import { MECH_DEFAULTS, MECH_RANGE, STRENGTHS } from './factory-dials.pure.ts';
import { withMech, withStrength } from './factory-settings.pure.ts';
import { SliderControl, SwitchField, Value } from './settings-field.client';
import type { ToolbarWords } from './software-ecology-words.types';
import type { Mechanic, Settings, Strength } from './software-ecology.types';

/*
 * The Settings popover's Mechanics column (feature guide, Interaction 3): what bad work does downstream. A switch field
 * per mechanic, Rework, Churn and Complaints, its tooltip saying what it does, and under Rework and Churn the strength
 * slider the use-case file gave it, disabled while the mechanic is off (feedback 09).
 */

export interface MechanicsMenuProps {
  readonly settings: Settings;
  readonly mechs: ToolbarWords['mechs'];
  readonly onSettings: (s: Settings) => void;
}

const MECHS: readonly Mechanic[] = ['rework', 'churn', 'complaints'];
const isStrength = (k: Mechanic): k is Strength => (STRENGTHS as readonly string[]).includes(k);

function MechField(p: MechanicsMenuProps & { k: Mechanic }) {
  const k = p.k,
    on = p.settings.mech[k],
    now = isStrength(k) ? { ...MECH_DEFAULTS(), ...p.settings.strength }[k] : 0;
  return (
    <SwitchField
      label={p.mechs[k].label}
      control={`settings.${k}`}
      tip={p.mechs[k].tip}
      on={on}
      onFlip={() => p.onSettings(withMech(p.settings, k))}
      value={isStrength(k) ? (l) => <Value labelId={l}>{now.toFixed(1)}</Value> : undefined}
    >
      {(l) =>
        isStrength(k) ? (
          <SliderControl
            labelId={l}
            control={`settings.${k}.strength`}
            min={MECH_RANGE[k][0]}
            max={MECH_RANGE[k][1]}
            step={0.1}
            value={now}
            disabled={!on}
            onChange={(n) => p.onSettings(withStrength(p.settings, k, n))}
          />
        ) : null
      }
    </SwitchField>
  );
}

export function MechanicsMenu(p: MechanicsMenuProps) {
  return MECHS.map((k) => <MechField key={k} {...p} k={k} />);
}
