import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { explorableData } from './brief-or-pay-the-price-data';
import { WorkflowLevel } from './workflow-level.client';

const render = (locale: 'en' | 'de', step: number) => {
  const data = explorableData(locale);
  return load(
    renderToStaticMarkup(
      createElement(WorkflowLevel, {
        words: data.words.workflow,
        slice: { step, playing: false },
        counters: data.matrix.counters,
        braceRows: data.definitions.brace.rows,
        shown: data.scenarios.drive!,
        onNode: () => undefined,
        onStep: () => undefined,
        onPlay: () => undefined,
        onTick: () => undefined,
      }),
    ),
  );
};
const LAST = 5;

describe('success cases', () => {
  it('names the step in a polite live region: letter, name and its line (Seam 3)', () => {
    // ARRANGE
    const $ = render('en', 3);
    // ACT
    const caption = $('[data-workflow-foot] [data-step-caption]');
    // ASSERT
    expect(caption.attr('aria-live')).toBe('polite');
    expect(caption.find('strong').text()).toBe('A · Autonomy through intent');
    expect(caption.text()).toContain('Give each agent the intent, the goal and the why');
    expect(caption.find('[data-step-gloss]')).toHaveLength(0);
  });

  it('adds the German gloss beside the name in de, marked as German', () => {
    // ARRANGE
    const $ = render('de', 1);
    const gloss = explorableData('de').definitions.brace.rows[0]!.words.gloss;
    // ACT
    const found = $('[data-step-caption] [data-step-gloss]');
    // ASSERT
    expect(gloss).not.toBe('');
    expect(found.attr('lang')).toBe('de');
    expect(found.text()).toBe(`(${gloss})`);
    expect($('[data-step-caption]').text()).toContain('Starte bei 🏁');
  });

  it('puts Previous and Next around the BRACE letters, named in en and de', () => {
    // ARRANGE
    const en = render('en', 3);
    const de = render('de', 3);
    // ACT
    const order = en('[data-brace-steps] button')
      .toArray()
      .map((el) => en(el).attr('data-step-neighbour') ?? en(el).attr('data-step-go') ?? 'play');
    // ASSERT
    expect(order).toEqual(['previous', '1', '2', '3', '4', '5', 'next', 'play']);
    expect(en('[data-step-neighbour="previous"]').attr('aria-label')).toBe('Previous step');
    expect(en('[data-step-neighbour="next"]').attr('aria-label')).toBe('Next step');
    expect(de('[data-step-neighbour="previous"]').attr('aria-label')).toBe('Voriger Schritt');
    expect(de('[data-step-neighbour="next"]').attr('aria-label')).toBe('Nächster Schritt');
  });
});

describe('failure cases', () => {
  it('disables Previous at B and Next at E, so the steps stay bounded', () => {
    // ARRANGE
    const first = render('en', 1);
    const last = render('en', LAST);
    // ACT
    const disabled = (page: typeof first, go: string) => page(`[data-step-neighbour="${go}"]`).is('[disabled]');
    // ASSERT
    expect([disabled(first, 'previous'), disabled(first, 'next')]).toEqual([true, false]);
    expect([disabled(last, 'previous'), disabled(last, 'next')]).toEqual([false, true]);
  });
});

describe('edge cases', () => {
  it('captions the first letter before any step is chosen', () => {
    // ARRANGE
    const $ = render('en', 0);
    // ACT
    const heading = $('[data-step-caption] strong').text();
    // ASSERT
    expect(heading).toBe('B · Backwards from the goal');
  });
});
