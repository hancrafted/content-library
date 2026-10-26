import { describe, expect, it } from 'vitest';
import { diffTokens, setEdit, type Scope } from './token-changes.pure';

const global: Scope = { kind: 'global' };
const slide: Scope = { kind: 'slide', id: 'a--b', folder: 'src/episodes/e' };
const primary = { name: '--primary', light: 'black', dark: 'white' };
const body = { name: '--size-body', light: '1rem', dark: '1rem' };

describe('success cases', () => {
  it('reports only the tokens whose edit differs, per theme', () => {
    // ARRANGE
    const dark = setEdit({}, { scope: global, theme: 'dark', token: primary }, 'grey');
    const edits = setEdit(dark, { scope: global, theme: 'light', token: body }, '1.1rem');
    const expected = [
      { scope: global, theme: 'light', name: '--size-body', from: '1rem', to: '1.1rem' },
      { scope: global, theme: 'dark', name: '--primary', from: 'white', to: 'grey' },
    ];
    // ACT
    const changes = diffTokens(global, [primary, body], edits);
    // ASSERT
    expect(changes).toEqual(expected);
  });

  it('keeps scopes apart', () => {
    // ARRANGE
    const edits = setEdit({}, { scope: slide, theme: 'light', token: primary }, 'red');
    const expectedCounts = { global: 0, slide: 1 };
    // ACT
    const globalChanges = diffTokens(global, [primary], edits);
    const slideChanges = diffTokens(slide, [primary], edits);
    // ASSERT
    expect({ global: globalChanges.length, slide: slideChanges.length }).toEqual(expectedCounts);
  });

  it('edits and reports each selector separately', () => {
    // ARRANGE
    const a = { name: '--lane', light: 'red', dark: 'red', target: '.a' };
    const b = { name: '--lane', light: 'blue', dark: 'blue', target: '.b' };
    const edits = setEdit({}, { scope: slide, theme: 'light', token: b }, 'green');
    const expected = [{ scope: slide, theme: 'light', name: '--lane', target: '.b', from: 'blue', to: 'green' }];
    // ACT
    const changes = diffTokens(slide, [a, b], edits);
    // ASSERT
    expect(changes).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reports nothing without edits', () => {
    // ARRANGE
    const edits = {};
    // ACT
    const changes = diffTokens(global, [primary, body], edits);
    // ASSERT
    expect(changes).toEqual([]);
  });
});

describe('edge cases', () => {
  it('drops an edit typed back to the original value', () => {
    // ARRANGE
    const edited = setEdit({}, { scope: global, theme: 'light', token: primary }, 'red');
    const expected = { edits: {}, changes: [] };
    // ACT
    const edits = setEdit(edited, { scope: global, theme: 'light', token: primary }, 'black');
    // ASSERT
    expect({ edits, changes: diffTokens(global, [primary], edits) }).toEqual(expected);
  });
});
