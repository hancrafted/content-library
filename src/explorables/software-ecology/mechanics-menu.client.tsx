'use client';

import { useId } from 'react';
import { MECH_DEFAULTS, MECH_RANGE, STRENGTHS } from './factory-dials.pure.ts';
import { withMech, withStrength } from './factory-settings.pure.ts';
import { MenuSwitch } from './menu-switch';
import type { ModelWords, ToolbarWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { Mechanic, Settings, Strength } from './software-ecology.types';
import { ToolTip } from './toolbar-tip.client';

/*
 * The Settings popover's Mechanics column (feature guide, Interaction 3): what bad work does downstream. A switch per
 * mechanic, Rework, Churn and Complaints, each saying what it does in its tooltip, and under Rework and Churn the
 * strength the use-case file gave it. They left the toolbar in feedback 08.
 */

export interface MechanicsMenuProps {
  readonly settings: Settings;
  readonly mechs: ToolbarWords['mechs'];
  readonly tips: ModelWords['tips'];
  readonly onSettings: (s: Settings) => void;
}

const MECHS: readonly Mechanic[] = ['rework', 'churn', 'complaints'];
const isStrength = (k: Mechanic): k is Strength => (STRENGTHS as readonly string[]).includes(k);

function StrengthRow(p: MechanicsMenuProps & { k: Strength }) {
  const id = useId(),
    now = { ...MECH_DEFAULTS(), ...p.settings.strength }[p.k];
  return (
    <div className={styles.mrow}>
      <ToolTip tip={p.tips[p.k]}>
        <input
          type="range"
          className={styles.range}
          id={id}
          min={MECH_RANGE[p.k][0]}
          max={MECH_RANGE[p.k][1]}
          step={0.1}
          value={now}
          disabled={!p.settings.mech[p.k]}
          aria-label={p.mechs[p.k].label}
          onChange={(e) => p.onSettings(withStrength(p.settings, p.k, Number(e.target.value)))}
        />
      </ToolTip>
      <output htmlFor={id} className="font-semibold">
        {now.toFixed(1)}
      </output>
    </div>
  );
}

export function MechanicsMenu(p: MechanicsMenuProps) {
  return (
    <>
      {MECHS.map((k) => (
        <div key={k} className={styles.mechRow}>
          <MenuSwitch
            on={p.settings.mech[k]}
            onFlip={() => p.onSettings(withMech(p.settings, k))}
            title={p.mechs[k].label}
            tip={p.mechs[k].tip}
          />
          {isStrength(k) ? <StrengthRow {...p} k={k} /> : null}
        </div>
      ))}
    </>
  );
}
