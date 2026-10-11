/**
 * The zone a context window is in as it fills, for the fullness gauge.
 */

export interface ContextGaugeState {
  readonly zone: 'safe' | 'warning' | 'danger';
  readonly label: string;
  readonly toneClass: string;
}

export function evaluateContextGauge(percent: number): ContextGaugeState {
  if (percent <= 50) {
    return {
      zone: 'safe',
      label: 'Smart zone · High reasoning accuracy',
      toneClass: 'text-emerald-500 border-emerald-500/40 bg-emerald-500/10',
    };
  }
  if (percent <= 75) {
    return {
      zone: 'warning',
      label: 'Degrading zone · Instruction drift begins',
      toneClass: 'text-amber-500 border-amber-500/40 bg-amber-500/10',
    };
  }
  return {
    zone: 'danger',
    label: 'Danger zone · Running on fumes',
    toneClass: 'text-rose-500 border-rose-500/40 bg-rose-500/10',
  };
}
