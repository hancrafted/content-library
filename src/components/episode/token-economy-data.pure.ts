/**
 * Pure models, tokenization heuristics, and pricing formulas for the AI Token Economy episode.
 */

export interface ModelPricing {
  readonly name: string;
  readonly provider: string;
  readonly costPerFix: number;
  readonly badgeClass: string;
}

export const MODEL_PRICINGS: readonly ModelPricing[] = [
  {
    name: 'DeepSeek V4 Pro',
    provider: 'DeepSeek',
    costPerFix: 0.1126,
    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
  },
  {
    name: 'Claude Sonnet 5',
    provider: 'Anthropic',
    costPerFix: 0.62,
    badgeClass: 'border-sky-500/40 bg-sky-500/10 text-sky-500',
  },
  {
    name: 'Claude Opus 4.8',
    provider: 'Anthropic',
    costPerFix: 1.5403,
    badgeClass: 'border-rose-500/40 bg-rose-500/10 text-rose-500',
  },
];

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

export function tokenizeText(text: string): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  for (const word of words) {
    const parts = word.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]/gu) ?? [word];
    for (const part of parts) {
      if (part.length <= 4) {
        tokens.push(part);
      } else {
        const chunks = part.match(/.{1,4}/g) ?? [part];
        tokens.push(...chunks);
      }
    }
  }
  return tokens;
}

export function calcSessionCost(tokenCount: number, turns = 50, ratePerMillion = 5): number {
  return (tokenCount * turns * ratePerMillion) / 1_000_000;
}
