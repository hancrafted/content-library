import { describe, expect, it } from 'vitest';
import { diffTokens, setEdit, type Scope } from './token-changes.pure';

const global: Scope = { kind: 'global' };
const slide: Scope = { kind: 'slide', id: 'a--b', episode: 'e' };
const primary = { name: '--primary', light: 'black', dark: 'white' };
const body = { name: '--size-body', light: '1rem', dark: '1rem' };

describe('success cases', () => {
  it('reports only the tokens whose edit differs, per theme', () => {
    // ARRANGE
    const dark = setEdit({}, { scope: global, theme: 'dark', token: primary }, 'grey');
    const edits = setEdit(dark, { scope: global, theme: 'light', token: body }, '1.1rem');
    // ACT
    const changes = diffTokens(global, [primary, body], edits);
    // ASSERT
    expect(changes).toEqual([
      { scope: global, theme: 'light', name: '--size-body', from: '1rem', to: '1.1rem' },
      { scope: global, theme: 'dark', name: '--primary', from: 'white', to: 'grey' },
    ]);
  });

  it('keeps scopes apart', () => {
    // ARRANGE
    const edits = setEdit({}, { scope: slide, theme: 'light', token: primary }, 'red');
    // ACT
    const globalChanges = diffTokens(global, [primary], edits);
    const slideChanges = diffTokens(slide, [primary], edits);
    // ASSERT
    expect([globalChanges.length, slideChanges.length]).toEqual([0, 1]);
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
    // ACT
    const edits = setEdit(edited, { scope: global, theme: 'light', token: primary }, 'black');
    // ASSERT
    expect([edits, diffTokens(global, [primary], edits)]).toEqual([{}, []]);
  });
});
