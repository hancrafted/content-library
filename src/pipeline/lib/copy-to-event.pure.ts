export function copyEntryId(eventSlug: string, slug: string): string {
  return `${eventSlug}__${slug}`;
}

const OPENERS = '[{';
const CLOSERS = ']}';

function arrayOpen(source: string): number {
  const open = source.search(/episodes:\s*\[/);
  if (open < 0) throw new Error('The Playlist file has no `episodes: [` array');
  return source.indexOf('[', open);
}

function expectsEntry(char: string, depth: number, was: boolean): boolean {
  return (was && /\s/.test(char)) || (depth === 1 && ',['.includes(char));
}

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

function checkedPosition(position: number | undefined): number | undefined {
  const invalid = position !== undefined && (!Number.isInteger(position) || position < 1);
  if (invalid) throw new Error(`The position must be a whole number from 1, not ${position}`);
  return position;
}

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

export function instanceMetadata(source: string, eventDate: string): string {
  let out = source
    .replace(/status: '[a-z]+'/, "status: 'published'")
    .replace(/visibility: '[a-z]+'/, "visibility: 'unlisted'")
    .replace(/\n\s*youtube: \{[^}]*\},?/, '');
  if (/publishedOn: '[^']*'/.test(out)) out = out.replace(/publishedOn: '[^']*'/, `publishedOn: '${eventDate}'`);
  else out = out.replace(/\n(\} as const)/, `\n  publishedOn: '${eventDate}',\n$1`);
  return out;
}

const camel = (slug: string): string => slug.replace(/-([a-z0-9])/g, (_, next: string) => next.toUpperCase());

export function instanceExportName(eventSlug: string, slug: string): string {
  const [event = ''] = eventSlug.replace(/^\d{4}-\d{2}-\d{2}-/, '').split('-');
  const own = camel(slug);
  return `${camel(event)}${own.charAt(0).toUpperCase()}${own.slice(1)}`;
}

export function baseExportName(episodeSource: string): string {
  const names = [...episodeSource.matchAll(/export const (\w+)\s*=\s*(?:episode|instanceOf)\(/g)].map(
    ([, name]) => name,
  );
  if (names.length !== 1)
    throw new Error(`The Base Episode must export exactly one Episode record; found ${names.length}`);
  return names[0] ?? '';
}

export function instanceEpisodeSource(base: { slug: string; exportName: string }, exportName: string): string {
  return [
    `import { ${base.exportName} } from '@/episodes/${base.slug}/episode';`,
    "import { instanceOf } from '@/episodes/lib/episode-instance';",
    '',
    '// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md',
    `export const ${exportName} = instanceOf(${base.exportName}, {});`,
    '',
  ].join('\n');
}

export const INSTANCE_CHECKS_TEST = `import { episodeChecks } from '@/episodes/lib/episode-checks';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// decision: ARCH-003 §4.7
const PAGE = import.meta.glob('./episode.ts');
const CHECKS = episodeChecks(import.meta.dirname, {}, PAGE);

describe('success cases', () => {
  it.each(CHECKS.folder)('$name', async ({ findings }) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const found = await findings();
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads the composition, so a folder checked without its episode.ts fails', () => {
    // ARRANGE
    const composition = './episode.ts';
    // ACT
    const files = Object.keys(PAGE);
    // ASSERT
    expect(files).toContain(composition);
  });
});

describe('edge cases', () => {
  it('keeps no Slide or Section folder: an Episode instance composes its Base Episode', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const own = ['slides', 'sections'].filter((folder) => existsSync(path.join(import.meta.dirname, folder)));
    // ASSERT
    expect(own).toEqual(expected);
  });
});
`;
