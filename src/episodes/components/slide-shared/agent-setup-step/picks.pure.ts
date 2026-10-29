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

/** An AI agent, and its vendor's own pages. */
export interface Agent extends PickOption {
  readonly installHref: string;
  readonly loginHref: string;
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
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    installHref: 'https://antigravity.google/docs/getting-started',
    loginHref: 'https://antigravity.google/docs/install',
  },
  {
    id: 'codex',
    name: 'Codex',
    installHref: 'https://learn.chatgpt.com/docs/codex/cli',
    loginHref: 'https://learn.chatgpt.com/docs/auth',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    installHref: 'https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli',
    loginHref: 'https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/authenticate-copilot-cli',
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
