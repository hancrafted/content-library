export const TOOLS = [
  { key: 'archgate', pkg: 'archgate', url: 'https://github.com/archgate/cli' },
  {
    key: 'markdown-harness',
    pkg: '@hancrafted/markdown-harness',
    url: 'https://github.com/hancrafted/markdown-harness',
  },
  { key: 'mattpocock-skills', skills: 'mattpocock/skills', url: 'https://github.com/mattpocock/skills' },
  { key: 'oxlint', pkg: 'oxlint', url: 'https://github.com/oxc-project/oxc' },
  { key: 'vitest', pkg: 'vitest', url: 'https://github.com/vitest-dev/vitest' },
  { key: 'dependency-cruiser', pkg: 'dependency-cruiser', url: 'https://github.com/sverweij/dependency-cruiser' },
  { key: 'knip', pkg: 'knip', url: 'https://github.com/webpro-nl/knip' },
  { key: 'husky', pkg: 'husky', url: 'https://github.com/typicode/husky' },
  { key: 'playwright', pkg: '@playwright/test', url: 'https://github.com/microsoft/playwright' },
  { key: 'next', pkg: 'next', url: 'https://github.com/vercel/next.js' },
] as const;

export function githubUrlOf(repository: unknown): string {
  const raw =
    typeof repository === 'string'
      ? repository
      : typeof repository === 'object' && repository !== null && 'url' in repository
        ? String(repository.url)
        : '';
  const shorthand = /^[\w.-]+\/[\w.-]+$/.test(raw) ? `https://github.com/${raw}` : raw;
  const url = shorthand.replace(/^git\+/, '').replace(/\.git$/, '');
  if (!url.startsWith('https://github.com/')) throw new Error(`Not a GitHub repository: ${JSON.stringify(repository)}`);
  return url;
}
