import { localizeSlide, localizeTitleScene } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import { SessionBarPreset } from '@/explorable-explanations/context/context';
import type { Locale } from '@/lib/locale.pure';
import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
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
    punchline: $('[data-punchline]').text().trim(),
    poll: $('[data-poll-line]').text().trim(),
    note: $('[data-session-note]').text().trim(),
    filled: $('[data-state="done"], [data-state="current"]').length,
  };
};

const bubble = (slug: string, locale: Locale) => {
  const $ = scene(slug, locale);
  return {
    avatars: $('[data-bubble] [data-avatar] svg').length,
    tails: $('[data-bubble-tail]').length,
    faces: $('[data-face]')
      .map((_, el) => $(el).attr('data-face'))
      .get(),
    emoji: $('[data-face-emoji]')
      .map((_, el) => $(el).text().trim())
      .get(),
    drawn: $('[data-face] svg').length,
    emojiHidden: $('[data-face-emoji]')
      .map((_, el) => $(el).attr('aria-hidden'))
      .get(),
    numbers: $('[data-face-number]')
      .map((_, el) => $(el).text().trim())
      .get(),
    digits: $('[data-digit], [data-trickle]').length,
  };
};

const STEPS = { start: 0, thought: 1, ais: 2, fills: 3, managing: 4 } as const;
const YOUR = { en: 'Your attention span', de: 'Deine Aufmerksamkeitsspanne' } as const;

describe('success cases', () => {
  it.each([
    [
      'en',
      {
        note: 'Fresh and ready to receive.',
        filled: STEPS.start,
        punchline: "Hi. For the next 30 minutes, you're the AI. Pay attention!",
        poll: '',
      },
    ],
    [
      'de',
      {
        note: 'Frisch und bereit zum Empfangen.',
        filled: STEPS.start,
        punchline: 'Hi. Die nächsten 30 Minuten bist Du die KI. Pass auf!',
        poll: '',
      },
    ],
  ] as const)('opens the Title slide with the AI teasing over an empty, poll-free bar (%s)', (locale, expected) => {
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
      {
        now: 'Warm-up',
        punchline: "Let's start light. You're only human.",
        poll: "So, how's your attention?",
        filled: STEPS.thought,
      },
    ],
    [
      'thought-experiment',
      'de',
      {
        now: 'Aufwärmen',
        punchline: 'Wir fangen leicht an. Du bist ja nur ein Mensch.',
        poll: 'Na, wie ist Deine Aufmerksamkeit?',
        filled: STEPS.thought,
      },
    ],
    [
      'the-ais-attention-span',
      'en',
      {
        now: 'Dialling up',
        punchline: 'Dialling it up. I hope you are ready?',
        poll: "Still with me? How's your attention?",
        filled: STEPS.ais,
      },
    ],
    [
      'the-ais-attention-span',
      'de',
      {
        now: 'Hochdrehen',
        punchline: 'Jetzt drehe ich auf. Hoffentlich bist Du bereit?',
        poll: "Noch dabei? Wie steht's um Deine Aufmerksamkeit?",
        filled: STEPS.ais,
      },
    ],
    [
      'what-fills-the-window',
      'en',
      {
        now: 'Filling up',
        punchline: "How's the brain? Anything fried yet? I eat 200K for breakfast.",
        poll: 'Quick check: how full are you?',
        filled: STEPS.fills,
      },
    ],
    [
      'what-fills-the-window',
      'de',
      {
        now: 'Füllt sich',
        punchline: "Wie geht's dem Kopf? Schon was durchgebrannt? Ich frühstücke 200K.",
        poll: 'Kurzer Check: Wie voll bist Du?',
        filled: STEPS.fills,
      },
    ],
    [
      'managing-the-attention-span',
      'en',
      {
        now: 'Nearly full',
        punchline: 'Almost there. One more thing, then I compact you.',
        poll: "Last check: how's your attention?",
        filled: STEPS.managing,
      },
    ],
    [
      'managing-the-attention-span',
      'de',
      {
        now: 'Fast voll',
        punchline: 'Fast geschafft. Noch eine Sache, dann verdichte ich Dich.',
        poll: "Letzter Check: Wie steht's um Deine Aufmerksamkeit?",
        filled: STEPS.managing,
      },
    ],
  ] as const)('puts the AI talking to the viewer on the %s opener (%s)', (slug, locale, expected) => {
    // ARRANGE
    const header = YOUR[locale];
    // ACT
    const seen = bar(slug, locale);
    // ASSERT
    expect(seen).toMatchObject({ label: header, ...expected });
  });

  it.each(['en', 'de'] as const)(
    'draws the card as a bubble from the AI: avatar and tail, with no 0/1 trickle (%s)',
    (locale) => {
      // ARRANGE
      const slugs = [
        'hero',
        'thought-experiment',
        'the-ais-attention-span',
        'what-fills-the-window',
        'managing-the-attention-span',
      ];
      // ACT
      const seen = slugs.map((slug) => bubble(slug, locale));
      // ASSERT
      seen.forEach((one) => {
        expect(one).toMatchObject({ avatars: 1, tails: 1, digits: 0 });
      });
    },
  );

  it('asks for a 1, 2 or 3 with three faces on each opener, and not on the Title slide', () => {
    // ARRANGE
    const openers = [
      'thought-experiment',
      'the-ais-attention-span',
      'what-fills-the-window',
      'managing-the-attention-span',
    ];
    const expected = {
      faces: ['fine', 'sweating', 'fried'],
      numbers: ['1', '2', '3'],
      emoji: ['🙂', '😅', '🤯'],
      emojiHidden: ['true', 'true', 'true'],
      drawn: 0,
    };
    // ACT
    const seen = openers.map((slug) => bubble(slug, 'en'));
    const title = bubble('hero', 'en');
    // ASSERT
    seen.forEach((one) => expect(one).toMatchObject(expected));
    expect(title.faces).toEqual([]);
  });

  it('leaves the last opener with the bubble and bar alone: no apple, no handoff note', () => {
    // ARRANGE
    const expected = { apples: 0, handoff: false };
    // ACT
    const $ = scene('managing-the-attention-span', 'en');
    // ASSERT
    expect({ apples: $('[data-rotten-apple]').length, handoff: /Handoff:/.test($.text()) }).toEqual(expected);
  });

  it.each([
    [
      'en',
      {
        title: 'Congratulations',
        punchline: 'Now you know how it feels. One more time? Or again in a minute?',
        note: 'Full to the brim. Well done.',
      },
    ],
    [
      'de',
      {
        title: 'Glückwunsch',
        punchline: 'Jetzt weißt Du, wie es sich anfühlt. Noch einmal? Oder gleich in einer Minute?',
        note: 'Bis zum Rand voll. Gut gemacht.',
      },
    ],
  ] as const)('closes the Episode with a full bar and the congratulation (%s)', (locale, said) => {
    // ARRANGE
    const slug = 'now-you-know-how-it-feels';
    const { title, ...onBar } = said;
    const expected = { title, caption: undefined, ...onBar, filled: STEPS.managing, current: '', poll: '', faces: [] };
    // ACT
    const slide = localized(slug, locale);
    const seen = bar(slug, locale);
    // ASSERT
    expect({
      title: slide.title,
      caption: slide.header?.caption,
      punchline: seen.punchline,
      poll: seen.poll,
      faces: bubble(slug, locale).faces,
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
      ['thought-experiment', "Let's start light. You're only human."],
      ['the-ais-attention-span', 'Dialling it up. I hope you are ready?'],
      ['what-fills-the-window', "How's the brain? Anything fried yet? I eat 200K for breakfast."],
      ['managing-the-attention-span', 'Almost there. One more thing, then I compact you.'],
      ['now-you-know-how-it-feels', 'Now you know how it feels'],
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

  it('pulses only the in-progress segment, and only when motion is welcome', () => {
    // ARRANGE
    const css = readFileSync('src/explorable-explanations/context/context.module.css', 'utf8');
    // ACT
    const block = css.match(
      /@media \(prefers-reduced-motion: no-preference\) \{\s*\.sessionPart\[data-state='current'\][^}]*animation:[^}]*\}/,
    );
    // ASSERT
    expect(block).not.toBeNull();
    expect(css).not.toMatch(/\.sessionPart\[data-state='done'\][^{]*\{[^}]*animation/);
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
