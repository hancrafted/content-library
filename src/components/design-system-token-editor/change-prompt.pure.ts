import type { Change } from './token-changes.pure';

function scopeLine(change: Change): string {
  const { scope } = change;
  if (scope.kind === 'global') {
    return 'Global tokens (the `:root` and `.dark` declarations in `src/app/globals.css`)';
  }
  const where = scope.episode
    ? `the Slide's token file, a CSS module under \`src/components/episodes/${scope.episode}/\``
    : "the Slide's token file, a CSS module in the Slide's folder";
  return `Slide \`${scope.id}\` (${where})`;
}

/** The prompt "Copy changed" puts on the clipboard: exactly the changed tokens, grouped by scope. */
export function formatChangePrompt(changes: readonly Change[]): string {
  if (changes.length === 0) return '';
  const groups = new Map<string, Change[]>();
  for (const change of changes) {
    const line = scopeLine(change);
    groups.set(line, [...(groups.get(line) ?? []), change]);
  }
  const body = [...groups].map(([line, items]) =>
    [`${line}:`, ...items.map((c) => `- \`${c.name}\` (${c.theme} theme): \`${c.from}\` -> \`${c.to}\``)].join('\n'),
  );
  return [
    'Adopt these design-token changes into the source, following docs/design-system/README.md.',
    'Change only the tokens listed, in the theme named, and keep the other theme as it is.',
    '',
    body.join('\n\n'),
  ].join('\n');
}
