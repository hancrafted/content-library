import { fillTemplate } from '@/shared/lib/template.pure';

/** The operating systems the page-wide OS pick names; the Slide hides its toggle but reads the pick. */
export const OSES = ['mac', 'windows', 'linux'] as const;
export type Os = (typeof OSES)[number];

/** The AI agents the page-wide AI-agent pick names, in toolbar order. */
export const AGENTS = ['claude-code', 'antigravity', 'codex', 'copilot'] as const;
export type Agent = (typeof AGENTS)[number];

/** Product names: the same in every locale. */
export const OS_NAMES: Readonly<Record<Os, string>> = { mac: 'Mac', windows: 'Windows', linux: 'Linux' };
export const AGENT_NAMES: Readonly<Record<Agent, string>> = {
  'claude-code': 'Claude Code',
  antigravity: 'Antigravity',
  codex: 'Codex',
  copilot: 'GitHub Copilot',
};

/** The defaults until the viewer picks: Mac, and Claude Code, the AI agent the Guide prefers. */
export const DEFAULT_OS: Os = 'mac';
export const DEFAULT_AGENT: Agent = 'claude-code';

/** The page pick read as an OS; anything else is the default. */
export function osOf(pick: string): Os {
  return (OSES as readonly string[]).includes(pick) ? (pick as Os) : DEFAULT_OS;
}

/** The page pick read as an AI agent; anything else is the default. */
export function agentOf(pick: string): Agent {
  return (AGENTS as readonly string[]).includes(pick) ? (pick as Agent) : DEFAULT_AGENT;
}

/* The command each OS opens a URL with in the default browser (Spec Option 7a build notes). */
const OPENERS: Readonly<Record<Os, string>> = { mac: 'open', windows: 'start', linux: 'xdg-open' };

/** The command the skill asks to run: open the homepage in the default browser. */
export function openCommand(os: Os, url: string): string {
  return `${OPENERS[os]} ${url}`;
}

/** The troubleshooting box's head: where the viewer is, as the prompt will say it. */
export function stuckContext(at: { os: Os; agent: Agent; step: string }): string {
  return [OS_NAMES[at.os], AGENT_NAMES[at.agent], at.step].join(' · ');
}

/**
 * The prompt the troubleshooting box copies: the Translation file's template with the OS, AI agent, step and the
 * viewer's pasted error filled in; an empty paste says so instead of leaving a gap.
 */
export function stuckPrompt(
  template: string,
  input: { os: Os; agent: Agent; step: string; error: string; empty: string },
): string {
  const error = input.error.trim();
  return fillTemplate(template, {
    os: OS_NAMES[input.os],
    agent: AGENT_NAMES[input.agent],
    step: input.step,
    error: error === '' ? input.empty : error,
  });
}
