import { findEpisode } from '@/components/episodes/registry';
import { localizeSlide, type LocalizedSlide } from '@/components/slide-master/localized-slide';
import type { Slide } from '@/components/slide-master/slide';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { load, type CheerioAPI } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

/*
 * The second Section of "Why it's never too early to start with sales", "Why
 * sales is more than just selling", read through the registry and its record
 * and rendered as the container renders its Scenes. English is the approved
 * Dossier's text; German holds the same English strings as an explicit
 * provisional fallback until it is translated after Promotion.
 */

const SLUG = 'never-too-early-sales';
const OPENER = 'sales-beyond-selling';
const PAGE = 'sales-beyond-selling--sales-is-more-than-selling';

/** Every Slide of the Episode, localized and placed as its page renders it. */
function localizedSlides(locale: Locale): LocalizedSlide[] {
  const placed = placeSections<Slide>(findEpisode(SLUG).sections).flat();
  return placed.map((entry) => localizeSlide(entry, { episode: SLUG, locale, placed, refLabel: 'opens speaker note' }));
}

/** One localized Slide by its anchor. */
function slideAt(id: string, locale: Locale = 'en'): LocalizedSlide {
  const found = localizedSlides(locale).find((each) => each.id === id);
  if (found === undefined) throw new Error(`No Slide at "${id}".`);
  return found;
}

/** A Slide's Scene as static HTML, its screen-reader-only labels dropped so text reads as on screen. */
function sceneOf(id: string, locale: Locale = 'en'): CheerioAPI {
  const $ = load(renderToStaticMarkup(createElement(Fragment, null, slideAt(id, locale).content)));
  $('.sr-only').remove();
  return $;
}

/** An element's words as a reader meets them: text nodes in document order, one space apart. */
function wordsOf($: CheerioAPI, element: Parameters<CheerioAPI>[0]): string {
  const parts: string[] = [];
  const walk = (node: { type: string; data?: string; children?: unknown[] }): void => {
    if (node.type === 'text') parts.push(node.data ?? '');
    if (node.type === 'tag') (node.children as (typeof node)[] | undefined)?.forEach(walk);
  };
  $(element)
    .toArray()
    .forEach((node) => walk(node as unknown as { type: string }));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/** A Voice script as its segments' slug, beat title and spoken paragraph. */
function scriptOf(slide: LocalizedSlide) {
  return slide.voiceScript.map(({ slug, title, script }) => ({ slug, title, script }));
}

describe('success cases', () => {
  it('opens the second Section with its Dossier h2, no caption and its one Voice script beat, verbatim', () => {
    // ARRANGE
    const expected = {
      id: OPENER,
      level: 'h2',
      title: 'Why sales is more than just selling',
      notes: [],
      script: [
        {
          slug: 'use-the-lead-time',
          title: 'Use the lead time',
          script:
            'There is work between deciding to sell and receiving money. We can use that time deliberately. Our scheduling company can speak with potential customers while it is still building. Those conversations need a purpose. We want to test a route to a paying customer, not simply collect friendly conversations and call that sales.',
        },
      ],
      scene: 'Why sales is more than just selling',
    };
    // ACT
    const opener = slideAt(OPENER);
    const scene = wordsOf(sceneOf(OPENER), 'article');
    // ASSERT
    expect({
      id: opener.id,
      level: opener.level,
      title: opener.title,
      notes: opener.notes,
      script: scriptOf(opener),
      scene,
    }).toEqual(expected);
  });

  it('places "Sales is more than selling" under the second Section with its four Dossier Speaker notes and sources', () => {
    // ARRANGE
    const expected = {
      id: PAGE,
      level: 'h3',
      title: 'Sales is more than selling',
      notes: [
        {
          slug: 'two-different-intention-results',
          header: 'Two different intention results',
          description:
            "Murphy et al.'s stated-preference meta-analysis found a median hypothetical-to-actual willingness-to-pay ratio of 1.35 across 83 observations from 28 studies, with substantial skew. Morwitz et al. found weaker intention–purchase correlation for new than existing products. Neither result gives a correction factor for a B2B prospect or proves that all purchase intentions exaggerate demand [1] [2].",
          target: 'market-insight',
          sources: [
            {
              slug: 'murphy-hypothetical-bias',
              url: 'https://link.springer.com/article/10.1007/s10640-004-3332-z',
              title: 'Murphy et al., A Meta-analysis of Hypothetical Bias in Stated Preference Valuation',
            },
            {
              slug: 'morwitz-purchase-intentions',
              url: 'https://doi.org/10.1016/j.ijforecast.2007.05.015',
              title: 'Morwitz, Steckel and Gupta, When do purchase intentions predict sales?',
            },
          ],
        },
        {
          slug: 'history-has-counter-evidence',
          header: 'History has counter-evidence',
          description:
            'Poppo, Zhou and Ryu report that continuity expectations mediate the positive history–trust relationship; with weak continuity expectations, longer history was associated with lower trust. Doney and Cannon found no effect of trust on current supplier selection after controlling for previous experience and performance, although trust related to anticipated future interaction. These abstract-level findings are not proof that early startup outreach causes trust or purchases [1] [2].',
          target: 'trust-question',
          sources: [
            {
              slug: 'poppo-origins-of-trust',
              url: 'https://doi.org/10.1287/orsc.1070.0281',
              title:
                'Poppo, Zhou and Ryu, Alternative Origins to Interorganizational Trust: An Interdependence Perspective on the Shadow of the Past and the Shadow of the Future',
            },
            {
              slug: 'doney-cannon-buyer-seller-trust',
              url: 'https://doi.org/10.2307/1251829',
              title: 'Doney and Cannon, An Examination of the Nature of Trust in Buyer-Seller Relationships',
            },
          ],
        },
        {
          slug: 'commitment-is-not-trust',
          header: 'Commitment is not trust',
          description:
            'Anderson and Weitz studied idiosyncratic investments and commitment in 378 manufacturer–distributor pairs. That is evidence about commitment, not a measurement of trust; these concepts must not be interchanged [1].',
          target: 'customer-trust',
          sources: [
            {
              slug: 'anderson-weitz-pledges',
              url: 'https://doi.org/10.2307/3172490',
              title: 'Anderson and Weitz, The Use of Pledges to Build and Sustain Commitment in Distribution Channels',
            },
          ],
        },
        {
          slug: 'what-the-internal-learning-trial-tested',
          header: 'What the internal-learning trial tested',
          description:
            'Both groups of 116 Italian startups received feedback training; the treatment group additionally learned predictive frameworks and rigorous hypothesis tests, performed better and pivoted more. The trial did not isolate sales contact, measure capacity limits or compare feedback with no feedback [1].',
          target: 'internal-insight',
          sources: [
            {
              slug: 'camuffo-scientific-approach',
              url: 'https://doi.org/10.1287/mnsc.2018.3249',
              title:
                'Camuffo et al., A Scientific Approach to Entrepreneurial Decision Making: Evidence from a Randomized Control Trial',
            },
          ],
        },
      ],
    };
    // ACT
    const { id, level, title, notes } = slideAt(PAGE);
    // ASSERT
    expect({ id, level, title, notes }).toEqual(expected);
  });

  it('gives "Sales is more than selling" its six Voice script beats, verbatim', () => {
    // ARRANGE
    const expected = [
      {
        slug: 'test-an-offer-not-applause',
        title: 'Test an offer, not applause',
        script:
          "Suppose our founder offers to help a workshop organise next week's jobs. She names the scheduling problem, proposes a price and asks for a conversation about a small trial. Now she has something concrete to discuss. Does the buyer ask about the trial? Ask about the price? Or decline the conversation? Write down the response.",
      },
      {
        slug: 'learn-from-a-no',
        title: 'Learn from a no',
        script:
          "A workshop manager might say that scheduling is someone else's responsibility. Another might be interested, but not during its busy season. A third might not understand what would change. These imagined answers suggest different next questions. Ask who owns scheduling, when a discussion would make sense, or which part of the offer was unclear.",
      },
      {
        slug: 'early-buyers-are-a-small-sample',
        title: 'Early buyers are a small sample',
        script:
          'Our founder starts with two people she already knows. Both enjoy talking about software. Before rebuilding the product around their suggestions, she should speak with other kinds of buyers too. Perhaps a team without a technical enthusiast. Perhaps a team with a different way of scheduling. Compare the responses before making a large commitment.',
      },
      {
        slug: 'give-reasons-to-keep-talking',
        title: 'Give reasons to keep talking',
        script:
          'I would give the founder a small promise she can keep. Send the agreed trial outline on Friday. Admit which features are not ready. Arrive prepared for the next conversation. These are practical choices, not a recipe that guarantees trust. The buyer still decides whether to continue. A first message does not settle that decision.',
      },
      {
        slug: 'test-what-you-can-deliver',
        title: 'Test what you can deliver',
        script:
          "Now imagine the buyer asks for a trial next week. Our founder has to check what that promise would require. Can the team import this workshop's existing schedule? Who will answer questions? Write down what is known and what still needs testing. This is a possible delivery problem to investigate, not proof that the team cannot deliver.",
      },
      {
        slug: 'turn-contact-into-a-learning-loop',
        title: 'Turn contact into a learning loop',
        script:
          'Start with an assumption: a workshop wants help with scheduling. Make a specific offer. Record the response. Choose the next test from that response. If the question was unclear, rewrite it and try again. Do not change everything after every call. The purpose is to make better decisions while pursuing customers who may actually pay.',
      },
    ];
    // ACT
    const script = scriptOf(slideAt(PAGE));
    // ASSERT
    expect(script).toEqual(expected);
  });

  it('shows the three questions converging on the qualified trust note, then the separate conclusion', () => {
    // ARRANGE
    const expected = {
      caption: 'Three questions to work on together, not three proven causes of trust.',
      boxes: [
        'Market insight test a real offer',
        'Customer trust earn reasons to continue',
        'Internal insight test your promises',
      ],
      trust: 'Increase trust? A possibility to earn, not an automatic result of outreach',
      conclusion: 'Learn before you depend on the cash',
    };
    const $ = sceneOf(PAGE);
    // ACT
    const scene = {
      caption: wordsOf($, '[data-target="caption"]'),
      boxes: $('ul > li')
        .toArray()
        .map((box) => wordsOf($, box)),
      trust: wordsOf($, '[data-target="trust-question"]'),
      conclusion: wordsOf($, 'article > div > p'),
    };
    // ASSERT
    expect(scene).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('marks each note target on exactly one element, holding the Context reference that opens its note', () => {
    // ARRANGE
    const expected = [
      { target: 'market-insight', count: 1, refs: ['two-different-intention-results'] },
      { target: 'trust-question', count: 1, refs: ['history-has-counter-evidence'] },
      { target: 'customer-trust', count: 1, refs: ['commitment-is-not-trust'] },
      { target: 'internal-insight', count: 1, refs: ['what-the-internal-learning-trial-tested'] },
    ];
    const $ = sceneOf(PAGE);
    // ACT
    const marked = slideAt(PAGE).notes.map(({ target }) => ({
      target,
      count: $(`[data-target="${target}"]`).length,
      refs: $(`[data-target="${target}"] [data-context-ref]`)
        .toArray()
        .map((button) => $(button).attr('data-context-ref')),
    }));
    // ASSERT
    expect(marked).toEqual(expected);
  });

  it('gives the section slide no caption target, since the Dossier names no caption', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const captions = sceneOf(OPENER)('[data-target="caption"]').length;
    // ASSERT
    expect(captions).toBe(expected);
  });
});

describe('edge cases', () => {
  it('shows German readers the same convergence as an explicit provisional English fallback', () => {
    // ARRANGE
    const expected =
      'Sales is more than selling Three questions to work on together, not three proven causes of trust. Market insight test a real offer Customer trust earn reasons to continue Internal insight test your promises Increase trust? A possibility to earn, not an automatic result of outreach Learn before you depend on the cash';
    // ACT
    const german = wordsOf(sceneOf(PAGE, 'de'), 'article');
    // ASSERT
    expect(german).toBe(expected);
  });

  it('keeps the dashed connector decorative: hidden from assistive technology, with no words of its own', () => {
    // ARRANGE
    const expected = { connectors: 1, dashedPaths: 3, words: '' };
    const $ = sceneOf(PAGE);
    // ACT
    const hidden = $('article [aria-hidden="true"]').has('svg');
    const seen = {
      connectors: hidden.length,
      dashedPaths: hidden.find('path[stroke-dasharray]').length,
      words: wordsOf($, hidden),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('shows German readers the section slide as an explicit provisional English fallback', () => {
    // ARRANGE
    const expected = {
      title: 'Why sales is more than just selling',
      script: [
        {
          slug: 'use-the-lead-time',
          title: 'Use the lead time',
          script:
            'There is work between deciding to sell and receiving money. We can use that time deliberately. Our scheduling company can speak with potential customers while it is still building. Those conversations need a purpose. We want to test a route to a paying customer, not simply collect friendly conversations and call that sales.',
        },
      ],
    };
    // ACT
    const german = { title: slideAt(OPENER, 'de').title, script: scriptOf(slideAt(OPENER, 'de')) };
    // ASSERT
    expect(german).toEqual(expected);
  });
});
