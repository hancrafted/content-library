export type Trust = 1 | 2 | 3;

export type Level = 'in' | 'on' | 'out';

export interface TrustState {
  readonly needed: Trust;
  readonly earned: Trust;
}

export function trustLevel({ needed, earned }: TrustState): Level {
  if (earned < needed) return 'in';
  return needed === 1 ? 'out' : 'on';
}
