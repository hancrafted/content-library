import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readBinding } from './binding.pure.ts';
import { parseConfig } from './config.pure.ts';
import { detectSkills, setup } from './setup.ts';

/** Writes `files` (path to text) into a fresh folder, which is not a git repo. */
function repo(files: Record<string, string>): string {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'drive-setup-')));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  }
  return root;
}

const LOCK = (skills: Record<string, string>) =>
  JSON.stringify({
    version: 2,
    skills: Object.fromEntries(
      Object.entries(skills).map(([name, source]) => [name, { source, sourceType: 'github' }]),
    ),
  });
const SKILL = '---\nname: x\ndescription: x\n---\n';
const VENDOR = 'mattpocock/skills';

const text = (root: string, file: string) => readFileSync(path.join(root, file), 'utf8');
const binding = (root: string) => {
  const read = readBinding(text(root, 'docs/drive/binding.yml'));
  if ('error' in read) throw new Error(read.error);
  return read;
};

describe('drive setup', () => {
  describe('with a skills lockfile', () => {
    it('binds the vendor skills the lockfile lists and leaves the other phases inline', () => {
      // ARRANGE
      const root = repo({ 'skills-lock.json': LOCK({ tdd: VENDOR, 'code-review': VENDOR, other: 'someone/else' }) });
      // ACT
      setup(root, { agentType: 'team:dev' });
      // ASSERT
      const result = binding(root);
      expect(result.agentType).toBe('team:dev');
      expect(result.phases.implement).toEqual({ model: 'sonnet', skills: ['tdd'], inline: false });
      expect(result.phases.verify.skills).toEqual(['code-review']);
      expect(result.phases.define.inline).toBe(true);
      expect(result.phases.evolve.inline).toBe(true);
    });
  });

  describe('without a skills lockfile', () => {
    it('detects authored skills but binds no phase, so the Orchestrator does every phase inline', () => {
      // ARRANGE
      const root = repo({ 'skills/mine/SKILL.md': SKILL, 'skills/not-a-skill/notes.md': 'x' });
      // ACT
      setup(root);
      // ASSERT
      expect(detectSkills(root)).toEqual([{ name: 'mine', origin: 'authored', source: null }]);
      const result = binding(root);
      expect(Object.values(result.phases).every((phase) => phase.inline)).toBe(true);
      expect(result.agentType).toBe('general-purpose');
    });

    it('writes a complete folder in an empty repo', () => {
      // ARRANGE
      const root = repo({});
      // ACT
      const written = setup(root);
      // ASSERT
      expect(written.sort()).toEqual([
        'docs/drive/binding.yml',
        'docs/drive/enforcers.yml',
        'docs/drive/learnings.md',
        'docs/drive/profiles.md',
        'docs/drive/project.yml',
      ]);
      expect(parseConfig(text(root, 'docs/drive/project.yml'))).toMatchObject({
        parallel: { default: 3, harnessCap: 20 },
        worktree: { baseBranch: 'main' },
      });
    });
  });

  describe('enforcers', () => {
    it('lists the checks the repo runs for Fortify to choose from', () => {
      // ARRANGE
      const root = repo({
        'package.json': JSON.stringify({ scripts: { lint: 'eslint .', test: 'vitest run', build: 'bundle' } }),
        '.husky/pre-commit': 'npm test',
        '.archgate/adrs/A-001.md': '# a',
      });
      // ACT
      setup(root);
      // ASSERT
      const enforcers = text(root, 'docs/drive/enforcers.yml');
      for (const expected of ['archgate check', 'npm run lint', 'npm run test', '.husky/pre-commit'])
        expect(enforcers).toContain(expected);
      expect(enforcers).not.toContain('npm run build');
    });
  });

  describe('re-running', () => {
    it('keeps a hand edit in every file and adds a newly installed skill', () => {
      // ARRANGE
      const root = repo({ 'skills-lock.json': LOCK({ tdd: VENDOR }) });
      setup(root);
      const edit = (file: string, from: string, to: string) =>
        writeFileSync(path.join(root, file), text(root, file).replace(from, to));
      edit('docs/drive/binding.yml', 'agentType: general-purpose', 'agentType: mine');
      edit('docs/drive/project.yml', 'default: 3', 'default: 2');
      writeFileSync(path.join(root, 'docs/drive/learnings.md'), '# Drive learnings\n\n- a correction\n');
      writeFileSync(path.join(root, 'skills-lock.json'), LOCK({ tdd: VENDOR, 'code-review': VENDOR }));
      // ACT
      setup(root);
      // ASSERT
      expect(binding(root).agentType).toBe('mine');
      expect(binding(root).phases.verify.skills).toEqual(['code-review']);
      expect(parseConfig(text(root, 'docs/drive/project.yml'))).toMatchObject({ parallel: { default: 2 } });
      expect(text(root, 'docs/drive/learnings.md')).toContain('- a correction');
    });

    it('writes nothing when nothing changed', () => {
      // ARRANGE
      const root = repo({ 'skills-lock.json': LOCK({ tdd: VENDOR }) });
      setup(root);
      // ACT
      const written = setup(root);
      // ASSERT
      expect(written).toEqual([]);
    });
  });

  describe('failure cases', () => {
    it('names a lockfile that is not JSON', () => {
      // ARRANGE
      const root = repo({ 'skills-lock.json': '{' });
      // ACT / ASSERT
      expect(() => setup(root)).toThrow('skills-lock.json is not valid JSON');
    });
  });

  describe('the Decision-doc guard', () => {
    it('adds the guard to an existing husky pre-commit hook once', () => {
      // ARRANGE
      const root = repo({ '.husky/pre-commit': 'npm run verify:commit\n' });
      // ACT
      setup(root);
      setup(root);
      // ASSERT
      const hook = text(root, '.husky/pre-commit').split('\n');
      expect(hook.filter((line) => line.includes('drive.ts guard'))).toHaveLength(1);
      expect(hook.at(-2)).toBe('npm run verify:commit');
    });

    it('writes a pull-request workflow when there is no husky hook but there are workflows', () => {
      // ARRANGE
      const root = repo({ '.github/workflows/ci.yml': 'name: ci\n', 'package-lock.json': '{}' });
      // ACT
      setup(root);
      // ASSERT
      const workflow = text(root, '.github/workflows/drive-guard.yml');
      expect(workflow).toContain('on: pull_request');
      expect(workflow).toContain('npm ci');
      expect(workflow).toMatch(/drive\.ts guard --against origin\/main/);
    });

    it('wires nothing when the repo has neither husky nor workflows', () => {
      // ARRANGE
      const root = repo({ 'README.md': 'x' });
      // ACT
      const written = setup(root);
      // ASSERT
      expect(written.filter((file) => file.startsWith('.husky') || file.startsWith('.github'))).toEqual([]);
    });
  });
});
