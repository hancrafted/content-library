import { describe, expect, it } from 'vitest';
import {
  inExcludedRegion,
  SLIDE_KEY_EXCLUDED_SELECTOR,
  slideKeyAction,
  type SlideKeyEvent,
} from './slide-key-action.pure';

const IDS = ['top', 'intro', 'method', 'close'] as const;

function press(overrides: Partial<SlideKeyEvent>): SlideKeyEvent {
  return { key: 'ArrowRight', altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, ...overrides };
}

/** An element whose `closest` answers only for one selector. */
function matching(selector: string) {
  return { closest: (query: string) => (query === selector ? {} : null) };
}

describe('success cases', () => {
  it('goes to the next Slide on ArrowRight', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: 'intro' });
    // ASSERT
    expect(target).toBe('method');
  });

  it('goes to the previous Slide on ArrowLeft', () => {
    // ARRANGE
    const event = press({ key: 'ArrowLeft' });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: 'method' });
    // ASSERT
    expect(target).toBe('intro');
  });

  it('steps from the Title slide to the first Section Slide', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: 'top' });
    // ASSERT
    expect(target).toBe('intro');
  });

  it('finds an element inside an excluded region', () => {
    // ARRANGE
    const element = matching(SLIDE_KEY_EXCLUDED_SELECTOR);
    // ACT
    const excluded = inExcludedRegion(element);
    // ASSERT
    expect(excluded).toBe(true);
  });

  it.each([
    'input',
    'textarea',
    'select',
    '[contenteditable]',
    'iframe',
    '[role=tablist]',
    '[role=menu]',
    '[role=menubar]',
    '[role=listbox]',
    '[role=slider]',
    '[role=radiogroup]',
    '[data-slot=context]',
    'dialog[open]',
  ])('names %s as an excluded region', (part) => {
    // ARRANGE
    const parts = SLIDE_KEY_EXCLUDED_SELECTOR.split(',').map((s) => s.trim());
    // ACT
    const named = parts.includes(part);
    // ASSERT
    expect(named).toBe(true);
  });
});

describe('failure cases', () => {
  it.each(['altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const)('ignores the arrow while %s is held', (modifier) => {
    // ARRANGE
    const event = press({ [modifier]: true });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: 'intro' });
    // ASSERT
    expect(target).toBeNull();
  });

  it.each(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'a'])('ignores %s', (key) => {
    // ARRANGE
    const event = press({ key });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: 'intro' });
    // ASSERT
    expect(target).toBeNull();
  });

  it('ignores the arrow while focus sits in an excluded region', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyAction(event, true, { ids: IDS, active: 'intro' });
    // ASSERT
    expect(target).toBeNull();
  });

  it('does nothing for an unknown active id', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: 'elsewhere' });
    // ASSERT
    expect(target).toBeNull();
  });
});

describe('edge cases', () => {
  it('does not wrap past the last Slide', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: 'close' });
    // ASSERT
    expect(target).toBeNull();
  });

  it('does not wrap before the Title slide', () => {
    // ARRANGE
    const event = press({ key: 'ArrowLeft' });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: 'top' });
    // ASSERT
    expect(target).toBeNull();
  });

  it('does nothing while the active id is not known yet', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyAction(event, false, { ids: IDS, active: null });
    // ASSERT
    expect(target).toBeNull();
  });

  it('does nothing without Slides', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyAction(event, false, { ids: [], active: 'top' });
    // ASSERT
    expect(target).toBeNull();
  });

  it('is not excluded without a focused element', () => {
    // ARRANGE
    const element = null;
    // ACT
    const excluded = inExcludedRegion(element);
    // ASSERT
    expect(excluded).toBe(false);
  });

  it('is not excluded when the element sits in no excluded region', () => {
    // ARRANGE
    const element = matching('nothing');
    // ACT
    const excluded = inExcludedRegion(element);
    // ASSERT
    expect(excluded).toBe(false);
  });
});
