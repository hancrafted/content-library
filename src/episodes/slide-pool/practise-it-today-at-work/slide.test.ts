import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import { load } from 'cheerio';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { practiseItTodayAtWork } from './slide';

const SECTION = slide({
  slug: 'from-execution-to-management',
  messages: {
    en: { title: 'From execution to management' },
    de: { title: 'Von der Ausführung zum Management' },
  },
  content: () => null,
});

function scene(): string {
  const placed = placeSections<Slide>([[SECTION, practiseItTodayAtWork]]).flat();
  const localized = localizeSlide(placed[1] as never, {
    episode: 'ai-gives-you-more-work',
    locale: 'en',
    placed,
    referenceLabels: {
      ref: 'opens speaker note',
      marker: (title) => `Speaker note: ${title}`,
    },
    header: 'shared',
  });
  return renderToStaticMarkup(localized.content);
}

function rules(): { selector: string; body: string }[] {
  const css = readFileSync(join(__dirname, 'reveal-steps.module.css'), 'utf8')
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/@media[^{]*\{/g, '');
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector = '', body = '']) => ({
    selector: selector.replaceAll(/\s+/g, ' ').trim(),
    body,
  }));
}

const resting = () => rules().filter((rule) => rule.selector.startsWith('.wall[data-step] [data-reveal]'));

describe('success cases', () => {
  it('dims a step not yet revealed in a form the contrast check measures: text by colour, the rest by opacity', () => {
    // ARRANGE
    const expected = { text: true, figures: true };
    // ACT
    const dimming = {
      text: resting().some((rule) => /\*$/.test(rule.selector) && /color:\s*var\(--muted-foreground\)/.test(rule.body)),
      figures: resting().some((rule) => /svg$/.test(rule.selector) && /opacity:\s*0\.25/.test(rule.body)),
    };
    // ASSERT
    expect(dimming).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never hides a step not yet revealed, nor dims it with a filter', () => {
    // ARRANGE
    const expected = { filter: false, hidden: false };
    // ACT
    const found = {
      filter: rules().some((rule) => /filter\s*:/.test(rule.body)),
      hidden: resting().some((rule) => /visibility:\s*hidden|display:\s*none|opacity:\s*0(?![.\d])/.test(rule.body)),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('never dims a claim: an element carrying `primary` sits under no step not yet revealed', () => {
    // ARRANGE
    const $ = load(scene());
    // ACT
    const dimmed = $('[class*="bg-primary"], [class*="border-primary"]')
      .filter((_, element) => $(element).closest('[data-reveal]').length > 0)
      .map((_, element) => $(element).text())
      .get();
    // ASSERT
    expect(dimmed).toEqual([]);
  });
});
