export const notes = [
  {
    slug: 'windows-prerequisites',
    target: 'install',
    sources: [
      { slug: 'claude-setup', url: 'https://code.claude.com/docs/en/setup' },
      {
        slug: 'copilot-setup',
        url: 'https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli',
      },
      {
        slug: 'powershell',
        url: 'https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell-on-windows',
      },
      { slug: 'codex-install', url: 'https://github.com/openai/codex#installation' },
      { slug: 'antigravity-setup', url: 'https://antigravity.google/docs/getting-started' },
      {
        slug: 'codex-sandbox',
        url: 'https://github.com/openai/codex/blob/781d89b91e2487c3653208b9c13287e1a09f6f04/codex-rs/windows-sandbox-rs/src/setup.rs',
      },
    ],
  },
  {
    slug: 'corporate-network',
    target: 'install',
    sources: [
      { slug: 'claude-network', url: 'https://code.claude.com/docs/en/network-config' },
      {
        slug: 'copilot-network',
        url: 'https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/network-settings',
      },
      {
        slug: 'copilot-allowlist',
        url: 'https://docs.github.com/en/copilot/reference/copilot-allowlist-reference',
      },
      {
        slug: 'windows-policy',
        url: 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies',
      },
    ],
  },
] as const;
