/**
 * Which model wins outcome per euro at a given quality threshold.
 */

export interface ThresholdVerdict {
  readonly winner: 'cheap' | 'premium';
  readonly verdict: string;
}

export function evaluateThreshold(threshold: number): ThresholdVerdict {
  if (threshold <= 95) {
    return {
      winner: 'cheap',
      verdict: 'Outcome per euro winner: 95% quality threshold satisfied at 5% of frontier cost.',
    };
  }
  return {
    winner: 'premium',
    verdict: 'Quality gate demands frontier model: Rigorous threshold requires premium reasoning.',
  };
}
