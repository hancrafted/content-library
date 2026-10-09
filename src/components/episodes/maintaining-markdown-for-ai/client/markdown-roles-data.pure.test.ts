import { describe, expect, it } from 'vitest';
import { MODALS_DATA, ROLES_DATA } from './markdown-roles-data.pure';

describe('success cases', () => {
  it('defines 3 interactive role specifications', () => {
    // ARRANGE
    const expectedRoles = 3;
    // ACT
    const roles = Object.values(ROLES_DATA);
    // ASSERT
    expect(roles).toHaveLength(expectedRoles);
  });

  it('gives every role a filename, body title, items and a quote', () => {
    // ARRANGE
    const roles = Object.values(ROLES_DATA);
    // ACT
    const incomplete = roles.filter((r) => !r.filename || !r.bodyTitle || r.items.length === 0 || !r.quote);
    // ASSERT
    expect(incomplete).toEqual([]);
  });

  it('defines 5 card back modals', () => {
    // ARRANGE
    const expectedModals = 5;
    // ACT
    const modals = Object.values(MODALS_DATA);
    // ASSERT
    expect(modals).toHaveLength(expectedModals);
  });

  it('gives every modal a title, an eyebrow and a lede', () => {
    // ARRANGE
    const modals = Object.values(MODALS_DATA);
    // ACT
    const incomplete = modals.filter((m) => !m.title || !m.eyebrow || !m.lede);
    // ASSERT
    expect(incomplete).toEqual([]);
  });
});

describe('failure cases', () => {
  it('has no modal under a key that is neither a role nor frontmatter or syntax', () => {
    // ARRANGE
    const allowedKeys = ['frontmatter', 'instruction', 'knowledge', 'memory', 'syntax'];
    // ACT
    const keys = Object.keys(MODALS_DATA).sort();
    // ASSERT
    expect(keys).toEqual(allowedKeys);
  });
});

describe('edge cases', () => {
  it('keys each role by the role key it carries', () => {
    // ARRANGE
    const entries = Object.entries(ROLES_DATA);
    // ACT
    const mismatched = entries.filter(([key, role]) => role.key !== key).map(([key]) => key);
    // ASSERT
    expect(mismatched).toEqual([]);
  });
});
