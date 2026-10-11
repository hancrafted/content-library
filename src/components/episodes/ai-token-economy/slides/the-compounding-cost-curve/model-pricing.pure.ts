/**
 * The three model tiers and what one fix costs on each, for the compounding cost curve.
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
