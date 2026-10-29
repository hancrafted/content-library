/*
 * The options of a Guide's two toolbar picks (FE-001 §1, transient): the operating system and the AI agent. The
 * values are the ones every Slide of the page shares through `usePagePick`; names are product names, the same in
 * every locale. Each AI agent links its vendor's own install and login page, never a copied step (Visual language
 * "Official links"); the hrefs were checked against each vendor's page on 2026-10-29.
 */

/** One option of a toolbar pick: the value the page shares and the name the toolbar shows. */
export interface PickOption {
  readonly id: string;
  readonly name: string;
}

/** An operating system, and the word the vendors' install pages mark its steps with. */
export interface OperatingSystem extends PickOption {
  /** The label the vendors' pages put on this system's steps: "macOS", not "Mac". */
  readonly pageLabel: string;
  /** The terminal app a first-timer opens on it, the title of the drawn terminal window. */
  readonly shell: string;
}

/**
 * What an AI agent shows in the terminal when it starts, as its vendor's own text: the banner's mark and title, then
 * its lines. An agent whose vendor page quotes no start screen draws its name only, never invented lines.
 */
export interface StartScreen {
  /** The glyph before the title, as the agent draws it; empty when the vendor shows none. */
  readonly mark: string;
  readonly title: string;
  readonly lines: readonly string[];
}

/** An AI agent, its vendor's own pages, and its start screen. */
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

/** Claude Code first: the workshop is built around it; the other three work too. */
export const AGENTS: readonly Agent[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    installHref: 'https://code.claude.com/docs/en/setup#install-claude-code',
    loginHref: 'https://code.claude.com/docs/en/authentication#log-in-to-claude-code',
    // The Spec mock's own text: the vendor's docs name "the Claude Code welcome screen" but quote none of it.
    startScreen: { mark: '✻', title: 'Welcome to Claude Code!', lines: ['/help for help'] },
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    installHref: 'https://antigravity.google/docs/getting-started',
    loginHref: 'https://antigravity.google/docs/install',
    // The vendor's getting-started page describes the first run's setup choices but quotes no start screen.
    startScreen: { mark: '', title: 'Antigravity', lines: [] },
  },
  {
    id: 'codex',
    name: 'Codex',
    installHref: 'https://learn.chatgpt.com/docs/codex/cli',
    loginHref: 'https://learn.chatgpt.com/docs/auth',
    // The Codex CLI page's own start screen, without its model and folder lines, which differ on every laptop.
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
    // GitHub's pages show the welcome screen only as a screenshot, so its words are not quoted here.
    startScreen: { mark: '', title: 'GitHub Copilot', lines: [] },
  },
];

/** What a Slide reads until the viewer picks: the preferred AI agent, and the first system in the toolbar. */
export const DEFAULT_OS = 'mac';
export const DEFAULT_AGENT = 'claude-code';

/** The option a pick's value names; a value no option has reads as `fallback`, which must be one of `options`. */
export function pickOf<T extends PickOption>(options: readonly T[], value: string, fallback: string): T {
  const found = options.find((option) => option.id === value) ?? options.find((option) => option.id === fallback);
  if (found === undefined) throw new Error(`No pick option "${fallback}" to fall back to.`);
  return found;
}

/** One drawn case per option, keyed by its value: what a `PickSwitch` chooses from as the viewer picks. */
export function casesOf<T extends PickOption, R>(options: readonly T[], draw: (option: T) => R): Record<string, R> {
  return Object.fromEntries(options.map((option) => [option.id, draw(option)]));
}
