import { describe, expect, it } from 'vitest';
import {
  checkContext,
  currentSlideAnchor,
  DEFAULT_DRAWER_MODE,
  DRAWER_MODES,
  DRAWER_PANEL_ID,
  DRAWER_TABS,
  drawerIds,
  drawerKeyAction,
  formatMark,
  matchesShortcut,
  menuItemAfter,
  reservesSpace,
  tabAfter,
  titleOfSlide,
  type KeyEventLike,
  type SpeakerNoteItem,
  type VoiceScriptSegment,
} from './context-drawer.pure';

function key(overrides: Partial<KeyEventLike>): KeyEventLike {
  return { code: 'KeyN', altKey: true, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false, ...overrides };
}

function note(slug: string, target = 'prose'): SpeakerNoteItem {
  return { slug, header: 'h', description: 'd', target };
}

function segment(slug: string, from = 0, to = 1): VoiceScriptSegment {
  return { slug, from, to, title: 't', keywords: [], script: 's' };
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

  it('moves between tabs with the arrows, wrapping at both ends, and jumps with Home and End', () => {
    // ARRANGE
    const tabs = ['notes', 'script'];
    const expected = ['script', 'script', 'notes', 'notes', 'script'];
    // ACT
    const targets = [
      tabAfter('ArrowRight', 'notes', tabs),
      tabAfter('ArrowLeft', 'notes', tabs),
      tabAfter('ArrowRight', 'script', tabs),
      tabAfter('Home', 'script', tabs),
      tabAfter('End', 'notes', tabs),
    ];
    // ASSERT
    expect(targets).toEqual(expected);
  });

  it('picks the active Slide when it has notes, else falls back to the first', () => {
    // ARRANGE
    const anchors = ['a', 'b--c'];
    const expected = ['b--c', 'a', 'a'];
    // ACT
    const picked = [
      currentSlideAnchor('b--c', anchors),
      currentSlideAnchor(null, anchors),
      currentSlideAnchor('unknown', anchors),
    ];
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

  it('accepts a Slide with distinct notes and segments', () => {
    // ARRANGE
    const notes = [note('one'), note('two', 'caption')];
    const segments = [segment('a', 0, 1), segment('b', 1, 2)];
    // ACT
    const check = () => checkContext('foundations--why', notes, segments);
    // ASSERT
    expect(check).not.toThrow();
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

  it('reserves the card width only when it is open side by side', () => {
    // ARRANGE
    const expected = [true, false, false, false];
    // ACT
    const reserved = [
      reservesSpace('side', true),
      reservesSpace('side', false),
      reservesSpace('overlay', true),
      reservesSpace('overlay', false),
    ];
    // ASSERT
    expect(reserved).toEqual(expected);
  });

  it('offers side by side first and by default, then overlay', () => {
    // ARRANGE
    const expected = ['side', 'overlay'];
    // ACT
    const modes = [...DRAWER_MODES];
    // ASSERT
    expect(modes).toEqual(expected);
    expect(DEFAULT_DRAWER_MODE).toBe(expected[0]);
  });

  it('moves between menu items with the vertical arrows, wrapping, and jumps with Home and End', () => {
    // ARRANGE
    const items = ['side', 'overlay'];
    const expected = ['overlay', 'overlay', 'side', 'side', 'overlay'];
    // ACT
    const targets = [
      menuItemAfter('ArrowDown', 'side', items),
      menuItemAfter('ArrowUp', 'side', items),
      menuItemAfter('ArrowDown', 'overlay', items),
      menuItemAfter('Home', 'overlay', items),
      menuItemAfter('End', 'side', items),
    ];
    // ASSERT
    expect(targets).toEqual(expected);
  });

  it('titles the drawer with the title of the current Slide', () => {
    // ARRANGE
    const slides = [
      { anchor: 'a', title: 'First' },
      { anchor: 'b--c', title: 'Second' },
    ];
    const expected = 'Second';
    // ACT
    const title = titleOfSlide('b--c', slides, 'fallback');
    // ASSERT
    expect(title).toBe(expected);
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

  it('returns no tab for a key that is not a tab key', () => {
    // ARRANGE
    const tabs = ['notes', 'script'];
    // ACT
    const target = tabAfter('Enter', 'notes', tabs);
    // ASSERT
    expect(target).toBeNull();
  });

  it('rejects two notes, or two segments, sharing a slug', () => {
    // ARRANGE
    const dupNoteSlug = '"x"';
    const dupSegmentSlug = '"y"';
    const dupNote = () => checkContext('s', [note('x'), note('x')], []);
    const dupSegment = () => checkContext('s', [], [segment('y'), segment('y', 1, 2)]);
    // ACT
    const messages = [dupNote, dupSegment].map((run) => {
      try {
        run();
        return '';
      } catch (error) {
        return (error as Error).message;
      }
    });
    // ASSERT
    expect(messages[0]).toContain(dupNoteSlug);
    expect(messages[1]).toContain(dupSegmentSlug);
  });

  it('rejects a target or slug that is not kebab-case', () => {
    // ARRANGE
    const badTargetName = 'Not Kebab';
    const badSlugName = 'Bad Slug';
    const badTarget = () => checkContext('s', [note('x', badTargetName)], []);
    const badSlug = () => checkContext('s', [], [segment(badSlugName)]);
    // ACT
    const attempts = [badTarget, badSlug];
    // ASSERT
    expect(attempts[0]).toThrow(badTargetName);
    expect(attempts[1]).toThrow(badSlugName);
  });

  it('rejects a segment that ends before it starts', () => {
    // ARRANGE
    const segmentSlug = '"x"';
    const backwards = () => checkContext('s', [], [segment('x', 2, 1)]);
    // ACT
    const attempt = backwards;
    // ASSERT
    expect(attempt).toThrow(segmentSlug);
  });

  it('returns no menu item for a key that is not a menu key, horizontal arrows included', () => {
    // ARRANGE
    const items = ['side', 'overlay'];
    // ACT
    const targets = ['Enter', 'ArrowRight', 'ArrowLeft'].map((key) => menuItemAfter(key, 'side', items));
    // ASSERT
    expect(targets).toEqual([null, null, null]);
  });

  it('falls back to the given title when the current Slide is unknown', () => {
    // ARRANGE
    const slides = [{ anchor: 'a', title: 'First' }];
    const fallback = 'Context';
    // ACT
    const title = titleOfSlide('missing', slides, fallback);
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

  it('stays on the only tab', () => {
    // ARRANGE
    const tabs = ['notes'];
    const expected = 'notes';
    // ACT
    const target = tabAfter('ArrowRight', 'notes', tabs);
    // ASSERT
    expect(target).toBe(expected);
  });

  it('has no current Slide when none has notes', () => {
    // ARRANGE
    const anchors: string[] = [];
    // ACT
    const picked = currentSlideAnchor('a', anchors);
    // ASSERT
    expect(picked).toBeNull();
  });

  it('accepts a Slide with no notes and no script', () => {
    // ARRANGE
    const check = () => checkContext('s', [], []);
    // ACT
    const result = check();
    // ASSERT
    expect(result).toBeUndefined();
  });

  it('falls back to the given title when no Slide is current', () => {
    // ARRANGE
    const fallback = 'Context';
    // ACT
    const title = titleOfSlide(null, [], fallback);
    // ASSERT
    expect(title).toBe(fallback);
  });

  it('stays on the only menu item', () => {
    // ARRANGE
    const items = ['side'];
    // ACT
    const target = menuItemAfter('ArrowDown', 'side', items);
    // ASSERT
    expect(target).toBe(items[0]);
  });
});
