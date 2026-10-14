import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

// design-ADR 0006: agentskills.io requires a skill's name to match its folder.
// markdown-harness cannot compare a field with a path, so this test does.
const SKILLS = __dirname;
const folders = readdirSync(SKILLS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map(({ name }) => name);

describe('authored skills', () => {
  it.each(folders)('%s names itself after its folder', (folder) => {
    const text = readFileSync(path.join(SKILLS, folder, 'SKILL.md'), 'utf8');
    const frontmatter = parse(text.split(/^---$/m)[1] ?? '') as { name?: unknown };
    expect(frontmatter.name).toBe(folder);
  });
});
