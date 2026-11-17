import { describe, expect, it } from 'vitest';
import { DEFAULTS, PARALLEL_DEFAULTS, parseConfig } from './config.pure.ts';

describe('parseConfig', () => {
  describe('success cases', () => {
    it('reads every worktree key', () => {
      // ARRANGE
      const text = [
        'worktree:',
        '  dir: .wt',
        '  baseBranch: trunk',
        '  remote: upstream',
        '  invoke: make wt',
        '  install: [setup]',
        '  preflight: check-health',
        '  lock: locks/mutex.ts',
        '  beforeRemove: [stop]',
        '  afterMerge: [report]',
        '  afterRemove: [tidy]',
        'parallel: { default: 2, harnessCap: 8 }',
        'decisionDocs: [docs/words.md]',
      ].join('\n');
      // ACT
      const config = parseConfig(text);
      // ASSERT
      expect(config).toEqual({
        worktree: {
          dir: '.wt',
          baseBranch: 'trunk',
          remote: 'upstream',
          invoke: 'make wt',
          install: ['setup'],
          preflight: 'check-health',
          lock: 'locks/mutex.ts',
          beforeRemove: ['stop'],
          afterMerge: ['report'],
          afterRemove: ['tidy'],
        },
        parallel: { default: 2, harnessCap: 8 },
        decisionDocs: ['docs/words.md'],
      });
    });

    it('fills the defaults for an empty file, a missing section and missing keys', () => {
      // ARRANGE
      const texts = ['', 'other: 1', 'worktree: {}'];
      // ACT
      const configs = texts.map(parseConfig);
      // ASSERT
      expect(configs).toEqual(texts.map(() => ({ worktree: DEFAULTS, parallel: PARALLEL_DEFAULTS, decisionDocs: [] })));
    });
  });

  describe('failure cases', () => {
    it('names the key that has the wrong type or is unknown', () => {
      // ARRANGE
      const texts = [
        'worktree:\n  install: setup',
        'worktree:\n  dir: 3',
        'worktree:\n  instal: []',
        '- a',
        'a: [',
        'parallel: { default: 0 }',
        'parallel: { cap: 3 }',
        'decisionDocs: x',
      ];
      // ACT
      const errors = texts.map((text) => parseConfig(text));
      // ASSERT
      expect(errors.every((config) => 'error' in config)).toBe(true);
      expect(errors.map((config) => ('error' in config ? config.error : ''))).toEqual([
        'worktree.install must be a list of shell commands',
        'worktree.dir must be a non-empty string',
        "unknown worktree key 'instal'; expected dir, baseBranch, remote, invoke, install, preflight, lock, beforeRemove, afterMerge, afterRemove",
        'docs/drive/project.yml must be a mapping',
        expect.stringContaining('not valid YAML'),
        'parallel.default must be a whole number of at least 1',
        "unknown parallel key 'cap'; expected default, harnessCap",
        'decisionDocs must be a list of paths',
      ]);
    });
  });
});
