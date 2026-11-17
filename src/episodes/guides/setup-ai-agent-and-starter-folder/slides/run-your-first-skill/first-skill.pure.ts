import type { Locale } from '@/shared/lib/locale.pure';

export const OSES = ['mac', 'windows', 'linux'] as const;
export type Os = (typeof OSES)[number];

export const AGENTS = ['claude-code', 'antigravity', 'codex', 'copilot'] as const;
export type Agent = (typeof AGENTS)[number];

export const AGENT_NAMES: Readonly<Record<Agent, string>> = {
  'claude-code': 'Claude Code',
  antigravity: 'Antigravity',
  codex: 'Codex',
  copilot: 'GitHub Copilot',
};

export const DEFAULT_OS: Os = 'mac';
export const DEFAULT_AGENT: Agent = 'claude-code';

export function osOf(pick: string): Os {
  return (OSES as readonly string[]).includes(pick) ? (pick as Os) : DEFAULT_OS;
}

export function agentOf(pick: string): Agent {
  return (AGENTS as readonly string[]).includes(pick) ? (pick as Agent) : DEFAULT_AGENT;
}

export function skillCommand(locale: Locale): string {
  return locale === 'de' ? '/hancrafted-check-setup de' : '/hancrafted-check-setup';
}

const OPENERS: Readonly<Record<Os, string>> = { mac: 'open', windows: 'start', linux: 'xdg-open' };

export function openCommand(os: Os, url: string): string {
  return `${OPENERS[os]} ${url}`;
}
