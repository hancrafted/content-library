import { describe, expect, it } from 'vitest';
import { CALLOUTS, CLOSE_UP, PHONE_SCENE_PIXELS, clashes, closeUpLayout, type CalloutWords } from './close-up.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

type Messages = typeof en;
const wordsOf = (messages: Messages): Record<CalloutWords['slug'], CalloutWords> =>
  Object.fromEntries(
    CALLOUTS.map(({ slug }) => [
      slug,
      { slug, term: messages.callouts[slug].term, scene: messages.callouts[slug].scene },
    ]),
  ) as Record<CalloutWords['slug'], CalloutWords>;

describe('success cases', () => {
  it('keeps the English bubble off every label and every label clear of the others', () => {
    // ARRANGE
    const layout = closeUpLayout({ request: en.request, callouts: wordsOf(en) });
    // ACT
    const found = clashes(layout);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('keeps the German bubble off every label and every label clear of the others', () => {
    // ARRANGE
    const layout = closeUpLayout({ request: de.request, callouts: wordsOf(de as Messages) });
    // ACT
    const found = clashes(layout);
    // ASSERT
    expect(found).toEqual([]);
  });

  it('keeps the phone-sized bubble off every number badge and inside the Scene, in both languages', () => {
    // ARRANGE
    const phone = { scenePixels: PHONE_SCENE_PIXELS };
    // ACT
    const found = {
      en: clashes(closeUpLayout({ request: en.request, callouts: wordsOf(en), ...phone })),
      de: clashes(closeUpLayout({ request: de.request, callouts: wordsOf(de as Messages), ...phone })),
    };
    // ASSERT
    expect(found).toEqual({ en: [], de: [] });
  });
});

describe('failure cases', () => {
  it('names the label a bubble too long for the cabin would cover', () => {
    // ARRANGE
    const request =
      'Grab some mud here before we move on, and then another sample, and another, and one more again. '.repeat(3);
    const covered = 'says covers description';
    // ACT
    const found = clashes(closeUpLayout({ request, callouts: wordsOf(en) }));
    // ASSERT
    expect(found).toContain(covered);
  });
});

describe('edge cases', () => {
  it('holds the bubble inside the close-up, under the labels in the sky', () => {
    // ARRANGE
    const layout = closeUpLayout({ request: en.request, callouts: wordsOf(en) });
    // ACT
    const { says } = layout;
    // ASSERT
    expect(says.y).toBeGreaterThanOrEqual(CLOSE_UP.y);
    expect(says.x).toBeGreaterThanOrEqual(CLOSE_UP.x);
    expect(says.x + says.width).toBeLessThanOrEqual(CLOSE_UP.x + CLOSE_UP.width);
  });
});
