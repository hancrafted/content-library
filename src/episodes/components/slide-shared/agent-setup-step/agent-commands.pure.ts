import { AGENTS, OPERATING_SYSTEMS } from './picks.pure';

export type Shell = 'terminal' | 'powershell';

export interface InstallCommand {
  readonly text: string;
  readonly shell: Shell;
  readonly commandPrompt?: string;
}

const UNIX = (text: string): InstallCommand => ({ text, shell: 'terminal' });

const INSTALL: Readonly<Record<string, Readonly<Record<string, InstallCommand>>>> = {
  'claude-code': {
    mac: UNIX('curl -fsSL https://claude.ai/install.sh | bash'),
    linux: UNIX('curl -fsSL https://claude.ai/install.sh | bash'),
    windows: {
      text: 'irm https://claude.ai/install.ps1 | iex',
      shell: 'powershell',
      commandPrompt: 'curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd',
    },
  },
  antigravity: {
    mac: UNIX('curl -fsSL https://antigravity.google/cli/install.sh | bash'),
    linux: UNIX('curl -fsSL https://antigravity.google/cli/install.sh | bash'),
    windows: {
      text: 'irm https://antigravity.google/cli/install.ps1 | iex',
      shell: 'powershell',
      commandPrompt:
        'curl -fsSL https://antigravity.google/cli/install.cmd -o install.cmd && install.cmd && del install.cmd',
    },
  },
  codex: {
    mac: UNIX('curl -fsSL https://chatgpt.com/codex/install.sh | sh'),
    linux: UNIX('curl -fsSL https://chatgpt.com/codex/install.sh | sh'),
    windows: {
      text: 'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"',
      shell: 'powershell',
    },
  },
  copilot: {
    mac: UNIX('curl -fsSL https://gh.io/copilot-install | bash'),
    linux: UNIX('curl -fsSL https://gh.io/copilot-install | bash'),
    windows: { text: 'winget install GitHub.Copilot', shell: 'powershell' },
  },
};

const DOCS: Readonly<Record<string, string>> = {
  'claude-code': 'https://code.claude.com/docs/en/setup#install-claude-code',
  antigravity: 'https://antigravity.google/docs/getting-started?tab=cli',
  codex: 'https://learn.chatgpt.com/docs/codex/cli',
  copilot:
    'https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli#installing-with-the-install-script-macos-and-linux',
};

export interface LaunchCommand {
  readonly text: string;
  readonly inside?: string;
}

const LAUNCH: Readonly<Record<string, LaunchCommand>> = {
  'claude-code': { text: 'claude' },
  antigravity: { text: 'agy' },
  codex: { text: 'codex' },
  copilot: { text: 'copilot', inside: '/login' },
};

function lookup<T>(table: Readonly<Record<string, T>>, id: string, what: string): T {
  const found = table[id];
  if (found === undefined) throw new Error(`No ${what} for "${id}".`);
  return found;
}

export function installCommand(agent: string, os: string): InstallCommand {
  return lookup(lookup(INSTALL, agent, 'install lines'), os, `install line for ${agent} on`);
}

export function docsHref(agent: string): string {
  return lookup(DOCS, agent, 'docs link');
}

export function launchCommand(agent: string): LaunchCommand {
  return lookup(LAUNCH, agent, 'launch command');
}

export const PAIRS = AGENTS.flatMap((agent) => OPERATING_SYSTEMS.map((os) => ({ agent: agent.id, os: os.id })));
