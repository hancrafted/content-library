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

/** The page's OS pick as one this Slide draws; anything else reads as the page default, Mac. */
export function osOf(pick: string): Os {
  return isOneOf(OPERATING_SYSTEMS, pick) ? pick : 'mac';
}

/** The page's AI-agent pick as one this Slide draws; anything else reads as the page default, Claude Code. */
export function agentOf(pick: string): AiAgent {
  return isOneOf(AI_AGENTS, pick) ? pick : 'claude-code';
}
