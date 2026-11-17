import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { fromExecutionToManagementSection } from './from-execution-to-management';

const PLACED = placeSections<Slide>([fromExecutionToManagementSection]).flat();

function sceneOf(slug: string, locale: Locale = 'en'): string {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  const localized = localizeSlide(own, {
    episode: 'ai-gives-you-more-work',
    locale,
    placed: PLACED,
    referenceLabels: {
      ref: 'opens speaker note',
      marker: (title) => `Speaker note: ${title}`,
    },
    header: 'shared',
  });
  return renderToStaticMarkup(localized.content);
}

function markersOf(html: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const [, note] of html.matchAll(/data-context-ref="([^"]+)"/g)) counts[note] = (counts[note] ?? 0) + 1;
  return counts;
}

describe('success cases', () => {
  it('lists the section slide, then the three page Slides in Spec order', () => {
    // ARRANGE
    const expected = [
      'from-execution-to-management',
      'every-revolution-one-card',
      'you-were-promoted',
      'practise-it-today-at-work',
    ];
    // ACT
    const slugs = fromExecutionToManagementSection.map((each) => each.slug);
    // ASSERT
    expect(slugs).toEqual(expected);
  });

  it('marks the facts of "Every revolution, one card" as Option 1a does', () => {
    // ARRANGE
    const expected = {
      'tool-lifts-the-tasks': 2,
      'plough-is-the-weaker-card': 1,
      'some-workers-did-rise': 1,
      'steam-shifted-the-skill-mix': 1,
      'ai-completes-longer-tasks': 1,
      'same-prompt-answers-differently': 1,
      'gain-is-conditional': 1,
    };
    // ACT
    const markers = markersOf(sceneOf('every-revolution-one-card'));
    // ASSERT
    expect(markers).toEqual(expected);
  });

  it('marks the facts of "You were promoted" as Option 2a does', () => {
    // ARRANGE
    const expected = {
      'many-skip-the-management-steps': 1,
      'stepping-stone-break-it-down': 1,
    };
    // ACT
    const markers = markersOf(sceneOf('you-were-promoted'));
    // ASSERT
    expect(markers).toEqual(expected);
  });

  it('marks the facts of "Practise it today, at work" as Option 3b does', () => {
    // ARRANGE
    const expected = {
      'new-session-new-contributor': 1,
      'splitting-tasks-lengthens-them': 1,
      'briefing-context-checking': 1,
      'experience-predicts-results': 1,
    };
    // ACT
    const markers = markersOf(sceneOf('practise-it-today-at-work'));
    // ASSERT
    expect(markers).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('renders no heading in a Scene, since the shared Slide header owns it', () => {
    // ARRANGE
    const headings = /<h[1-3][\s>]/;
    // ACT
    const scenes = ['every-revolution-one-card', 'you-were-promoted', 'practise-it-today-at-work'].map((slug) =>
      sceneOf(slug),
    );
    // ASSERT
    expect(scenes.filter((html) => headings.test(html))).toEqual([]);
  });
});

describe('edge cases', () => {
  it('renders the German Scenes with the same markers as the English ones', () => {
    // ARRANGE
    const slugs = ['every-revolution-one-card', 'you-were-promoted', 'practise-it-today-at-work'];
    const expected = slugs.map((slug) => markersOf(sceneOf(slug)));
    // ACT
    const german = slugs.map((slug) => markersOf(sceneOf(slug, 'de')));
    // ASSERT
    expect(german).toEqual(expected);
  });
});
