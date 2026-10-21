import { localizeSlide, localizeTitleScene } from '@/components/slide-master/localized-slide';
import type { Slide } from '@/components/slide-master/slide';
import { SessionBarPreset } from '@/components/slide-shared/context/context';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { hero } from '../slides/hero/slide';
import { managingTheAttentionSpanSection } from './managing-the-attention-span';
import { theAisAttentionSpanSection } from './the-ais-attention-span';
import { thoughtExperimentSection } from './thought-experiment';
import { whatFillsTheWindowSection } from './what-fills-the-window';

/*
 * The satirical "Your attention" bar on the Title slide and the four Section openers, and the closing Slide that
 * fills it: what each Scene says on the bar and under it, read as the page renders it, with the Voice script of each
 * changed Slide held to the screen.
 */

const PLACED = placeSections<Slide>([
  thoughtExperimentSection,
  theAisAttentionSpanSection,
  whatFillsTheWindowSection,
  managingTheAttentionSpanSection,
]).flat();

const context = (locale: Locale) => ({
  episode: 'ai-attention-span' as const,
  locale,
  placed: PLACED,
  referenceLabels: { ref: 'opens speaker note', marker: (title: string) => `Speaker note: ${title}` },
  header: 'shared' as const,
});

function localized(slug: string, locale: Locale) {
  const placed = PLACED.find((p) => p.slide.slug === slug);
  if (!placed) throw new Error(`no Slide "${slug}"`);
  return localizeSlide(placed, context(locale));
}

const scene = (slug: string, locale: Locale) =>
  load(
    renderToStaticMarkup(
      createElement(
        Fragment,
        null,
        slug === 'hero' ? localizeTitleScene(hero, context(locale)) : localized(slug, locale).content,
      ),
    ),
  );

const bar = (slug: string, locale: Locale) => {
  const $ = scene(slug, locale);
  return {
    label: $('[data-session-label]').text().trim(),
    now: $('[data-state="current"]').text().trim(),
    below: $('[data-below]').text().trim(),
    note: $('[data-session-note]').text().trim(),
    filled: $('[data-state="done"], [data-state="current"]').length,
  };
};

const STEPS = { start: 0, thought: 1, ais: 2, fills: 3, managing: 4 } as const;
const YOUR = { en: 'Your attention', de: 'Deine Aufmerksamkeit' } as const;

describe('success cases', () => {
  it.each([
    ['en', { note: 'Fresh and ready to receive.', filled: STEPS.start }],
    ['de', { note: 'Frisch und bereit zum Empfangen.', filled: STEPS.start }],
  ] as const)('opens the Title slide with an empty bar and says it is fresh (%s)', (locale, expected) => {
    // ARRANGE
    const slug = 'hero';
    // ACT
    const seen = bar(slug, locale);
    // ASSERT
    expect(seen).toMatchObject({ label: YOUR[locale], now: '', ...expected });
  });

  it.each([
    [
      'thought-experiment',
      'en',
      { now: 'Ready?', below: "Let's start light, because you're human.", filled: STEPS.thought },
    ],
    [
      'thought-experiment',
      'de',
      { now: 'Bereit?', below: 'Wir fangen leicht an, denn Du bist ein Mensch.', filled: STEPS.thought },
    ],
    [
      'the-ais-attention-span',
      'en',
      { now: "Let's dial it up a notch.", below: 'See if you can keep up.', filled: STEPS.ais },
    ],
    [
      'the-ais-attention-span',
      'de',
      { now: 'Dann drehen wir mal auf.', below: 'Schau, ob Du mithalten kannst.', filled: STEPS.ais },
    ],
    [
      'what-fills-the-window',
      'en',
      {
        now: "So, how's your brain doing? Anything fried yet?",
        below: "I'm not done yet. Try to keep up.",
        filled: STEPS.fills,
      },
    ],
    [
      'what-fills-the-window',
      'de',
      {
        now: "Na, wie geht's Deinem Kopf? Schon durchgebrannt?",
        below: 'Ich bin noch nicht fertig. Versuch mitzuhalten.',
        filled: STEPS.fills,
      },
    ],
    [
      'managing-the-attention-span',
      'en',
      { now: 'You made it, almost. Just one more thing.', below: '', filled: STEPS.managing },
    ],
    [
      'managing-the-attention-span',
      'de',
      { now: 'Du hast es fast geschafft. Nur noch eine Sache.', below: '', filled: STEPS.managing },
    ],
  ] as const)('puts the AI talking to the viewer on the %s opener (%s)', (slug, locale, expected) => {
    // ARRANGE
    const header = YOUR[locale];
    // ACT
    const seen = bar(slug, locale);
    // ASSERT
    expect(seen).toMatchObject({ label: header, ...expected });
  });

  it('draws a rotten apple with an evil smile, hidden from assistive technology, on the last opener', () => {
    // ARRANGE
    const expected = { apples: 1, hidden: 'true' };
    // ACT
    const $ = scene('managing-the-attention-span', 'en');
    // ASSERT
    expect({
      apples: $('svg[data-rotten-apple]').length,
      hidden: $('svg[data-rotten-apple]').attr('aria-hidden'),
    }).toEqual(expected);
  });

  it.each([
    [
      'en',
      {
        title: 'Congratulations',
        caption: 'Now you know how it feels to be an AI.',
        note: 'Full to the brim. Well done.',
      },
    ],
    [
      'de',
      {
        title: 'Glückwunsch',
        caption: 'Jetzt weißt Du, wie es sich anfühlt, eine KI zu sein.',
        note: 'Bis zum Rand voll. Gut gemacht.',
      },
    ],
  ] as const)('closes the Episode with a full bar and the congratulation (%s)', (locale, said) => {
    // ARRANGE
    const slug = 'now-you-know-how-it-feels';
    const expected = { ...said, filled: STEPS.managing, current: '' };
    // ACT
    const slide = localized(slug, locale);
    const seen = bar(slug, locale);
    // ASSERT
    expect({
      title: slide.title,
      caption: slide.header?.caption,
      filled: seen.filled,
      current: seen.now,
      note: seen.note,
    }).toEqual(expected);
  });

  it('places the closing Slide last in the last Section', () => {
    // ARRANGE
    const expected = 'now-you-know-how-it-feels';
    // ACT
    const last = managingTheAttentionSpanSection.at(-1)?.slug;
    // ASSERT
    expect(last).toBe(expected);
  });

  it('keeps the Voice script of each changed Slide on what the screen says', () => {
    // ARRANGE
    const expected = [
      ['thought-experiment', "Let's start light, because you're human."],
      ['the-ais-attention-span', 'See if you can keep up.'],
      ['what-fills-the-window', "I'm not done yet, so try to keep up."],
      ['managing-the-attention-span', 'You made it, almost. Just one more thing'],
      ['now-you-know-how-it-feels', 'Now you know how it feels to be an AI'],
    ] as const;
    // ACT
    const spoken = expected.map(([slug]) =>
      localized(slug, 'en')
        .voiceScript.map((segment) => segment.script)
        .join(' '),
    );
    // ASSERT
    expected.forEach(([, line], i) => expect(spoken[i]).toContain(line));
  });
});

describe('failure cases', () => {
  it('refuses a Slide that asks the bar for a Section it does not have', () => {
    // ARRANGE
    const expected = 'unknown Section "nowhere"';
    // ACT
    const draw = () => renderToStaticMarkup(createElement(SessionBarPreset, { at: 'nowhere', locale: 'en' }));
    // ASSERT
    expect(draw).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('keeps every changed Slide in both locales free of a raw Translation key', () => {
    // ARRANGE
    const slugs = [
      'hero',
      'thought-experiment',
      'the-ais-attention-span',
      'what-fills-the-window',
      'managing-the-attention-span',
      'now-you-know-how-it-feels',
    ];
    // ACT
    const raw = slugs.flatMap((slug) =>
      (['en', 'de'] as const).filter((locale) => /\w+\.\w+\.\w+/.test(scene(slug, locale).text())),
    );
    // ASSERT
    expect(raw).toEqual([]);
  });
});
