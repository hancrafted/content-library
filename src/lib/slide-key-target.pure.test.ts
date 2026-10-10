import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { inExcludedRegion, slideKeyTarget, type SlideKeyEvent } from './slide-key-target.pure';

const IDS = ['top', 'intro', 'method', 'close'] as const;

function press(overrides: Partial<SlideKeyEvent>): SlideKeyEvent {
  return { key: 'ArrowRight', altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, ...overrides };
}

/** A real parsed element for `html`'s `#focus`, shaped as `inExcludedRegion` reads it. */
function focused(html: string) {
  const $ = cheerio.load(`<body>${html}</body>`);
  const element = $('#focus');
  return { closest: (selector: string) => (element.closest(selector).length > 0 ? element : null) };
}

describe('success cases', () => {
  it('goes to the next Slide on ArrowRight', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    const expected = 'method';
    // ACT
    const target = slideKeyTarget(event, false, { ids: IDS, active: 'intro' });
    // ASSERT
    expect(target).toBe(expected);
  });

  it('goes to the previous Slide on ArrowLeft', () => {
    // ARRANGE
    const event = press({ key: 'ArrowLeft' });
    const expected = 'intro';
    // ACT
    const target = slideKeyTarget(event, false, { ids: IDS, active: 'method' });
    // ASSERT
    expect(target).toBe(expected);
  });

  it('steps from the Title slide to the first Section Slide', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    const expected = 'intro';
    // ACT
    const target = slideKeyTarget(event, false, { ids: IDS, active: 'top' });
    // ASSERT
    expect(target).toBe(expected);
  });

  it.each([
    ['an input', '<input id="focus">'],
    ['a textarea', '<textarea id="focus"></textarea>'],
    ['a select', '<select id="focus"><option>a</option></select>'],
    ['an editable element', '<div id="focus" contenteditable="true">x</div>'],
    ['an iframe', '<iframe id="focus"></iframe>'],
    ['a tab', '<div role="tablist"><button id="focus" role="tab">t</button></div>'],
    ['a menu item', '<div role="menu"><button id="focus" role="menuitem">m</button></div>'],
    ['a menubar item', '<div role="menubar"><button id="focus" role="menuitem">m</button></div>'],
    ['a listbox option', '<div role="listbox"><div id="focus" role="option">o</div></div>'],
    ['a slider', '<div id="focus" role="slider" tabindex="0"></div>'],
    ['a radio', '<div role="radiogroup"><div id="focus" role="radio">r</div></div>'],
    ['the Context drawer', '<aside data-slot="context"><button id="focus">x</button></aside>'],
    ['an open dialog', '<dialog open><button id="focus">x</button></dialog>'],
  ])('is excluded inside %s', (_name, html) => {
    // ARRANGE
    const element = focused(html);
    // ACT
    const excluded = inExcludedRegion(element);
    // ASSERT
    expect(excluded).toBe(true);
  });
});

describe('failure cases', () => {
  it.each(['altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const)('ignores the arrow while %s is held', (modifier) => {
    // ARRANGE
    const event = press({ [modifier]: true });
    // ACT
    const target = slideKeyTarget(event, false, { ids: IDS, active: 'intro' });
    // ASSERT
    expect(target).toBeNull();
  });

  it.each(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'a', 'constructor', 'toString'])(
    'ignores %s',
    (key) => {
      // ARRANGE
      const event = press({ key });
      // ACT
      const target = slideKeyTarget(event, false, { ids: IDS, active: 'intro' });
      // ASSERT
      expect(target).toBeNull();
    },
  );

  it('ignores the arrow while focus sits in an excluded region', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyTarget(event, true, { ids: IDS, active: 'intro' });
    // ASSERT
    expect(target).toBeNull();
  });

  it('does nothing for an unknown active id', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyTarget(event, false, { ids: IDS, active: 'elsewhere' });
    // ASSERT
    expect(target).toBeNull();
  });
});

describe('edge cases', () => {
  it('does not wrap past the last Slide', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyTarget(event, false, { ids: IDS, active: 'close' });
    // ASSERT
    expect(target).toBeNull();
  });

  it('does not wrap before the Title slide', () => {
    // ARRANGE
    const event = press({ key: 'ArrowLeft' });
    // ACT
    const target = slideKeyTarget(event, false, { ids: IDS, active: 'top' });
    // ASSERT
    expect(target).toBeNull();
  });

  it('does nothing while the active id is not known yet', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyTarget(event, false, { ids: IDS, active: null });
    // ASSERT
    expect(target).toBeNull();
  });

  it('does nothing without Slides', () => {
    // ARRANGE
    const event = press({ key: 'ArrowRight' });
    // ACT
    const target = slideKeyTarget(event, false, { ids: [], active: 'top' });
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

  it.each([
    ['a plain button', '<button id="focus">x</button>'],
    ['a link', '<a id="focus" href="#x">x</a>'],
    ['an element that opts out of editing', '<div id="focus" contenteditable="false">x</div>'],
    ['a closed dialog', '<dialog><button id="focus">x</button></dialog>'],
    ['a Slide', '<div data-slide="intro"><button id="focus">x</button></div>'],
  ])('is not excluded on %s', (_name, html) => {
    // ARRANGE
    const element = focused(html);
    // ACT
    const excluded = inExcludedRegion(element);
    // ASSERT
    expect(excluded).toBe(false);
  });
});
