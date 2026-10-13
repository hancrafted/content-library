import { localizeSlide } from '@/components/slide-master/localized-slide';
import { type Slide } from '@/components/slide-master/slide';
import { placeSections } from '@/lib/episode.pure';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { onboardAiLikeAColleagueRun2 } from './onboard-ai-like-a-colleague-run-2';

/*
 * Size comes from a role (FE-011 §3.1). The repo's `cn` is plain twMerge, which reads a size role such as
 * `text-caption` as a colour and drops it when a `text-<colour>` follows; the element then falls back to the
 * inherited size. Every element that sets a font weight is text the Slide styles on purpose, so it must keep a role;
 * only inline emphasis, a weight and a colour alone, takes the size of the line it sits in.
 */

const EPISODE = 'onboard-ai-like-a-colleague-run-2';
const SIZE_ROLE = /\btext-(?:hero|heading|subheading|body|caption)\b/;
const WEIGHT = /\bfont-(?:medium|semibold|bold)\b/;
const EMPHASIS = /^font-[a-z]+ text-[a-z-]+$/;

/** Every Slide of the Episode in English, rendered to static markup, as the server sends it. */
function renderedSlides(): [string, string][] {
  const placed = placeSections<Slide>(onboardAiLikeAColleagueRun2.sections).flat();
  return placed.map((own) => [
    own.slide.slug,
    renderToStaticMarkup(
      localizeSlide(own, { episode: EPISODE, locale: 'en', placed, refLabel: 'opens speaker note' }).content,
    ),
  ]);
}

/** The class lists that set a font weight but carry no size role. */
function weightedWithoutRole(html: string): string[] {
  return [...html.matchAll(/class="([^"]*)"/g)]
    .map(([, classes]) => classes)
    .filter((classes) => WEIGHT.test(classes) && !SIZE_ROLE.test(classes) && !EMPHASIS.test(classes));
}

/** One Slide's markup, by its slug. */
function slideHtml(slug: string): string {
  const found = renderedSlides().find(([own]) => own === slug);
  if (found === undefined) throw new Error(`No Slide "${slug}" in "${EPISODE}".`);
  return found[1];
}

describe('success cases', () => {
  it('keeps the size role of a text element whose colour follows it', () => {
    // ARRANGE
    const expected = [
      ['four-ways-to-onboard-ai', /class="text-caption font-semibold [^"]*text-primary-foreground/],
      ['from-your-desk-to-your-organization', /class="text-caption font-medium [^"]*text-muted-foreground/],
      ['your-day-one-note-before-you-type', /class="text-body font-semibold [^"]*text-primary-foreground/],
    ] as const;
    // ACT
    const htmls = expected.map(([slug]) => slideHtml(slug));
    // ASSERT
    expected.forEach(([, pattern], i) => expect(htmls[i]).toMatch(pattern));
  });
});

describe('failure cases', () => {
  it.each(renderedSlides())('keeps the size role on every weighted text element of %s', (_, html) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const dropped = weightedWithoutRole(html);
    // ASSERT
    expect(dropped).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('lets inline emphasis, a weight and a colour alone, take the size of its line', () => {
    // ARRANGE
    const expected = 'class="font-semibold text-primary"';
    // ACT
    const html = slideHtml('the-twist');
    // ASSERT
    expect(html).toContain(expected);
    expect(weightedWithoutRole(html)).toEqual([]);
  });
});
