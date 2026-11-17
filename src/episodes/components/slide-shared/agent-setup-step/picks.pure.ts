// decision: FE-001 §1
export interface PickOption {
  readonly id: string;
  readonly name: string;
}

export interface OperatingSystem extends PickOption {
  readonly pageLabel: string;
  readonly shell: string;
}

export interface StartScreen {
  readonly mark: string;
  readonly title: string;
  readonly lines: readonly string[];
}

export interface Agent extends PickOption {
  readonly installHref: string;
  readonly loginHref: string;
  readonly startScreen: StartScreen;
}

export const OPERATING_SYSTEMS: readonly OperatingSystem[] = [
  { id: 'mac', name: 'Mac', pageLabel: 'macOS', shell: 'Terminal' },
  { id: 'windows', name: 'Windows', pageLabel: 'Windows', shell: 'PowerShell' },
  { id: 'linux', name: 'Linux', pageLabel: 'Linux', shell: 'Terminal' },
];

export const AGENTS: readonly Agent[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    installHref: 'https://code.claude.com/docs/en/setup#install-claude-code',
    loginHref: 'https://code.claude.com/docs/en/authentication#log-in-to-claude-code',
    startScreen: { mark: '✻', title: 'Welcome to Claude Code!', lines: ['/help for help'] },
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    installHref: 'https://antigravity.google/docs/getting-started',
    loginHref: 'https://antigravity.google/docs/install',
    startScreen: { mark: '', title: 'Antigravity', lines: [] },
  },
  {
    id: 'codex',
    name: 'Codex',
    installHref: 'https://learn.chatgpt.com/docs/codex/cli',
    loginHref: 'https://learn.chatgpt.com/docs/auth',
    startScreen: {
      mark: '>_',
      title: 'OpenAI Codex',
      lines: ['To get started, describe a task or try one of these commands:'],
    },
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    installHref: 'https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli',
    loginHref: 'https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/authenticate-copilot-cli',
    startScreen: { mark: '', title: 'GitHub Copilot', lines: [] },
  },
];

export const DEFAULT_OS = 'mac';
export const DEFAULT_AGENT = 'claude-code';

/** The option a pick's value names; a value no option has reads as `fallback`, which must be one of `options`. */
export function pickOf<T extends PickOption>(options: readonly T[], value: string, fallback: string): T {
  const found = options.find((option) => option.id === value) ?? options.find((option) => option.id === fallback);
  if (found === undefined) throw new Error(`No pick option "${fallback}" to fall back to.`);
  return found;
}

export function casesOf<T extends PickOption, R>(options: readonly T[], draw: (option: T) => R): Record<string, R> {
  return Object.fromEntries(options.map((option) => [option.id, draw(option)]));
}
