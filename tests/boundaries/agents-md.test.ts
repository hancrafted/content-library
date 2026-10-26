// Pins agent navigation (spec #348, #358): every top-level folder of `src/` but the routes and the site Translation
// files, and `tools/`, carries a pointer-only `AGENTS.md` with a `CLAUDE.md` symlink beside it. Every pointer it holds
// must resolve: a path in backticks exists, an ADR id names an ADR, an ADR section names a heading of that ADR, and a
// dependency-cruiser rule name in backticks names a rule. A stale pointer fails here, not in an agent's session.

import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const config = createRequire(import.meta.url)('../../.dependency-cruiser.cjs') as {
  forbidden: { name: string }[];
  required: { name: string }[];
};
const RULE_NAMES = new Set([...config.forbidden, ...config.required].map(({ name }) => name));
const ADRS = '.archgate/adrs';
const ADR_FILES = readdirSync(ADRS).filter((file) => file.endsWith('.md'));

/** The routes are the framework zone, not an area. */
const NOT_AN_AREA = new Set(['app']);
const HOMES = [
  ...readdirSync('src', { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !NOT_AN_AREA.has(entry.name))
    .map(({ name }) => `src/${name}`),
  'tools',
];

/** A path in backticks (it holds a `/`) that does not exist, or a rule name in backticks that names no rule. */
function brokenQuoted(text: string, exists: (path: string) => boolean): string[] {
  return [...text.matchAll(/`([^`\s]+)`/g)].flatMap(([, token]) => {
    if (token.includes('/')) return exists(token.replace(/\/$/, '')) ? [] : [`path: ${token}`];
    return /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(token) && !RULE_NAMES.has(token) ? [`rule: ${token}`] : [];
  });
}

/** The ADR file an id names, if any. */
const adrFile = (id: string) => ADR_FILES.find((file) => file.startsWith(`${id}-`));

/** An ADR id that names no ADR. */
function brokenAdrIds(text: string): string[] {
  return [...text.matchAll(/\b([A-Z]{2,4}-\d{3})\b/g)].flatMap(([, id]) => (adrFile(id) ? [] : [`adr: ${id}`]));
}

/** An ADR section, `FE-007-module-layering §2 "Import direction" and §5 "…"`, that names no heading of that ADR. */
function brokenSections(text: string): string[] {
  return [...text.matchAll(/\b([A-Z]{2,4}-\d{3})[\w-]*((?:,? (?:and )?§\d+ "[^"]+")+)/g)].flatMap(
    ([, id, sections]) => {
      const file = adrFile(id);
      const adr = file === undefined ? '' : readFileSync(join(ADRS, file), 'utf8');
      return [...sections.matchAll(/§(\d+) "([^"]+)"/g)]
        .filter(([, section, title]) => !adr.includes(`\n### ${section}. ${title}\n`))
        .map(([pointer]) => `section: ${id} ${pointer}`);
    },
  );
}

/** Every pointer in one `AGENTS.md` that does not resolve, as `<kind>: <pointer>`. */
function brokenPointers(text: string, exists: (path: string) => boolean): string[] {
  return [...brokenQuoted(text, exists), ...brokenAdrIds(text), ...brokenSections(text)];
}

describe('success cases', () => {
  it('gives every area, page assembly, the store, shared and tools an AGENTS.md with a CLAUDE.md symlink to it', () => {
    // ARRANGE
    const expected = HOMES.map((home) => ({ home, agents: true, claude: 'AGENTS.md' }));
    // ACT
    const found = HOMES.map((home) => {
      const claude = join(home, 'CLAUDE.md');
      return {
        home,
        agents: existsSync(join(home, 'AGENTS.md')),
        claude: existsSync(claude) && lstatSync(claude).isSymbolicLink() ? readlinkSync(claude) : 'missing',
      };
    });
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('resolves every path, ADR id, ADR section and rule name each AGENTS.md names', () => {
    // ARRANGE
    const homes = HOMES.filter((home) => existsSync(join(home, 'AGENTS.md')));
    // ACT
    const broken = homes.flatMap((home) =>
      brokenPointers(readFileSync(join(home, 'AGENTS.md'), 'utf8'), existsSync).map((line) => `${home}: ${line}`),
    );
    // ASSERT
    expect(broken).toEqual([]);
  });
});

describe('failure cases', () => {
  it('reports a missing path, an unknown ADR id, a section the ADR lacks and an unknown rule name', () => {
    // ARRANGE
    const text = [
      'Imports: FE-007-module-layering §2 "Import direction" and §9 "No such section"; rules `no-such-rule`.',
      'Governed by XX-999. Code in `src/no-such-folder/`.',
    ].join('\n');
    const expected = [
      'rule: no-such-rule',
      'path: src/no-such-folder/',
      'adr: XX-999',
      'section: FE-007 §9 "No such section"',
    ];
    // ACT
    const found = brokenPointers(text, existsSync);
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('accepts a pointer to an existing section, rule and folder, with or without its trailing slash', () => {
    // ARRANGE
    const text =
      'FE-007-module-layering §2 "Import direction": `areas-never-import-each-other`, `src/events/`, `tools`.';
    // ACT
    const found = brokenPointers(text, existsSync);
    // ASSERT
    expect(found).toEqual([]);
  });
});
