export const notes = [
  {
    slug: 'windows-folder',
    target: 'folder',
    sources: [
      {
        slug: 'explorer-shell',
        url: 'https://devblogs.microsoft.com/commandline/rumors-of-cmds-death-have-been-greatly-exaggerated/',
      },
      { slug: 'terminal', url: 'https://learn.microsoft.com/en-us/windows/terminal/install' },
      {
        slug: 'location',
        url: 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-location',
      },
      {
        slug: 'content',
        url: 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-content',
      },
      {
        slug: 'set-location',
        url: 'https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/set-location',
      },
      {
        slug: 'windows-menu',
        url: 'https://blogs.windows.com/windows-insider/2016/11/17/announcing-windows-10-insider-preview-build-14971-for-pc/',
      },
    ],
  },
  {
    slug: 'agent-working-folder',
    target: 'folder',
    sources: [
      { slug: 'claude-quickstart', url: 'https://code.claude.com/docs/en/quickstart' },
      { slug: 'antigravity-start', url: 'https://antigravity.google/docs/getting-started' },
    ],
  },
] as const;
