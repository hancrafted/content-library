import { describe, expect, it } from 'vitest';
import { applyEdits, type TokenSet } from './page-tokens';

const TOKENS: TokenSet = {
  scope: { kind: 'global' },
  tokens: [{ name: '--slide-space-after', light: '0px', dark: '0px' }],
};
const EDIT_KEY = 'global|light|--slide-space-after|';

function withInlineStyle(initial: string | undefined, priority: string, run: (style: CSSStyleDeclaration) => void) {
  const values = new Map<string, { value: string; priority: string }>();
  if (initial !== undefined) values.set('--slide-space-after', { value: initial, priority });
  const style = {
    getPropertyValue: (name: string) => values.get(name)?.value ?? '',
    getPropertyPriority: (name: string) => values.get(name)?.priority ?? '',
    setProperty: (name: string, value: string, importance = '') => values.set(name, { value, priority: importance }),
    removeProperty: (name: string) => values.delete(name),
  } as unknown as CSSStyleDeclaration;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { documentElement: { style } } });
  try {
    run(style);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    else Reflect.deleteProperty(globalThis, 'document');
  }
}

describe('success cases', () => {
  it('leaves authored inline reading space intact when the editor has no edit', () => {
    // ARRANGE
    const expected = '160px';
    let seen = '';
    // ACT
    withInlineStyle(expected, '', (style) => {
      applyEdits(TOKENS, {}, 'light');
      seen = style.getPropertyValue('--slide-space-after');
    });
    // ASSERT
    expect(seen).toBe(expected);
  });
});

describe('failure cases', () => {
  it('restores the authored value and priority when repeated edits are cleared', () => {
    // ARRANGE
    const authored = '160px';
    const priority = 'important';
    const edited = '320px';
    let seen: string[] = [];
    // ACT
    withInlineStyle(authored, priority, (style) => {
      applyEdits(TOKENS, { [EDIT_KEY]: edited }, 'light');
      applyEdits(TOKENS, { [EDIT_KEY]: '480px' }, 'light');
      applyEdits(TOKENS, {}, 'light');
      seen = [style.getPropertyValue('--slide-space-after'), style.getPropertyPriority('--slide-space-after')];
    });
    // ASSERT
    expect(seen).toEqual([authored, priority]);
  });
});

describe('edge cases', () => {
  it('removes only the editor override when the original value came from CSS and the theme changes', () => {
    // ARRANGE
    const edited = '320px';
    let before = '';
    let after = '';
    // ACT
    withInlineStyle(undefined, '', (style) => {
      applyEdits(TOKENS, { [EDIT_KEY]: edited }, 'light');
      before = style.getPropertyValue('--slide-space-after');
      applyEdits(TOKENS, { [EDIT_KEY]: edited }, 'dark');
      after = style.getPropertyValue('--slide-space-after');
    });
    // ASSERT
    expect(before).toBe(edited);
    expect(after).toBe('');
  });
});
