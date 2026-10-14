import { episodeStatus, listEpisodes } from '@/components/episodes/episode-repository';
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
 * The Upcoming Episode "Why it's never too early to start with sales", read
 * through the registry, the repository and its record. English is the
 * approved Dossier's text; German holds the same English strings as an
 * explicit provisional fallback until it is translated after Promotion.
 */

const SLUG = 'never-too-early-sales';

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

const WATCH = 'why-cashflow-matters--watch-your-cashflow';

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
  it('gives the Title slide the Dossier title and the approved caption and description, in both locales', () => {
    // ARRANGE
    const expected = {
      title: "Why it's never too early to start with sales",
      caption:
        'Revenue arrives months after the costs that create it. Find your zero-cash month, then start the sales pipeline before you need the money.',
      description:
        'Why early-stage founders should start sales long before revenue is needed, and the first concrete steps to build a sales pipeline.',
    };
    // ACT
    const { en, de } = findEpisode(SLUG).messages;
    // ASSERT
    expect(en).toEqual(expected);
    expect(de).toEqual(expected);
  });

  it('lists the Episode as Upcoming economics Foundations, with no Tags, extra Topics or publication date', () => {
    // ARRANGE
    const expected = { slug: SLUG, status: 'upcoming', topic: 'economics', format: 'foundations', tags: [] };
    // ACT
    const metadata = listEpisodes().find(({ slug }) => slug === SLUG);
    // ASSERT
    expect(metadata).toEqual(expected);
  });

  it('opens the first Section with its Dossier h2 and the two Voice script beats, verbatim', () => {
    // ARRANGE
    const expected = {
      id: 'why-cashflow-matters',
      level: 'h2',
      title: 'Why watching cashflow is mission critical',
      notes: [],
      script: [
        {
          slug: 'a-good-deal-a-bad-date',
          title: 'A good deal, a bad date',
          script:
            'Imagine winning a million-dollar customer and still running out of money. Our fictional company builds scheduling software for small teams. Its big customer pays in April. But the company cannot fund its March bills. The deal sounds wonderful. The date makes it useless for getting through March. How did we get here?',
        },
        {
          slug: 'work-backwards-from-cash',
          title: 'Work backwards from cash',
          script:
            "Let us put ourselves in the founders' position. They are building the product. They are paying people. They plan to focus on sales when the product feels ready. Before making that decision, they need a different starting point. When must money reach their account? We will work backwards from that deadline.",
        },
      ],
    };
    // ACT
    const opener = slideAt('why-cashflow-matters');
    // ASSERT
    expect({
      id: opener.id,
      level: opener.level,
      title: opener.title,
      notes: opener.notes,
      script: scriptOf(opener),
    }).toEqual(expected);
  });

  it('places "Watch your cashflow" under the first Section with its Dossier Speaker notes and sources', () => {
    // ARRANGE
    const expected = {
      id: 'why-cashflow-matters--watch-your-cashflow',
      level: 'h3',
      title: 'Watch your cashflow',
      notes: [
        {
          slug: 'recognition-has-its-own-trigger',
          header: 'Recognition has its own trigger',
          description:
            'IFRS 15 ties revenue recognition to satisfying a performance obligation through transfer of a good or service. That accounting trigger is not the receipt of cash; the board is deliberately not an income statement [1].',
          target: 'basis',
          sources: [
            {
              slug: 'eu-regulation-2016-1905',
              url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R1905',
              title:
                'European Commission, Regulation (EU) 2016/1905 (endorsing IFRS 15 Revenue from Contracts with Customers)',
            },
          ],
        },
        {
          slug: 'expenses-and-payments-can-differ-too',
          header: 'Expenses and payments can differ too',
          description:
            'Publication 538 distinguishes incurred expenses under accrual accounting from paid expenses under cash accounting. It describes US tax accounting, not a universal financial-reporting rule; this example explicitly assumes costs are paid monthly [1].',
          target: 'rule',
          sources: [
            {
              slug: 'irs-publication-538',
              url: 'https://www.irs.gov/publications/p538',
              title: 'Internal Revenue Service, Publication 538: Accounting Periods and Methods',
            },
          ],
        },
      ],
    };
    // ACT
    const { id, level, title, notes } = slideAt('why-cashflow-matters--watch-your-cashflow');
    // ASSERT
    expect({ id, level, title, notes }).toEqual(expected);
  });

  it('gives "Watch your cashflow" its six Voice script beats, verbatim', () => {
    // ARRANGE
    const expected = [
      {
        slug: 'count-january-first',
        title: 'Count January first',
        script:
          'We give this company one hundred thousand dollars at the start of January. Each month, it pays out fifty thousand dollars. Nothing comes in during January. Subtract fifty thousand from one hundred thousand. January ends with fifty thousand dollars. These are invented numbers. Keep them in mind, because we will return to this company.',
      },
      {
        slug: 'zero-is-the-warning',
        title: 'Zero is the warning',
        script:
          "February starts with the remaining fifty thousand dollars. Another fifty thousand goes out. Now the account is empty. March needs another fifty thousand, but there is nothing to pay it with. April's million does not solve March. In this example, nobody has agreed to lend the missing money. The company has to stop.",
      },
      {
        slug: 'a-signature-cannot-pay-payroll',
        title: 'A signature cannot pay payroll',
        script:
          "Imagine the founder celebrating a signed contract while preparing the next payroll payment. The bank asks for available money, not a signature. So do not stop at the deal date or the revenue figure in your plan. For this decision, ask one plain question. On which date can we actually use the customer's money?",
      },
      {
        slug: 'build-your-own-monthly-view',
        title: 'Build your own monthly view',
        script:
          'Build a simple month-by-month cashflow view. A spreadsheet is enough. Start each month with its opening cash. Add the customer money you expect to receive that month. Subtract the payments you expect to make. That gives closing cash. Carry it into the next month. Repeat this calculation across the months ahead.',
      },
      {
        slug: 'mark-the-zero-cash-month',
        title: 'Mark the zero-cash month',
        script:
          'Find the first month whose closing cash reaches zero or goes below it. Mark that month. Then try a less comfortable version of your plan. Move an expected receipt back a month. What changes? If the balance gets tight, check the individual payment dates too. A monthly total can hide a difficult week.',
      },
      {
        slug: 'do-not-wait-for-the-alarm',
        title: 'Do not wait for the alarm',
        script:
          "Our founders can see the March problem while they still have January's money. That is the moment to ask what work must happen before a customer pays. Waiting until the account is empty leaves no room for that work. The cashflow view is not just a warning. It tells us why we need a pipeline.",
      },
    ];
    // ACT
    const script = scriptOf(slideAt('why-cashflow-matters--watch-your-cashflow'));
    // ASSERT
    expect(script).toEqual(expected);
  });

  it('shows the fictional board month by month, each amount and status written out', () => {
    // ARRANGE
    const expected = [
      { tone: 'neutral', text: 'January Opening cash $100,000 Cash costs $50,000 Receipts $0 Closing cash $50,000' },
      {
        tone: 'warning',
        text: 'February Zero-cash month Opening cash $50,000 Cash costs $50,000 Receipts $0 Closing cash $0',
      },
      { tone: 'neutral', text: 'March Cash costs $50,000 Cannot fund $50,000 payment' },
      { tone: 'neutral', text: 'April Cash costs $50,000 Customer receipt $1,000,000 Too late without bridge funding' },
    ];
    const $ = sceneOf(WATCH);
    // ACT
    const months = $('figure ol > li')
      .toArray()
      .map((month) => ({ tone: $(month).attr('data-tone'), text: wordsOf($, month) }));
    // ASSERT
    expect(months).toEqual(expected);
  });

  it('marks the failure path in status tones beside its words, and the basis and rule as note targets', () => {
    // ARRANGE
    const expectedToned = [
      { tone: 'warning', text: 'Closing cash $0' },
      { tone: 'destructive', text: 'Cash costs $50,000 Cannot fund $50,000 payment' },
      { tone: 'warning', text: 'Customer receipt $1,000,000 Too late without bridge funding' },
    ];
    const expectedTargets = {
      basis: { text: 'Fictional example · cash received, not booked revenue', ref: 'recognition-has-its-own-trigger' },
      rule: { text: 'Closing cash = opening cash + receipts − payments', ref: 'expenses-and-payments-can-differ-too' },
    };
    const $ = sceneOf(WATCH);
    // ACT
    const toned = $('figure ol [data-state]')
      .toArray()
      .filter((paper) => $(paper).attr('data-tone') !== 'neutral')
      .map((paper) => ({ tone: $(paper).attr('data-tone'), text: wordsOf($, paper) }));
    const targetOf = (name: string) => ({
      text: wordsOf($, `[data-target="${name}"]`),
      ref: $(`[data-target="${name}"] [data-context-ref]`).attr('data-context-ref'),
    });
    const targets = { basis: targetOf('basis'), rule: targetOf('rule') };
    // ASSERT
    expect(toned).toEqual(expectedToned);
    expect(targets).toEqual(expectedTargets);
  });

  it('puts the verdict and the separate hypothetical strip below the rule', () => {
    // ARRANGE
    const expectedStamp = 'Bankrupt';
    const expectedBelow =
      "Bankrupt Scenario shorthand: unable to pay March's costs If funded: March −$50,000; April $900,000";
    const expectedStrip = {
      state: 'counterfactual',
      tone: 'neutral',
      text: 'If funded: March −$50,000; April $900,000',
    };
    const $ = sceneOf(WATCH);
    // ACT
    const below = wordsOf($, $('figure > div').last());
    const stamp = wordsOf($, 'figure > div p.uppercase');
    const strip = $('figure > div [data-state]')
      .toArray()
      .map((paper) => ({
        state: $(paper).attr('data-state'),
        tone: $(paper).attr('data-tone'),
        text: wordsOf($, paper),
      }));
    // ASSERT
    expect(stamp).toBe(expectedStamp);
    expect(below).toBe(expectedBelow);
    expect(strip).toEqual([expectedStrip]);
  });
});

describe('failure cases', () => {
  it('marks each note target on exactly one element of its own Slide', () => {
    // ARRANGE
    const expected = { basis: 1, rule: 1 };
    const $ = sceneOf(WATCH);
    // ACT
    const counts = { basis: $('[data-target="basis"]').length, rule: $('[data-target="rule"]').length };
    // ASSERT
    expect(counts).toEqual(expected);
  });
  it('never reads as published while it is Upcoming', () => {
    // ARRANGE
    const published = 'published';
    // ACT
    const status = episodeStatus(SLUG);
    // ASSERT
    expect(status).not.toBe(published);
  });
});

describe('edge cases', () => {
  it('shows German readers the approved English board as an explicit provisional fallback', () => {
    // ARRANGE
    const expected = [
      'Watch your cashflow',
      "In this fictional example, cash reaches $0 in February, so March's $50,000 payment goes unfunded before April's $1,000,000 receipt arrives.",
      'Fictional example · cash received, not booked revenue',
      'January Opening cash $100,000 Cash costs $50,000 Receipts $0 Closing cash $50,000',
      'February Zero-cash month Opening cash $50,000 Cash costs $50,000 Receipts $0 Closing cash $0',
      'March Cash costs $50,000 Cannot fund $50,000 payment',
      'April Cash costs $50,000 Customer receipt $1,000,000 Too late without bridge funding',
      'Closing cash = opening cash + receipts − payments',
      "Bankrupt Scenario shorthand: unable to pay March's costs If funded: March −$50,000; April $900,000",
    ].join(' ');
    // ACT
    const german = wordsOf(sceneOf(WATCH, 'de'), 'article');
    // ASSERT
    expect(german).toBe(expected);
  });
  it('declares no recording, Title Speaker notes or Title Voice script', () => {
    // ARRANGE
    const expected = { youtube: undefined, notes: undefined, segments: undefined };
    // ACT
    const { youtube, notes, segments } = findEpisode(SLUG);
    // ASSERT
    expect({ youtube, notes, segments }).toEqual(expected);
  });
});
