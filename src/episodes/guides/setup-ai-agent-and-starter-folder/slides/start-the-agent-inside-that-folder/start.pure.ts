import { osOf, type AiAgent, type Os } from './picks.pure';

export const FOLDER = 'hancrafted-workshop-starter';

export const TRUST_PATH = {
  mac: '~/Downloads/hancrafted-workshop-starter',
  windows: 'C:\\Users\\han\\Downloads\\hancrafted-workshop-starter',
  linux: '~/Downloads/hancrafted-workshop-starter',
} as const;

export function openMenu(os: string): 'services' | 'short' | null {
  const menus = { mac: 'services', windows: 'short', linux: null } as const satisfies Record<Os, string | null>;
  return menus[osOf(os)];
}

export interface TerminalPrompt {
  readonly before: string;
  readonly folder: string;
  readonly after: string;
}

const PROMPTS: Readonly<Record<Os, TerminalPrompt>> = {
  mac: { before: 'han@MacBook ', folder: FOLDER, after: ' %' },
  windows: { before: 'PS C:\\Users\\han\\Downloads\\', folder: FOLDER, after: '>' },
  linux: { before: 'han@laptop:~/Downloads/', folder: FOLDER, after: '$' },
};

export function terminalPrompt(os: string): TerminalPrompt {
  return PROMPTS[osOf(os)];
}

/** Windows uses the actual copied path rather than assuming a Downloads location. */
export function fallbackCommand(os: string): string | null {
  return osOf(os) === 'windows' ? null : `cd Downloads/${FOLDER}`;
}

const COMMANDS: Readonly<Record<AiAgent, string>> = {
  'claude-code': 'claude',
  antigravity: 'agy',
  codex: 'codex',
  copilot: 'copilot',
};

export function startCommand(agent: AiAgent): string {
  return COMMANDS[agent];
}
