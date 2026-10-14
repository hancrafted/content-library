import { describe, expect, it } from 'vitest';
import { findViolations, type CheckoutFacts } from './preflight.pure';

const HEALTHY: CheckoutFacts = { nodeModules: 'directory', hooksInstalled: true, archgateTotal: 26 };

describe('findViolations', () => {
  describe('success cases', () => {
    it('passes a healthy checkout', () => {
      // ARRANGE
      const facts = HEALTHY;
      // ACT
      const violations = findViolations(facts);
      // ASSERT
      expect(violations).toEqual([]);
    });
  });

  describe('failure cases', () => {
    it('flags a symlinked node_modules and points at the worktree command', () => {
      // ARRANGE
      const facts: CheckoutFacts = { ...HEALTHY, nodeModules: 'symlink' };
      const expectedId = 'node-modules-symlink';
      const expectedFix = 'npm run wt:new';
      // ACT
      const [violation] = findViolations(facts);
      // ASSERT
      expect(violation.id).toBe(expectedId);
      expect(violation.fix).toContain(expectedFix);
    });

    it('flags missing husky hooks so unguarded commits surface', () => {
      // ARRANGE
      const facts: CheckoutFacts = { ...HEALTHY, hooksInstalled: false };
      const expectedId = 'hooks-missing';
      const expectedFix = 'npx husky';
      // ACT
      const [violation] = findViolations(facts);
      // ASSERT
      expect(violation.id).toBe(expectedId);
      expect(violation.fix).toContain(expectedFix);
    });

    it('flags an archgate run that checked nothing', () => {
      // ARRANGE
      const facts: CheckoutFacts = { ...HEALTHY, archgateTotal: 0 };
      const expectedId = 'archgate-empty';
      const expectedFix = 'npm run archgate:full';
      // ACT
      const [violation] = findViolations(facts);
      // ASSERT
      expect(violation.id).toBe(expectedId);
      expect(violation.fix).toContain(expectedFix);
    });
  });

  describe('edge cases', () => {
    it('flags a checkout with no node_modules at all', () => {
      // ARRANGE
      const facts: CheckoutFacts = { ...HEALTHY, nodeModules: 'missing' };
      const expectedId = 'node-modules-missing';
      const expectedFix = 'npm ci';
      // ACT
      const [violation] = findViolations(facts);
      // ASSERT
      expect(violation.id).toBe(expectedId);
      expect(violation.fix).toContain(expectedFix);
    });

    it('reports every violation at once, not just the first', () => {
      // ARRANGE
      const facts: CheckoutFacts = { nodeModules: 'symlink', hooksInstalled: false, archgateTotal: 0 };
      const expectedIds = ['node-modules-symlink', 'hooks-missing', 'archgate-empty'];
      // ACT
      const ids = findViolations(facts).map((violation) => violation.id);
      // ASSERT
      expect(ids).toEqual(expectedIds);
    });
  });
});
