/** The Episode id of an Event's copy of `slug`: `<event-slug>__<slug>`. */
export function copyEntryId(eventSlug: string, slug: string): string {
  return `${eventSlug}__${slug}`;
}

const OPENERS = '[{';
const CLOSERS = ']}';

/** The offset of the `[` opening the `episodes` array. */
function arrayOpen(source: string): number {
  const open = source.search(/episodes:\s*\[/);
  if (open < 0) throw new Error('The Playlist file has no `episodes: [` array');
  return source.indexOf('[', open);
}

/** Whether, after `char`, the next non-blank character begins an entry: right after the `[` or a top-level comma. */
function expectsEntry(char: string, depth: number, was: boolean): boolean {
  return (was && /\s/.test(char)) || (depth === 1 && ',['.includes(char));
}

/** Start offset of each top-level entry of the `episodes: [...]` array, and the offset of its closing bracket. */
function episodesArray(source: string): { starts: number[]; close: number } {
  let depth = 0;
  let expectEntry = false;
  const starts: number[] = [];
  for (let i = arrayOpen(source); i < source.length; i++) {
    const char = source[i];
    if (depth === 1 && expectEntry && /[^\s\]]/.test(char)) starts.push(i);
    depth += Number(OPENERS.includes(char)) - Number(CLOSERS.includes(char));
    if (depth === 0) return { starts, close: i };
    expectEntry = expectsEntry(char, depth, expectEntry && starts.at(-1) !== i);
  }
  throw new Error('The Playlist file has an unclosed `episodes` array');
}

/** The 1-based position when it is a whole number from 1; otherwise a thrown refusal. */
function checkedPosition(position: number | undefined): number | undefined {
  const invalid = position !== undefined && (!Number.isInteger(position) || position < 1);
  if (invalid) throw new Error(`The position must be a whole number from 1, not ${position}`);
  return position;
}

/**
 * The Playlist file text with `id` listed as the entry at 1-based `position`, or last when none is given or the
 * position lies past the end. Each entry sits on its own line, as the files write them.
 */
export function insertPlaylistEntry(source: string, id: string, position?: number): string {
  const place = checkedPosition(position);
  if (source.includes(`'${id}'`)) throw new Error(`The Playlist already lists ${id}`);
  const { starts, close } = episodesArray(source);
  const indent = source.slice(source.lastIndexOf('\n', starts[0] ?? close) + 1, starts[0] ?? close).replace(/\S.*/, '');
  const before = place === undefined ? undefined : starts[place - 1];
  if (before === undefined) {
    const at = source.lastIndexOf('\n', close) + 1;
    return `${source.slice(0, at)}${indent || '    '}'${id}',\n${source.slice(at)}`;
  }
  return `${source.slice(0, before)}'${id}',\n${indent}${source.slice(before)}`;
}

/** The copy's `episode-metadata.ts`: published, unlisted and released on the Event's date. */
export function unlistedCopyMetadata(source: string, eventDate: string): string {
  let out = source
    .replace(/status: '[a-z]+'/, "status: 'published'")
    .replace(/visibility: '[a-z]+'/, "visibility: 'unlisted'");
  if (/publishedOn: '[^']*'/.test(out)) out = out.replace(/publishedOn: '[^']*'/, `publishedOn: '${eventDate}'`);
  else out = out.replace(/\n(\} as const)/, `\n  publishedOn: '${eventDate}',\n$1`);
  return out;
}
