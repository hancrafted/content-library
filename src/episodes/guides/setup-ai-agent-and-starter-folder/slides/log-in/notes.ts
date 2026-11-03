export const notes = [
  {
    slug: 'approved-account-and-path',
    target: 'login',
    sources: [
      { slug: 'claude-path', url: 'https://code.claude.com/docs/en/terminal-guide' },
      {
        slug: 'copilot-access',
        url: 'https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli',
      },
      {
        slug: 'codex-access',
        url: 'https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan',
      },
      { slug: 'google-enterprise', url: 'https://antigravity.google/docs/enterprise' },
    ],
  },
] as const;
