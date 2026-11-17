export interface SignInOption {
  readonly id: string;
  readonly label?: string;
  readonly recommended: boolean;
}

const OPTIONS: Readonly<Record<string, readonly SignInOption[]>> = {
  codex: [
    { id: 'chatgpt', label: 'Sign in with ChatGPT', recommended: true },
    { id: 'device-code', label: 'Sign in with Device Code', recommended: false },
    { id: 'other', label: 'Sign in another way', recommended: false },
  ],
  'claude-code': [
    { id: 'account', recommended: true },
    { id: 'console', recommended: false },
    { id: 'platform', recommended: false },
  ],
  copilot: [
    { id: 'github-com', label: 'GitHub.com', recommended: true },
    { id: 'enterprise', label: 'GitHub Enterprise Cloud with data residency', recommended: false },
    { id: 'device-code', label: 'Sign in with a device code', recommended: true },
  ],
  antigravity: [
    { id: 'personal', recommended: true },
    { id: 'business', label: 'Business account', recommended: false },
  ],
};

export function signInOptions(agent: string): readonly SignInOption[] {
  const found = OPTIONS[agent];
  if (found === undefined) throw new Error(`No sign-in options for "${agent}".`);
  return found;
}
