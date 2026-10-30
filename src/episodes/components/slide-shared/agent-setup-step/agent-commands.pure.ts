import { AGENTS, OPERATING_SYSTEMS } from './picks.pure';

/*
 * The exact lines a first-timer types, per AI agent and operating system: the install command (the first thing typed
 * in the terminal) and the launch command (the second). Pure data, the same in every locale. Each line is the vendor's
 * own, from its official page (fetched 2026-10-30) or given by Han; a line the page does not confirm carries a
 * `Needs human:` comment. A command can go stale, which is why every AI agent also links its official docs.
 */

/** The shell a line is typed in: it decides how the Slide tells a first-timer which window they are in. */
export type Shell = 'terminal' | 'powershell';

/** One line to type, and the alternative for a Windows window that is Command Prompt, not PowerShell. */
export interface InstallCommand {
  readonly text: string;
  readonly shell: Shell;
  /** The same install for Command Prompt, when the vendor's page has one. */
  readonly commandPrompt?: string;
}

const UNIX = (text: string): InstallCommand => ({ text, shell: 'terminal' });

/** Install lines by AI agent id, then operating system id. macOS and Linux share the vendor's script. */
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
    windows: { text: 'irm https://antigravity.google/cli/install.ps1 | iex', shell: 'powershell' },
  },
  codex: {
    mac: UNIX('curl -fsSL https://chatgpt.com/codex/install.sh | sh'),
    linux: UNIX('curl -fsSL https://chatgpt.com/codex/install.sh | sh'),
    // Needs human: the Windows tab of the Codex page was not readable when fetched; this line is Han's.
    windows: {
      text: 'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"',
      shell: 'powershell',
    },
  },
  copilot: {
    mac: UNIX('curl -fsSL https://gh.io/copilot-install | bash'),
    linux: UNIX('curl -fsSL https://gh.io/copilot-install | bash'),
    // Needs human: GitHub's page names winget for Windows; Han gave no Windows line. Confirm it works on a clean PC.
    windows: { text: 'winget install GitHub.Copilot', shell: 'powershell' },
  },
};

/** Each AI agent's official install page, which opens whichever line the Slide shows: the vendor's page wins. */
const DOCS: Readonly<Record<string, string>> = {
  'claude-code': 'https://code.claude.com/docs/en/setup#install-claude-code',
  antigravity: 'https://antigravity.google/docs/getting-started?tab=cli',
  codex: 'https://learn.chatgpt.com/docs/codex/cli',
  copilot:
    'https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli#installing-with-the-install-script-macos-and-linux',
};

/** What a launch takes: the command that starts the AI agent, and a line typed inside it to sign in, if any. */
export interface LaunchCommand {
  readonly text: string;
  /** Typed inside the AI agent after it starts; GitHub Copilot signs in with `/login`. */
  readonly inside?: string;
}

const LAUNCH: Readonly<Record<string, LaunchCommand>> = {
  'claude-code': { text: 'claude' },
  // Needs human: the Antigravity pages quote `agy` as the binary but no "Authenticate" page names it as a first run.
  antigravity: { text: 'agy' },
  // Needs human: the Codex page says to sign in on first run; browser or device-code flow is not documented.
  codex: { text: 'codex' },
  // Needs human: GitHub's page says an unsigned `copilot` prompts for `/login`; browser or device-code is not stated.
  copilot: { text: 'copilot', inside: '/login' },
};

function lookup<T>(table: Readonly<Record<string, T>>, id: string, what: string): T {
  const found = table[id];
  if (found === undefined) throw new Error(`No ${what} for "${id}".`);
  return found;
}

/** The install line for an AI agent on an operating system; an unknown pair throws, so a gap fails a test. */
export function installCommand(agent: string, os: string): InstallCommand {
  return lookup(lookup(INSTALL, agent, 'install lines'), os, `install line for ${agent} on`);
}

/** The AI agent's official install page. */
export function docsHref(agent: string): string {
  return lookup(DOCS, agent, 'docs link');
}

/** The command that starts the AI agent, its second command after the install. */
export function launchCommand(agent: string): LaunchCommand {
  return lookup(LAUNCH, agent, 'launch command');
}

/** Every AI agent x operating system pair the Slides can show, for the test that none has a gap. */
export const PAIRS = AGENTS.flatMap((agent) => OPERATING_SYSTEMS.map((os) => ({ agent: agent.id, os: os.id })));
