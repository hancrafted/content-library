import { localizeSlide } from '@/components/slide-master/localized-slide';
import type { Slide } from '@/components/slide-master/slide';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { fromExecutionToManagementSection } from './from-execution-to-management';

/*
 * The Section "From execution to management", as the approved Spec gives it: its section slide, then three page
 * Slides in Spec order, each built to its picked Option (1a, 2a, 3b). Every Context marker a picked Option's mock
 * shows outside the shared caption is a marker on the Slide, opening the Speaker note its build notes name.
 */

const PLACED = placeSections<Slide>([fromExecutionToManagementSection]).flat();

/** A Slide's Scene as the page renders it, with the shared Slide header. */
function sceneOf(slug: string, locale: Locale = 'en'): string {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  const localized = localizeSlide(own, {
    episode: 'ai-gives-you-more-work',
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  return renderToStaticMarkup(localized.content);
}

/** The disclosure stylesheet of a page Slide, as its rules: each selector with its declarations. */
function rulesOf(slug: string): { selector: string; body: string }[] {
  const css = readFileSync(join(__dirname, '../slides', slug, 'reveal-steps.module.css'), 'utf8')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/@media[^{]*\{/g, '');
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector = '', body = '']) => ({
    selector: selector.replaceAll(/\s+/g, ' ').trim(),
    body,
  }));
}

/** How many Context markers open each note, by note slug. */
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
    const expected = { 'many-skip-the-management-steps': 1, 'stepping-stone-break-it-down': 1 };
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

it('dims a step not yet revealed in a form the contrast check measures: text by colour, the rest by opacity', () => {
  // ARRANGE
  const slugs = ['every-revolution-one-card', 'you-were-promoted', 'practise-it-today-at-work'];
  const expected = slugs.map((slug) => ({ slug, filter: false, hidden: false, text: true, figures: true }));
  // ACT
  const resting = slugs.map((slug) => {
    const rules = rulesOf(slug).filter((rule) => rule.selector.startsWith('.wall[data-step] [data-reveal]'));
    return {
      slug,
      filter: rulesOf(slug).some((rule) => /filter\s*:/.test(rule.body)),
      hidden: rules.some((rule) => /visibility:\s*hidden|display:\s*none|opacity:\s*0(?![.\d])/.test(rule.body)),
      text: rules.some((rule) => /\*$/.test(rule.selector) && /color:\s*var\(--muted-foreground\)/.test(rule.body)),
      figures: rules.some((rule) => /svg$/.test(rule.selector) && /opacity:\s*0\.25/.test(rule.body)),
    };
  });
  // ASSERT
  expect(resting).toEqual(expected);
});

it('never dims a claim: an element carrying `primary` sits under no step not yet revealed', () => {
  // ARRANGE
  const slugs = ['every-revolution-one-card', 'you-were-promoted', 'practise-it-today-at-work'];
  const expected = slugs.map((slug) => ({ slug, dimmed: [] }));
  // ACT
  const claims = slugs.map((slug) => {
    const $ = load(sceneOf(slug));
    const dimmed = $('[class*="bg-primary"], [class*="border-primary"]')
      .filter((_, element) => $(element).closest('[data-reveal]').length > 0)
      .map((_, element) => $(element).text())
      .get();
    return { slug, dimmed };
  });
  // ASSERT
  expect(claims).toEqual(expected);
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
