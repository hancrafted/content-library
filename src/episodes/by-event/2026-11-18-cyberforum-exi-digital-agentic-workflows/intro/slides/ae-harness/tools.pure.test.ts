import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { githubUrlOf, TOOLS } from './tools.pure';

const ROOT = path.resolve(import.meta.dirname, '../../../../../../..');

function repositoryOf(pkg: string): unknown {
  const manifest = JSON.parse(readFileSync(path.join(ROOT, 'node_modules', pkg, 'package.json'), 'utf8')) as {
    repository?: unknown;
  };
  return manifest.repository;
}

const SKILL_SOURCES = new Set(
  Object.values(
    (
      JSON.parse(readFileSync(path.join(ROOT, 'skills-lock.json'), 'utf8')) as {
        skills: Record<string, { source: string }>;
      }
    ).skills,
  ).map(({ source }) => source),
);

describe('success cases', () => {
  it.each(TOOLS.filter((tool) => 'pkg' in tool))('links $key to the repository its package declares', (tool) => {
    // ARRANGE
    const expected = githubUrlOf(repositoryOf((tool as { pkg: string }).pkg));
    // ACT
    const url = tool.url;
    // ASSERT
    expect(url).toBe(expected);
  });

  it.each(TOOLS.filter((tool) => 'skills' in tool))('links $key to a skills source in skills-lock.json', (tool) => {
    // ARRANGE
    const source = (tool as { skills: string }).skills;
    // ACT
    const locked = SKILL_SOURCES.has(source);
    // ASSERT
    expect(locked).toBe(true);
    expect(tool.url).toBe(`https://github.com/${source}`);
  });
});

describe('failure cases', () => {
  it('refuses a repository that is not on GitHub', () => {
    // ARRANGE
    const repository = 'https://gitlab.com/owner/repo';
    // ACT
    const read = () => githubUrlOf(repository);
    // ASSERT
    expect(read).toThrow();
  });
});

describe('edge cases', () => {
  it.each([
    ['git+https://github.com/archgate/cli.git', 'https://github.com/archgate/cli'],
    ['vercel/next.js', 'https://github.com/vercel/next.js'],
    [{ type: 'git', url: 'git+https://github.com/oxc-project/oxc' }, 'https://github.com/oxc-project/oxc'],
  ])('reads %j as %s', (repository, expected) => {
    // ARRANGE
    const input: unknown = repository;
    // ACT
    const url = githubUrlOf(input);
    // ASSERT
    expect(url).toBe(expected);
  });
});
