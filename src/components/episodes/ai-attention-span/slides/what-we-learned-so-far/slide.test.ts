import { localizeSlide, type LocalizedSlide } from '@/components/slide-master/localized-slide';
import { slide, type Slide } from '@/components/slide-master/slide';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatWeLearnedSoFar } from './slide';

const SECTION = slide({
  slug: 'section',
  messages: { en: { title: 'Section' }, de: { title: 'Abschnitt' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, whatWeLearnedSoFar]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: 'ai-attention-span',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

describe('success cases', () => {
  it('names the two kinds of attention and the two learnings, in both locales', () => {
    // ARRANGE
    const expected = {
      en: {
        kickers: ['Human attention', 'AI attention (context window)'],
        bullets: [
          'Important information and decisions get lost in the middle.',
          'When the window is full, auto-compaction can drop details without telling you.',
        ],
        closing: 'Learn to manage attention: optional for you, mandatory for AI.',
      },
      de: {
        kickers: ['Menschliche Aufmerksamkeit', 'KI-Aufmerksamkeit (Kontextfenster)'],
        bullets: [
          'Wichtige Informationen und Entscheidungen gehen in der Mitte verloren.',
          'Ist das Fenster voll, kann die automatische Verdichtung Details verwerfen, ohne dass Du es merkst.',
        ],
        closing: 'Lerne, Aufmerksamkeit zu steuern: für Dich optional, für die KI Pflicht.',
      },
    };
    // ACT
    const read = (locale: Locale) => {
      const $ = scene(locale);
      return {
        kickers: $('[data-kicker]')
          .map((_, el) => $(el).text())
          .get(),
        bullets: $('[data-learning] li')
          .map((_, el) => $(el).text())
          .get(),
        closing: $('[data-closing]').text(),
      };
    };
    // ASSERT
    expect({ en: read('en'), de: read('de') }).toEqual(expected);
  });

  it('mounts the context window in Technical with its own Simple and Technical toggle', () => {
    // ARRANGE
    const expected = { preset: 'slide-6', toggles: ['Technical window'] };
    // ACT
    const $ = scene('en');
    const toggles = $('[data-cornerstone] button[data-control]')
      .map((_, el) => $(el).attr('aria-label'))
      .get();
    // ASSERT
    expect({ preset: $('[data-cornerstone]').attr('data-cornerstone'), toggles }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('no longer calls the left side the long phone call nor the right one the summer-party chat', () => {
    // ARRANGE
    const text = scene('en').text();
    // ACT
    const found = ['The long phone call', 'The summer-party chat'].filter((phrase) => text.includes(phrase));
    // ASSERT
    expect(found).toEqual([]);
  });
});

describe('edge cases', () => {
  it('keeps the three voice segments and the analogy note', () => {
    // ARRANGE
    const expected = {
      segments: ['same-effects', 'the-window-is-the-span', 'manage-it'],
      notes: ['two-kinds-of-evidence'],
    };
    // ACT
    const en = localized('en');
    // ASSERT
    expect({ segments: en.voiceScript.map((s) => s.slug), notes: en.notes.map((n) => n.slug) }).toEqual(expected);
  });
});
