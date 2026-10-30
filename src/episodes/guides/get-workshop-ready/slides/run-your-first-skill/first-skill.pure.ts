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
