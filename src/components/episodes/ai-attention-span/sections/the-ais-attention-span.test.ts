import { localizeSlide } from '@/components/slide-master/localized-slide';
import type { Slide } from '@/components/slide-master/slide';
import { placeSections } from '@/lib/episode.pure';
import { load, type CheerioAPI } from 'cheerio';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { aiAttentionSpan } from '../ai-attention-span';
import { theAisAttentionSpanSection } from './the-ais-attention-span';

/*
 * The Section "The AI's attention span" against its approved Spec: its Slides in Spec order, each Voice script item
 * and Speaker note word for word, and each Slide's Context markers where the picked Option's mock puts them.
 */

const SPEC = path.join(process.cwd(), 'docs/episodes/ai-attention-span/spec/spec.html');
const SECTION = 'the-ais-attention-span';

const spec: CheerioAPI = load(readFileSync(SPEC, 'utf8'));
const squash = (text: string) => text.replace(/\s+/g, ' ').trim();
/** A list item's own text after its `<strong>` title and the dash, without its nested source list. */
function itemText($item: ReturnType<CheerioAPI>): string {
  const copy = $item.clone();
  copy.find('ul, ol').remove();
  copy.children('strong').first().remove();
  return squash(copy.text()).replace(/^[—–-]\s*/, '');
}

interface SpecSlide {
  readonly slug: string;
  readonly title: string;
  readonly script: readonly { title: string; script: string }[];
  readonly notes: readonly { header: string; description: string; urls: readonly string[] }[];
}

/** Each page Slide of the Section in the Spec, in order. */
function specSlides(): SpecSlide[] {
  return spec(`section#${SECTION} article[data-spec="slide"]`)
    .toArray()
    .map((article) => {
      const $a = spec(article);
      const items = (list: string) =>
        $a
          .find(`[data-panel] ol[data-spec="${list}"] > li`)
          .toArray()
          .map((li) => spec(li));
      return {
        slug: $a.attr('id') ?? '',
        title: squash($a.find('header h3').first().text()),
        script: items('voice-script').map(($li) => ({
          title: squash($li.children('strong').first().text()),
          script: itemText($li),
        })),
        notes: items('speaker-notes').map(($li) => ({
          header: squash($li.children('strong').first().text()),
          description: itemText($li).replace(/\[\d+\]/g, ''),
          urls: $li
            .find('[data-source] a')
            .toArray()
            .map((a) => spec(a).attr('href') ?? ''),
        })),
      };
    });
}

/** Where Han's feedback batch 2 departs from the Spec: Slide 4's retitle and its added context-rot note. */
const RETITLED = { 'what-happens-when-the-bar-fills-up': 'What happens when the context fills up' } as const;
const ADDED_NOTES = ['Context rot'];

/**
 * Voice script items Han's batch-2 decisions re-wrote to match the new screen (items 6 and the Slide 5 fix), by Slide
 * and Spec title; each is the new words, the Spec's segment order and the rest of the Spec's script kept.
 */
const REWRITTEN_SCRIPT: Readonly<Record<string, Readonly<Record<string, { title?: string; script: string }>>>> = {
  'attention-is-a-budget': {
    'A hundred units': {
      title: 'Attention as a budget',
      script:
        "Think of attention as a budget. On the left is the timeline, in the middle the window as a bar, and on the right the attention each message gets. And I say it plainly: these numbers, the token counts and the window sizes on this slide are illustrative. I made them up to show the shape, so please don't take them as measurements.",
    },
  },
  'what-we-learned-so-far': {
    'Same effects': {
      script:
        "Let's put it together. On the left, human attention: our memory follows the primacy and recency effects, so we recall the start, the end and the standout, and the middle blurs. On the right, AI attention shows the same shape in the context window.",
    },
    'The window is the span': {
      script:
        "The reason is that the AI's attention span is its context window, a limited space that fills with every message. That gives two lessons: important information and decisions get lost in the middle, and when the window is full, auto-compaction can drop details without telling you. Use the toggle on the window to switch between the plain view and the technical one.",
    },
    'Manage it': {
      script:
        'So learn to manage attention. For you it is optional, you will get by with a bad memory; for the AI it is mandatory. The rest of the episode is about what goes into that window, and what you do about it.',
    },
  },
};

const placed = placeSections<Slide>(aiAttentionSpan.sections).flat();

function localized(slide: Slide, locale: 'en' | 'de' = 'en') {
  const own = placed.find((entry) => entry.slide === slide);
  if (own === undefined) throw new Error(`No Slide "${slide.slug}" placed.`);
  return localizeSlide(own, {
    episode: 'ai-attention-span',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const pageSlides = theAisAttentionSpanSection.slice(1);
const bySlug = (slug: string) => {
  const found = pageSlides.find((slide) => slide.slug === slug);
  if (found === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  return found;
};
const scene = (slug: string, locale: 'en' | 'de' = 'en') =>
  load(renderToStaticMarkup(createElement(Fragment, null, localized(bySlug(slug), locale).content)));
const markers = ($: CheerioAPI) =>
  $('[data-context-ref]')
    .toArray()
    .map((el) => $(el).attr('data-context-ref'));

describe('success cases', () => {
  it('places the four page Slides after the section slide, in Spec order', () => {
    // ARRANGE
    const expected = [
      'the-context-window',
      'what-happens-when-the-bar-fills-up',
      'attention-is-a-budget',
      'what-we-learned-so-far',
    ];
    // ACT
    const slugs = { spec: specSlides().map(({ slug }) => slug), built: pageSlides.map((slide) => slide.slug) };
    // ASSERT
    expect(slugs).toEqual({ spec: expected, built: expected });
  });

  it('lists each Slide under its Spec h3, and speaks its Voice script word for word', () => {
    // ARRANGE
    const expected = specSlides().map(({ slug, title, script }) => ({
      slug,
      title: RETITLED[slug as keyof typeof RETITLED] ?? title,
      script: script.map((item) => ({ ...item, ...REWRITTEN_SCRIPT[slug]?.[item.title] })),
    }));
    // ACT
    const actual = pageSlides.map((slide) => {
      const text = localized(slide);
      return {
        slug: slide.slug,
        title: text.title,
        script: text.voiceScript.map((segment) => ({ title: segment.title, script: segment.script })),
      };
    });
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries every Spec Speaker note with its words and its sources', () => {
    // ARRANGE
    const expected = specSlides().map(({ notes }) => notes);
    // ACT
    const actual = pageSlides.map((slide) =>
      localized(slide)
        .notes.filter((note) => !ADDED_NOTES.includes(note.header))
        .map((note) => ({
          header: note.header,
          description: squash(note.description.replace(/\[\d+\]/g, '')),
          urls: (note.sources ?? []).map((source) => source.url),
        })),
    );
    // ASSERT
    expect(actual.map((notes) => notes.map(({ header, description }) => ({ header, description })))).toEqual(
      expected.map((notes) => notes.map(({ header, description }) => ({ header, description: squash(description) }))),
    );
    // Every Spec source is cited; Slide 5's "The U-shape is measured" also cites Lost in the Middle, as its build notes add.
    expected.forEach((notes, slide) =>
      notes.forEach((note, index) => expect(actual[slide][index].urls).toEqual(expect.arrayContaining([...note.urls]))),
    );
  });

  it('mounts the cornerstone by each Slide’s Preset', () => {
    // ARRANGE
    const expected = {
      'the-context-window': ['slide-3'],
      'what-happens-when-the-bar-fills-up': ['slide-4'],
      'attention-is-a-budget': ['slide-5'],
      'what-we-learned-so-far': ['slide-6'],
    };
    // ACT
    const actual = Object.fromEntries(
      Object.keys(expected).map((slug) => {
        const $ = scene(slug);
        return [
          slug,
          $('[data-cornerstone]')
            .toArray()
            .map((el) => $(el).attr('data-cornerstone')),
        ];
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('puts a Context marker wherever each mock shows one, opening the note its build notes name', () => {
    // ARRANGE
    const expected = {
      'the-context-window': [
        'the-model-keeps-nothing',
        'replies-feed-back-in',
        'both-directions-count',
        'apps-may-differ',
      ],
      'what-happens-when-the-bar-fills-up': [
        'what-the-studies-measure',
        'extra-material-makes-it-worse',
        'mostly-synthetic-tests',
      ],
      'attention-is-a-budget': [
        'the-u-shape-is-measured',
        'the-start-is-weighted',
        'the-attention-budget',
        'no-single-line',
      ],
      'what-we-learned-so-far': ['two-kinds-of-evidence'],
    };
    // ACT
    const actual = Object.fromEntries(Object.keys(expected).map((slug) => [slug, markers(scene(slug))]));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('draws Slide 5 without the strip card, with the Lost in the middle label after the cornerstone and an arrow into it', () => {
    // ARRANGE
    const expected = { strips: 0, label: 1, arrows: 1, labelAfterContext: true };
    // ACT
    const $ = scene('attention-is-a-budget');
    const label = $('[data-lost-label]');
    // ASSERT
    expect({
      strips: $('[data-strip-group]').length,
      label: label.length,
      arrows: label.children('div').children('svg').length,
      labelAfterContext: $.html().indexOf('data-cornerstone') < $.html().indexOf('data-lost-label'),
    }).toEqual(expected);
  });

  it('titles Slide 4 on the context filling up and ends its caption on a marker to the context-rot note', () => {
    // ARRANGE
    const expected = { title: 'What happens when the context fills up', note: 'what-is-context-rot' };
    // ACT
    const text = localized(bySlug('what-happens-when-the-bar-fills-up'));
    // ASSERT
    expect({ title: text.title, note: text.header?.captionNote?.note }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('cites no source a note does not carry, in either locale', () => {
    // ARRANGE
    const notes = pageSlides.flatMap((slide) => [...localized(slide, 'en').notes, ...localized(slide, 'de').notes]);
    // ACT
    const outOfRange = notes.filter((note) =>
      [...note.description.matchAll(/\[(\d+)\]/g)].some(([, n]) => Number(n) > (note.sources ?? []).length),
    );
    // ASSERT
    expect(outOfRange.map((note) => note.header)).toEqual([]);
  });
});

describe('edge cases', () => {
  it('renders every Slide in German without a missing word', () => {
    // ARRANGE
    const expected = pageSlides.map((slide) => slide.slug);
    // ACT
    const rendered = pageSlides.filter((slide) => scene(slide.slug, 'de')('[data-cornerstone]').length === 1);
    // ASSERT
    expect(rendered.map((slide) => slide.slug)).toEqual(expected);
  });
});
