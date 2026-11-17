/*
 * The Guide's two page-wide picks as this Slide reads them. A copy of the same file in the Section's other step
 * Slide: a Slide folder imports no other, so copies drift until promoted.
 */

export const OPERATING_SYSTEMS = ['mac', 'windows', 'linux'] as const;
export const AI_AGENTS = ['claude-code', 'antigravity', 'codex', 'copilot'] as const;

export type Os = (typeof OPERATING_SYSTEMS)[number];
export type AiAgent = (typeof AI_AGENTS)[number];

function isOneOf<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

export function osOf(pick: string): Os {
  return isOneOf(OPERATING_SYSTEMS, pick) ? pick : 'mac';
}

export function agentOf(pick: string): AiAgent {
  return isOneOf(AI_AGENTS, pick) ? pick : 'claude-code';
}
