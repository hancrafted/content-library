/*
 * The choices a first-timer meets when their AI agent asks how to sign in, in the order the vendor shows them, and
 * which one fits most people. `label` is the vendor's own on-screen text (same in every locale, from its official
 * source, read 2026-10-30); an option without one is described in words by the Slide, because its label is not
 * published. The explanations are the Slide's own copy, keyed by `id`.
 */

/** One sign-in choice. */
export interface SignInOption {
  readonly id: string;
  /** The vendor's on-screen label, verbatim; absent when the vendor does not publish it. */
  readonly label?: string;
  /** The one to pick for most people: the Slide marks it "Pick this". */
  readonly recommended: boolean;
}

const OPTIONS: Readonly<Record<string, readonly SignInOption[]>> = {
  // Read from openai/codex main (codex-rs/tui/src/onboarding/auth.rs); the released build may word it slightly differently.
  codex: [
    { id: 'chatgpt', label: 'Sign in with ChatGPT', recommended: true },
    { id: 'device-code', label: 'Sign in with Device Code', recommended: false },
    { id: 'other', label: 'Sign in another way', recommended: false },
  ],
  // Needs human: Claude Code's docs name the account types but not the menu labels; the Slide describes them in words.
  'claude-code': [
    { id: 'account', recommended: true },
    { id: 'console', recommended: false },
    { id: 'platform', recommended: false },
  ],
  // GitHub's authenticate page quotes both questions; whether another sign-in choice exists besides the device code is unverified.
  copilot: [
    { id: 'github-com', label: 'GitHub.com', recommended: true },
    { id: 'enterprise', label: 'GitHub Enterprise Cloud with data residency', recommended: false },
    { id: 'device-code', label: 'Sign in with a device code', recommended: true },
  ],
  // Needs human: the docs name a personal Google Account and "Business account"; the order of the screens is unverified.
  antigravity: [
    { id: 'personal', recommended: true },
    { id: 'business', label: 'Business account', recommended: false },
  ],
};

/** The sign-in choices of an AI agent, in the vendor's order; an unknown agent throws, so a gap fails a test. */
export function signInOptions(agent: string): readonly SignInOption[] {
  const found = OPTIONS[agent];
  if (found === undefined) throw new Error(`No sign-in options for "${agent}".`);
  return found;
}
