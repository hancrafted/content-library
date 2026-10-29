import { fillTemplate } from '@/shared/lib/template.pure';

/*
 * The Guide's two page-wide picks as this Slide reads them, and the troubleshooting prompt it copies. A copy of the
 * same file in the Section's other step Slide: a Slide folder imports no other, so copies drift until promoted.
 */

export const OPERATING_SYSTEMS = ['mac', 'windows', 'linux'] as const;
export const AI_AGENTS = ['claude-code', 'antigravity', 'codex', 'copilot'] as const;

export type Os = (typeof OPERATING_SYSTEMS)[number];
export type AiAgent = (typeof AI_AGENTS)[number];

/** The words the prompt names each pick by, in the viewer's language. */
export interface PickNames {
  readonly os: Readonly<Record<Os, string>>;
  readonly agent: Readonly<Record<AiAgent, string>>;
}

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

/** What the troubleshooting box knows when the viewer copies: the picks, the step and their pasted error. */
export interface StuckInput {
  readonly os: string;
  readonly agent: string;
  readonly step: string;
  readonly error: string;
  /** Said in place of the error when the paste area is blank. */
  readonly noError: string;
}

/**
 * The prompt the "Copy prompt" pill copies: the Translation file's template with `{os}`, `{agent}`, `{step}` and
 * `{error}` filled, the picks by their names, the error trimmed at its ends.
 */
export function stuckPrompt(template: string, names: PickNames, input: StuckInput): string {
  const error = input.error.trim();
  return fillTemplate(template, {
    os: names.os[osOf(input.os)],
    agent: names.agent[agentOf(input.agent)],
    step: input.step,
    error: error === '' ? input.noError : error,
  });
}
