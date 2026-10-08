import { describe, expect, it } from 'vitest';
import {
  checkContext,
  currentSlideAnchor,
  DRAWER_PANEL_ID,
  DRAWER_TABS,
  drawerIds,
  drawerKeyAction,
  formatMark,
  matchesShortcut,
  tabAfter,
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
});

describe('drawer ids', () => {
  it('derives a distinct tab id and panel id for every tab from DRAWER_TABS', () => {
    // ARRANGE
    const ids = DRAWER_TABS.map((tab) => drawerIds(tab));
    const all = ids.flatMap(({ tab, panel }) => [tab, panel]);
    // ACT
    const unique = new Set([...all, DRAWER_PANEL_ID]);
    // ASSERT
    expect(unique.size).toBe(DRAWER_TABS.length * 2 + 1);
  });

  it('names the tabs notes then script', () => {
    // ARRANGE
    const expected = ['notes', 'script'];
    // ACT
    const tabs = [...DRAWER_TABS];
    // ASSERT
    expect(tabs).toEqual(expected);
  });
});
