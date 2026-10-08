import { describe, expect, it } from 'vitest';
import {
  currentItemId,
  DRAWER_PANEL_ID,
  DRAWER_TABS,
  drawerIds,
  drawerKeyAction,
  formatMark,
  matchesShortcut,
  reservesSpace,
  sourceDomain,
  splitCitations,
  titleOfItem,
  type KeyEventLike,
} from './context-drawer.pure';

function key(overrides: Partial<KeyEventLike>): KeyEventLike {
  return { code: 'KeyN', altKey: true, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, ...overrides };
}

describe('success cases', () => {
  it('matches Alt+N on the physical key, whatever letter the layout prints', () => {
    // ARRANGE
    const event = key({ code: 'KeyN' });
    // ACT
    const matches = matchesShortcut(event);
    // ASSERT
    expect(matches).toBe(true);
  });

  it('toggles on the shortcut and closes on Escape only while open', () => {
    // ARRANGE
    const escape = key({ code: 'Escape', altKey: false });
    const expected = ['toggle', 'toggle', 'close', null];
    // ACT
    const actions = [
      drawerKeyAction(key({}), false),
      drawerKeyAction(key({}), true),
      drawerKeyAction(escape, true),
      drawerKeyAction(escape, false),
    ];
    // ASSERT
    expect(actions).toEqual(expected);
  });

  it('picks the active Slide when it has notes, else falls back to the first', () => {
    // ARRANGE
    const anchors = ['a', 'b--c'];
    const expected = ['b--c', 'a', 'a'];
    // ACT
    const picked = [currentItemId('b--c', anchors), currentItemId(null, anchors), currentItemId('unknown', anchors)];
    // ASSERT
    expect(picked).toEqual(expected);
  });

  it('formats minutes as a time mark', () => {
    // ARRANGE
    const expected = ['0:00', '0:45', '1:45', '12:30'];
    // ACT
    const marks = [0, 0.75, 1.75, 12.5].map(formatMark);
    // ASSERT
    expect(marks).toEqual(expected);
  });

  it('derives a distinct tab id and panel id for every tab from DRAWER_TABS', () => {
    // ARRANGE
    const ids = DRAWER_TABS.map((tab) => drawerIds(tab));
    const all = ids.flatMap(({ tab, panel }) => [tab, panel]);
    const idsPerTab = 2;
    const expectedCount = DRAWER_TABS.length * idsPerTab + 1;
    // ACT
    const unique = new Set([...all, DRAWER_PANEL_ID]);
    // ASSERT
    expect(unique.size).toBe(expectedCount);
  });

  it('names the tabs notes then script', () => {
    // ARRANGE
    const expected = ['notes', 'script'];
    // ACT
    const tabs = [...DRAWER_TABS];
    // ASSERT
    expect(tabs).toEqual(expected);
  });

  it('reserves the card width only when it is open beside the Slides', () => {
    // ARRANGE
    const expected = [true, false, false, false];
    // ACT
    const reserved = [
      reservesSpace('beside', true),
      reservesSpace('beside', false),
      reservesSpace('over', true),
      reservesSpace('over', false),
    ];
    // ASSERT
    expect(reserved).toEqual(expected);
  });

  it('titles the drawer with the title of the current Slide', () => {
    // ARRANGE
    const slides = [
      { id: 'a', title: 'First' },
      { id: 'b--c', title: 'Second' },
    ];
    const expected = 'Second';
    // ACT
    const title = titleOfItem('b--c', slides, 'fallback');
    // ASSERT
    expect(title).toBe(expected);
  });

  it('splits a description into text and citation markers in order', () => {
    // ARRANGE
    const text = 'Stateless [1] by design [2].';
    const expected = ['Stateless ', { cite: 1 }, ' by design ', { cite: 2 }, '.'];
    // ACT
    const parts = splitCitations(text);
    // ASSERT
    expect(parts).toEqual(expected);
  });

  it('names a source by its host, without a leading www', () => {
    // ARRANGE
    const urls = ['https://www.anthropic.com/engineering/x', 'https://code.claude.com/docs/en/memory'];
    const expected = ['anthropic.com', 'code.claude.com'];
    // ACT
    const domains = urls.map(sourceDomain);
    // ASSERT
    expect(domains).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each([
    ['Ctrl+Alt+N', key({ ctrlKey: true })],
    ['Meta+Alt+N', key({ metaKey: true })],
    ['Shift+Alt+N', key({ shiftKey: true })],
    ['bare N', key({ altKey: false })],
    ['Alt+M', key({ code: 'KeyM' })],
  ])('does not match %s', (_name, event) => {
    // ARRANGE
    const expected = false;
    // ACT
    const matches = matchesShortcut(event);
    // ASSERT
    expect(matches).toBe(expected);
  });

  it('falls back to the given title when the current Slide is unknown', () => {
    // ARRANGE
    const slides = [{ id: 'a', title: 'First' }];
    const fallback = 'Context';
    // ACT
    const title = titleOfItem('missing', slides, fallback);
    // ASSERT
    expect(title).toBe(fallback);
  });
});

describe('edge cases', () => {
  it('ignores a held-down shortcut', () => {
    // ARRANGE
    const event = key({ repeat: true });
    // ACT
    const matches = matchesShortcut(event);
    // ASSERT
    expect(matches).toBe(false);
  });

  it('has no current Slide when none has notes', () => {
    // ARRANGE
    const anchors: string[] = [];
    // ACT
    const picked = currentItemId('a', anchors);
    // ASSERT
    expect(picked).toBeNull();
  });

  it('falls back to the given title when no Slide is current', () => {
    // ARRANGE
    const fallback = 'Context';
    // ACT
    const title = titleOfItem(null, [], fallback);
    // ASSERT
    expect(title).toBe(fallback);
  });

  it('leaves text without markers, and brackets that are not a positive number, as one text part', () => {
    // ARRANGE
    const text = 'See [0], [a] and [] here';
    const expected = [text];
    // ACT
    const parts = splitCitations(text);
    // ASSERT
    expect(parts).toEqual(expected);
  });

  it('keeps a marker at the very start or end of a description', () => {
    // ARRANGE
    const text = '[1]middle[2]';
    const expected = [{ cite: 1 }, 'middle', { cite: 2 }];
    // ACT
    const parts = splitCitations(text);
    // ASSERT
    expect(parts).toEqual(expected);
  });
});
