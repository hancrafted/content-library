import { osOf, type AiAgent, type Os } from './picks.pure';

/*
 * What step 3 draws per pick. The folder name is the starter folder's; the user name `han` and the machine names are
 * the drawing's, as the Spec's mock shows them.
 */

export const FOLDER = 'hancrafted-workshop-starter';

export const TRUST_PATH = {
  mac: '~/Downloads/hancrafted-workshop-starter',
  windows: 'C:\\Users\\han\\Downloads\\hancrafted-workshop-starter',
  linux: '~/Downloads/hancrafted-workshop-starter',
} as const;

/** Which folder menu move 1 draws: Mac's with its Services submenu, Windows 11's short menu, none on Linux. */
export function openMenu(os: string): 'services' | 'short' | null {
  const menus = { mac: 'services', windows: 'short', linux: null } as const satisfies Record<Os, string | null>;
  return menus[osOf(os)];
}

/** A terminal prompt split around the folder name, which the drawing highlights. */
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

/** The prompt a terminal opened in the starter folder shows on the picked OS. */
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

/** The documented CLI command that starts the selected AI agent. */
export function startCommand(agent: AiAgent): string {
  return COMMANDS[agent];
}
