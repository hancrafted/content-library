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
 * Section 4 of "Why it's never too early to start with sales", "Why building
 * an effective sales pipeline takes time", read through the registry, each
 * placed Slide's localized record and its rendered Scene. Expected text is
 * the approved Dossier's, written out by hand; German holds the same English
 * strings as an explicit provisional fallback until it is translated.
 */

const SLUG = 'never-too-early-sales';
const SECTION = 'why-pipeline-takes-time';
const WHAT_IS = `${SECTION}--what-is-a-sales-pipeline`;
const BY_NUMBERS = `${SECTION}--pipeline-by-the-numbers`;
const TOOLS = `${SECTION}--pipeline-tools-in-practice`;
const MARKETING = `${SECTION}--marketing-feeds-the-pipeline`;
const RAMP_UP = `${SECTION}--why-ramp-up-takes-time`;
const START_WHEN = `${SECTION}--cashflow-start-when`;
const SLIDES = [SECTION, WHAT_IS, BY_NUMBERS, TOOLS, MARKETING, RAMP_UP, START_WHEN];

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

/** A placed page Slide's record as the container and the Context drawer read it. */
function recordOf(id: string) {
  const { level, title, notes } = slideAt(id);
  return { id, level, title, notes, script: scriptOf(slideAt(id)) };
}

describe('success cases', () => {
  it('opens the Section with its Dossier h2 and its two Voice script beats, verbatim, with no notes', () => {
    // ARRANGE
    const expected = {
      id: 'why-pipeline-takes-time',
      level: 'h2',
      title: 'Why building an effective sales pipeline takes time',
      notes: [],
      script: [
        {
          slug: 'timing-needs-a-system',
          title: 'Timing needs a system',
          script:
            'One promising customer is not enough to tell our founder how her selling works. She needs to repeat the steps and keep records. Which conversations advance? Which stop? How much time passes before an agreement? A pipeline makes that work visible. Over time, those records can help her replace guesses with her own numbers.',
        },
        {
          slug: 'illustrations-are-not-forecasts',
          title: 'Illustrations are not forecasts',
          script:
            'We will use a small invented example to understand the numbers. It has a conversion rate and a duration. Neither describes what your company should expect. Think of it as practice with the calculation. When you make your own cash plan, use evidence from your selling work and be explicit about what you still do not know.',
        },
      ],
    };
    // ACT
    const opener = slideAt(SECTION);
    // ASSERT
    expect({
      id: opener.id,
      level: opener.level,
      title: opener.title,
      notes: opener.notes,
      script: scriptOf(opener),
    }).toEqual(expected);
  });
  it('places "What is a sales pipeline" in the Section with its Dossier h3, Speaker notes, sources and Voice script, verbatim', () => {
    // ARRANGE
    const expected = {
      id: 'why-pipeline-takes-time--what-is-a-sales-pipeline',
      level: 'h3',
      title: 'What is a sales pipeline',
      notes: [
        {
          slug: 'default-report-populations-differ',
          header: 'Default report populations differ',
          description:
            "Pipedrive's documented default deal-conversion report uses deals created in a period and marked won or lost, whereas HubSpot's funnel dates filter stage activity. Such reports do not automatically compare the same cohort, especially when open deals remain unresolved [1] [2].",
          target: 'definitions',
          sources: [
            {
              slug: 'pipedrive-deal-conversion',
              url: 'https://support.pipedrive.com/en/article/insights-reports-deal-conversion',
              title: 'Pipedrive, Insights reports: deal conversion',
            },
            {
              slug: 'hubspot-custom-funnel',
              url: 'https://knowledge.hubspot.com/reports/create-new-custom-funnel-reports',
              title: 'HubSpot, Create custom funnel reports',
            },
          ],
        },
        {
          slug: 'forecast-weights-are-settings',
          header: 'Forecast weights are settings',
          description:
            "HubSpot's default stage probabilities weight deal amounts and can be customised. A configured probability is not an observed stage-to-stage conversion rate and should not be presented as one [1].",
          target: 'offering',
          sources: [
            {
              slug: 'hubspot-pipelines',
              url: 'https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines',
              title: 'HubSpot, Set up and customize pipelines',
            },
          ],
        },
      ],
      script: [
        {
          slug: 'records-not-a-wish-list',
          title: 'Records, not a wish list',
          script:
            'A pipeline is our working record of potential deals. For each one, write its name, current stage, owner and dated next action. Birch is an opportunity with a scope meeting ahead. Alder still needs contact. Those entries tell the founder what to do. A wish that both companies will buy tells her very little.',
        },
        {
          slug: 'count-the-flow',
          title: 'Count the flow',
          script:
            'A funnel answers a different question. How many entered, and how many progressed? Count the researched leads. Then count which became opportunities and which became wins. Keep those categories clear. Adding ten names to the prospect list is more starting volume. It is not the same as opening ten opportunities with buyers.',
        },
        {
          slug: 'measure-conversion-with-a-denominator',
          title: 'Measure conversion with a denominator',
          script:
            'To measure conversion, divide the number that advanced by the number that entered. Say how many you started with. Follow that same starting group through the stages. For overall conversion, divide its wins by its original leads. If some are still open, show them separately. We cannot yet describe their final outcomes.',
        },
        {
          slug: 'conversion-raises-questions-about-the-offer',
          title: 'Conversion raises questions about the offer',
          script:
            "Suppose few of our founder's conversations move forward. She can examine the response notes. Did she reach people with the scheduling problem? Was her invitation clear? Did price become a sticking point? Was this simply the wrong time? The rate tells her where to look. It does not choose the explanation for her.",
        },
        {
          slug: 'measure-the-sales-cycle-explicitly',
          title: 'Measure the sales cycle explicitly',
          script:
            'Measure your sales cycle too. Choose a start and an end, then record both dates. In this talk, we use first contact to a won agreement. Count the elapsed time between them. Keep the receipt date in another field. That lets our founder ask both when she reached agreement and when the money became available.',
        },
        {
          slug: 'efficiency-is-not-speed-at-any-cost',
          title: 'Efficiency is not speed at any cost',
          script:
            "If Birch has waited a week for our founder's trial outline, sending it is a useful next action. If Birch needs an internal discussion, another daily reminder may not help. Look at what the elapsed time contains. More prospects, better progression and less avoidable waiting are different questions. Do not answer all three by demanding faster calls.",
        },
      ],
    };
    // ACT
    const record = recordOf('why-pipeline-takes-time--what-is-a-sales-pipeline');
    // ASSERT
    expect(record).toEqual(expected);
  });
  it('reads "What is a sales pipeline" as three questions, a pipeline beside a funnel, then the definitions footer', () => {
    // ARRANGE
    const expected = {
      caption: 'A pipeline is our working record of potential deals; a funnel counts how many progress.',
      questions: [
        'Volume how many enter each stage?',
        'Offering / conversion which advance?',
        'Efficiency / cycle how long does progress take?',
      ],
      figures: [
        'Pipeline: records and next actions Leads Opportunities Won',
        'Funnel: how many progress Leads Opportunities Won',
      ],
      definitions: 'Define entry, exit, cohort and dates before comparing numbers',
      refs: { offering: 'forecast-weights-are-settings', definitions: 'default-report-populations-differ' },
    };
    const $ = sceneOf(WHAT_IS);
    // ACT
    const seen = {
      caption: wordsOf($, '[data-target="caption"]'),
      questions: $('ul > li')
        .toArray()
        .map((note) => wordsOf($, note)),
      figures: $('figure')
        .toArray()
        .map((figure) => wordsOf($, figure)),
      definitions: wordsOf($, '[data-target="definitions"]'),
      refs: {
        offering: $('[data-target="offering"] [data-context-ref]').attr('data-context-ref'),
        definitions: $('[data-target="definitions"] [data-context-ref]').attr('data-context-ref'),
      },
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
  it('places "Pipeline by the numbers" in the Section with its Dossier h3, Speaker notes, sources and Voice script, verbatim', () => {
    // ARRANGE
    const expected = {
      id: 'why-pipeline-takes-time--pipeline-by-the-numbers',
      level: 'h3',
      title: 'Pipeline by the numbers',
      notes: [
        {
          slug: 'real-reports-may-skip-gates',
          header: 'Real reports may skip gates',
          description:
            "HubSpot permits optional funnel stages; Pipedrive counts won deals as completing every stage. Multiplying conditional rates is valid for the worked example's strict same-cohort sequence, not automatically for cumulative reached-stage percentages or arbitrary CRM exports [1] [2].",
          target: 'condition',
          sources: [
            {
              slug: 'hubspot-custom-funnel',
              url: 'https://knowledge.hubspot.com/reports/create-new-custom-funnel-reports',
              title: 'HubSpot, Create custom funnel reports',
            },
            {
              slug: 'pipedrive-deal-conversion',
              url: 'https://support.pipedrive.com/en/article/insights-reports-deal-conversion',
              title: 'Pipedrive, Insights reports: deal conversion',
            },
          ],
        },
        {
          slug: 'buying-groups-vary-without-a-measured-clock',
          header: 'Buying groups vary, without a measured clock',
          description:
            "Johnston and Bonoma studied 31 firms' capital-equipment and industrial-service buying groups and found differences in group structure and interaction. That supports variation by purchase situation, not a measured duration of the example's stages [1].",
          target: 'opportunity-work',
          sources: [
            {
              slug: 'johnston-bonoma-buying-center',
              url: 'https://doi.org/10.1177/002224298104500312',
              title: 'Johnston and Bonoma, The Buying Center: Structure and Interaction Patterns',
            },
          ],
        },
        {
          slug: 'public-procurement-is-a-bounded-special-case',
          header: 'Public procurement is a bounded special case',
          description:
            'EU public-procurement open procedures carry an ordinary 35-day tender-receipt minimum, with conditional shortening routes including qualifying prior notice, urgency and electronic submission. Those legal clocks have conditions and are not private-company sales-cycle benchmarks [1].',
          target: 'rail-label',
          sources: [
            {
              slug: 'eu-directive-2014-24',
              url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0024',
              title: 'European Parliament and Council, Directive 2014/24/EU on public procurement',
            },
          ],
        },
      ],
      script: [
        {
          slug: 'read-the-example-as-inputs',
          title: 'Read the example as inputs',
          script:
            'Imagine our scheduling company has finished working through a group of twenty-seven leads. We know the final outcomes for this invented group. Every win in this example went through an opportunity first. Nobody is still waiting for an answer. With those assumptions in place, we can practise counting the route from leads to deals.',
        },
        {
          slug: 'three-leads-for-one-opportunity',
          title: 'Three leads for one opportunity',
          script:
            'Nine of the twenty-seven leads became opportunities. Divide nine by twenty-seven. One third advanced. Another way to say it is three leads for each opportunity. That is a relationship between counts. It tells us nothing about how long any conversation took. For timing, we will need a separate set of dates.',
        },
        {
          slug: 'nine-opportunities-for-one-win',
          title: 'Nine opportunities for one win',
          script:
            'Of those nine opportunities, one became a won deal. One divided by nine is one ninth. Think about the work behind those nine records. Our founder still had conversations to prepare, questions to answer and proposals to discuss. Only one ended in a win. The other work happened too, even though it produced no agreement.',
        },
        {
          slug: 'multiply-only-this-consistent-path',
          title: 'Multiply only this consistent path',
          script:
            'For our invented group, multiply one third by one ninth. The result is one twenty-seventh, or about three point seven percent. We can check it directly: one win from twenty-seven original leads. That describes this completed example. Finding another twenty-seven names tomorrow would not entitle the founder to another win. She still has to do the work.',
        },
        {
          slug: 'add-the-time-on-a-different-rail',
          title: 'Add the time on a different rail',
          script:
            'Now give one successful path an invented timetable. Two weeks of lead work from first contact. Six months of opportunity work. Three months of closing. Assume those periods happen one after another. Counting two weeks as roughly half a month gives about nine and a half months to agreement. This is a timing illustration, not a forecast.',
        },
        {
          slug: 'the-buyer-has-work-too',
          title: 'The buyer has work too',
          script:
            "Imagine Birch's contact likes the trial proposal but wants a colleague to review it. Perhaps someone else must agree to the spending. Our founder should ask who needs to be involved and what the next decision requires. These are possible steps in this story. She should discover Birch's actual process rather than assume every buyer follows it.",
        },
        {
          slug: 'the-bank-deadline-comes-later-in-the-chain',
          title: 'The bank deadline comes later in the chain',
          script:
            'Our nine-and-a-half-month illustration ends at a win. Now place the agreed receipt date beside that endpoint. Does payment happen before delivery, during the work or afterwards? A prepaid arrangement would not add a waiting period after the win. Use the actual arrangement to connect the deal timetable to the cash plan.',
        },
      ],
    };
    // ACT
    const record = recordOf('why-pipeline-takes-time--pipeline-by-the-numbers');
    // ASSERT
    expect(record).toEqual(expected);
  });
  it('reads "Pipeline by the numbers" as a labelled count funnel, then a separate time rail ending before cash', () => {
    // ARRANGE
    const expected = {
      caption: 'An invented, completed cohort: the ratios count progress; the time rail adds duration separately.',
      disclaimer: 'Illustration, not benchmark',
      funnelLabel: '27 leads → 9 opportunities → 1 won deal',
      funnel:
        '27 leads 3 leads : 1 opportunity · 1/3 advance 9 opportunities 9 opportunities : 1 deal · 1/9 advance 1 won deal 27 leads : 1 deal · 1/27 ≈ 3.7% overall One completed cohort; every successful path passes both gates in order',
      rail: ['Lead work: 2 weeks', 'Opportunity work: 6 months', 'Closing: 3 months'],
      railText:
        'Lead work: 2 weeks Opportunity work: 6 months Closing: 3 months About 9.5 months, counting 2 weeks as about half a month Illustrative sequential first-contact-to-win path, not time to cash receipt Cash timing also needs delivery and payment terms',
    };
    const $ = sceneOf(BY_NUMBERS);
    // ACT
    const seen = {
      caption: wordsOf($, '[data-target="caption"]'),
      disclaimer: wordsOf($, '[data-disclaimer]'),
      funnelLabel: $('[data-target="funnel"]').attr('aria-label'),
      funnel: wordsOf($, '[data-target="funnel"]'),
      rail: $('[data-target="time-rail"] ol > li')
        .toArray()
        .map((stage) => wordsOf($, stage)),
      railText: wordsOf($, '[data-target="time-rail"]'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
  it('places "Pipeline tools in practice" in the Section with its Dossier h3, Speaker notes, sources and Voice script, verbatim', () => {
    // ARRANGE
    const expected = {
      id: 'why-pipeline-takes-time--pipeline-tools-in-practice',
      level: 'h3',
      title: 'Pipeline tools in practice',
      notes: [
        {
          slug: 'stage-evidence-can-be-made-explicit',
          header: 'Stage evidence can be made explicit',
          description:
            "HubSpot's example default pipeline separates appointment, qualification, presentation, decision-maker buy-in and contract-sent evidence. Those names are configurable; the fictional board deliberately uses a smaller instructional set rather than claiming those defaults fit every organisation [1].",
          target: 'board',
          sources: [
            {
              slug: 'hubspot-pipelines',
              url: 'https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines',
              title: 'HubSpot, Set up and customize pipelines',
            },
          ],
        },
        {
          slug: 'qualification-can-leave-an-audit-trail',
          header: 'Qualification can leave an audit trail',
          description:
            "Dynamics 365's documented disqualification retains the lead record. Recording a loss or lack of fit is therefore different from quietly deleting it and losing the denominator [1].",
          target: 'lost',
          sources: [
            {
              slug: 'dynamics-qualify-lead',
              url: 'https://learn.microsoft.com/en-us/dynamics365/sales/qualify-lead-convert-opportunity-sales',
              title: 'Microsoft, Qualify and convert a lead to opportunity',
            },
          ],
        },
      ],
      script: [
        {
          slug: 'start-with-a-board-or-spreadsheet',
          title: 'Start with a board or spreadsheet',
          script:
            'Track your deals in a simple pipeline. You can begin with a board or spreadsheet you already have. Give it stages for leads, opportunities and closing, plus won and lost outcomes. Add the names we introduced earlier: Alder Works and Birch Studio. The point is to organise the work, not to buy software before starting.',
        },
        {
          slug: 'give-each-card-a-next-action',
          title: 'Give each card a next action',
          script:
            'Our founder owns both records. For Alder, her next action is to request an introduction on the sixth of January. For Birch, it is a scope meeting on the tenth. Those are different tasks at different stages. At the review, ask what actually happened and what the buyer agreed next. Update the cards from those answers.',
        },
        {
          slug: 'keep-dates-for-measurement',
          title: 'Keep dates for measurement',
          script:
            "Birch's first contact was on the third of January. It entered the opportunity stage on the seventh. Record later stage changes and the eventual win or loss date too. Add expected and actual receipt dates when known. If no payment date has been agreed, leave it unknown. An empty field is more honest than an invented date.",
        },
        {
          slug: 'review-stuck-work',
          title: 'Review stuck work',
          script:
            'Set aside time each week to review the next actions. Did the scope meeting happen? Are we waiting for the buyer, or did we forget our task? Has a buyer explained why the discussion stopped? Use the answers to decide what happens next. Do not assign a comforting chance of winning just because a card has sat there.',
        },
        {
          slug: 'measure-without-hiding-open-deals',
          title: 'Measure without hiding open deals',
          script:
            'When reviewing conversion, return to the same group you started with. Count how many reached each stage. Show those still open alongside the final outcomes. For won deals, calculate first-contact-to-win durations. If only one has finished, say so. That is a beginning of evidence, not a stable answer for every future deal.',
        },
        {
          slug: 'maintain-the-source-list-too',
          title: 'Maintain the source list too',
          script:
            "The board also reminds our founder to keep researching. Alder's contact information might be stale. Another workshop might fit the offer better. Update the source list as you learn. Then choose the next real contact. Do not let maintaining records become the entire activity. The records should help you decide which conversation to pursue next.",
        },
      ],
    };
    // ACT
    const record = recordOf('why-pipeline-takes-time--pipeline-tools-in-practice');
    // ASSERT
    expect(record).toEqual(expected);
  });
  it('reads "Pipeline tools in practice" as a fictional five-column board, Birch\'s dated record and a checklist', () => {
    // ARRANGE
    const expected = {
      caption: 'Track your deals in a simple pipeline.',
      disclaimer: 'Example records, not a product screenshot',
      columns: [
        {
          outcome: 'open',
          text: 'Leads Alder Works Not contacted · owner: founder · next: request introduction, 6 Jan',
        },
        { outcome: 'open', text: 'Opportunities Birch Studio Problem confirmed · next: scope meeting, 10 Jan' },
        { outcome: 'open', text: 'Closing Cedar Labs Proposal discussed · next: payment-terms review, 14 Jan' },
        { outcome: 'won', text: 'Won Delta Office Agreed 5 Jan · receipt expected 20 Feb' },
        { outcome: 'lost', text: 'Lost Elm Services No current budget · revisit only if timing changes' },
      ],
      current: 'Birch Studio Problem confirmed · next: scope meeting, 10 Jan',
      detail:
        'Birch Studio First contact: 3 Jan opportunity entered: 7 Jan last contact: 8 Jan next step: 10 Jan receipt date: not agreed',
      checklist: ['Update after contact', 'review next actions weekly', 'keep open, won and lost separate'],
    };
    const $ = sceneOf(TOOLS);
    // ACT
    const seen = {
      caption: wordsOf($, '[data-target="caption"]'),
      disclaimer: wordsOf($, '[data-disclaimer]'),
      columns: $('[data-target="board"] section')
        .toArray()
        .map((column) => ({ outcome: $(column).attr('data-outcome') ?? 'open', text: wordsOf($, column) })),
      current: wordsOf($, '[data-current]'),
      detail: wordsOf($, '[data-target="birch-dates"]'),
      checklist: $('[data-target="checklist"] li')
        .toArray()
        .map((item) => wordsOf($, item)),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
  it('places "How marketing feeds the pipeline" in the Section with its Dossier h3, Speaker notes, sources and Voice script, verbatim', () => {
    // ARRANGE
    const expected = {
      id: 'why-pipeline-takes-time--marketing-feeds-the-pipeline',
      level: 'h3',
      title: 'How marketing feeds the pipeline',
      notes: [
        {
          slug: 'marketing-and-sales-qualification-are-distinct-definitions',
          header: 'Marketing and sales qualification are distinct definitions',
          description:
            "HubSpot's lifecycle model separately defines Marketing Qualified Lead and Sales Qualified Lead. Its configurable stages describe handoff ownership, not measured causal effects of a marketing channel on sales [1].",
          target: 'gate',
          sources: [
            {
              slug: 'hubspot-lifecycle-stages',
              url: 'https://knowledge.hubspot.com/records/use-lifecycle-stages',
              title: 'HubSpot, Use lifecycle stages (HubSpot Knowledge Base)',
            },
          ],
        },
        {
          slug: 'entry-routes-are-broader-than-one-funnel',
          header: 'Entry routes are broader than one funnel',
          description:
            "Microsoft's documented process includes website opt-ins, email enquiries and trade-show cards as lead sources. These are examples of recorded entry routes, not evidence of a universally best channel or its conversion rate [1].",
          target: 'routes',
          sources: [
            {
              slug: 'dynamics-sales-process',
              url: 'https://learn.microsoft.com/en-us/dynamics365/sales/nurture-sales-from-lead-order-sales',
              title: 'Microsoft, Understand the sales process (Dynamics 365 Sales documentation)',
            },
          ],
        },
      ],
      script: [
        {
          slug: 'attention-needs-an-entry-route',
          title: 'Attention needs an entry route',
          script:
            'Suppose our founder writes about the scheduling problem. Someone reads it, but she does not know who. That person is not yet a named entry she can work with. Include a relevant invitation to discuss the problem. Birch sends an enquiry through it. Now she has someone to answer, rather than just a readership count.',
        },
        {
          slug: 'choose-where-marketing-hands-over',
          title: 'Choose where marketing hands over',
          script:
            'For our small company, that enquiry becomes a lead for the founder to handle. Decide what information the handoff must contain. Which company asked? What problem did it mention? Who will respond, and when? Put the entry into the same working system as the other leads. Otherwise a useful enquiry may simply wait in an inbox.',
        },
        {
          slug: 'feed-the-list-then-qualify',
          title: 'Feed the list, then qualify',
          script:
            'In this story, Birch arrived through the scheduling article. Record that source. If our founder later meets another team at an event, record what follow-up it requested. If a contact makes an introduction, record the reason. Then ask the questions needed for the next step. The route into the conversation does not answer them for us.',
        },
        {
          slug: 'more-volume-is-not-a-guarantee',
          title: 'More volume is not a guarantee',
          script:
            "Imagine a new article brings many enquiries from teams outside the offer's scope. That would give our founder more responses to handle, but not necessarily more useful opportunities. Some might be a fit later. Some might need something else. When comparing sources, examine who came in and what happened next, not only which source produced the largest count.",
        },
        {
          slug: 'close-the-feedback-loop',
          title: 'Close the feedback loop',
          script:
            'Suppose several buyers ask whether the software can handle last-minute job changes. Bring that question back to the article and the offer. Could the explanation be clearer? Are we contacting the right teams? Choose a specific change to test. Marketing and sales can share these questions, with the next buyer conversation showing what happens.',
        },
      ],
    };
    // ACT
    const record = recordOf('why-pipeline-takes-time--marketing-feeds-the-pipeline');
    // ASSERT
    expect(record).toEqual(expected);
  });
  it('reads "How marketing feeds the pipeline" from attention through three routes into the qualifying pipeline', () => {
    // ARRANGE
    const expected = {
      caption:
        'Marketing hands a named entry to the pipeline; qualification still decides what becomes an opportunity.',
      attention: 'Attention Anonymous viewers · outside the pipeline',
      routes: [
        'Useful article → enquiry',
        'Relevant event → requested follow-up',
        'Network introduction → conversation',
      ],
      pipeline:
        'Pipeline Identified lead Buyer response, plausible fit, agreed next step Not qualified / not now Qualified opportunity',
      handoff: 'Birch Studio · scheduling problem · source: article enquiry · owner: founder · next: discovery call',
      footer: 'More attention is not automatically more deals',
    };
    const $ = sceneOf(MARKETING);
    // ACT
    const seen = {
      caption: wordsOf($, '[data-target="caption"]'),
      attention: wordsOf($, '[data-attention]'),
      routes: $('[data-target="routes"] li')
        .toArray()
        .map((route) => wordsOf($, route)),
      pipeline: wordsOf($, '[data-target="pipeline"]'),
      handoff: wordsOf($, '[data-target="handoff"]'),
      footer: wordsOf($, '[data-target="footer"]'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
  it('places "Why it takes time to ramp up" in the Section with its Dossier h3, Speaker notes, sources and Voice script, verbatim', () => {
    // ARRANGE
    const expected = {
      id: 'why-pipeline-takes-time--why-ramp-up-takes-time',
      level: 'h3',
      title: 'Why it takes time to ramp up',
      notes: [
        {
          slug: 'tenure-is-not-a-stopwatch-for-ramp-up',
          header: 'Tenure is not a stopwatch for ramp-up',
          description:
            "Peasley and Hochstein's authors' summary discusses early-tenure salespeople hired 18–24 months before the survey; that tenure and their framing do not measure a founder's pipeline-from-zero ramp period. The source also reports a prospecting-versus-account-work trade-off, not that maximum prospecting is always best [1].",
          target: 'footer',
          sources: [
            {
              slug: 'peasley-hochstein-summary',
              url: 'https://kellercenter.hankamer.baylor.edu/news/story/2025/insights-optimizing-early-tenure-sales-success',
              title:
                'Peasley and Hochstein, Insights for Optimizing Early-Tenure Sales Success (summary of their Journal of Personal Selling & Sales Management article, doi:10.1080/08853134.2024.2316383)',
            },
          ],
        },
        {
          slug: 'training-evidence-has-a-narrow-setting',
          header: 'Training evidence has a narrow setting',
          description:
            "Chung, Kim and Park fit a structural model to one firm's sales force; tenure and training affected modelled performance, with stronger training effects for junior staff. That does not establish how long a startup founder needs to become productive [1].",
          target: 'learn-selling-work',
          sources: [
            {
              slug: 'chung-kim-park',
              url: 'https://www.hbs.edu/ris/Publication%20Files/SF_Management_2020_0430_Final_1866af08-e5ee-4b12-9d51-7e3074d47c5d.pdf',
              title:
                'Chung, Kim and Park, The Comprehensive Effects of Sales Force Management: A Dynamic Structural Analysis of Selection, Compensation, and Training',
            },
          ],
        },
        {
          slug: 'budget-association-is-not-a-timing-prescription',
          header: 'Budget association is not a timing prescription',
          description:
            'The longitudinal B2B high-tech startup survey associates a larger personal-sales budget share with better early-stage performance and worse later-stage performance. It does not demonstrate that a budget shift causes faster ramp-up; this result was available at abstract level [1].',
          target: 'preparation',
          sources: [
            {
              slug: 'vomberg-et-al',
              url: 'https://doi.org/10.1177/00222437251367766',
              title:
                'Vomberg et al., The Different Effects of Mass-Media Marketing and Personal Sales Budgets Across the Life Cycle of B2B High-Tech Start-Ups',
            },
          ],
        },
        {
          slug: 'buyer-led-journeys-are-conceptual-evidence',
          header: 'Buyer-led journeys are conceptual evidence',
          description:
            "Kalwey et al.'s interview-based conceptual paper describes a role coordinating buyer–seller touchpoints. It does not quantify sales-cycle duration or prove a combined duration for construction, learning and buyer pacing [1].",
          target: 'buyer-decision-time',
          sources: [
            {
              slug: 'kalwey-et-al',
              url: 'https://doi.org/10.1177/00222429251338820',
              title: 'Kalwey et al., Holistic Selling: An Emerging Paradigm in B2B Markets',
            },
          ],
        },
      ],
      script: [
        {
          slug: 'preparation-is-real-work',
          title: 'Preparation is real work',
          script:
            'At the beginning, our founder must create a usable first version. Research a few prospects. Write the offer. Choose a contact route. Decide what evidence opens an opportunity. Set up the board. None of that requires a perfect system. It requires enough preparation to make the first contact and remember what happens afterwards.',
        },
        {
          slug: 'you-do-not-know-the-market-yet',
          title: 'You do not know the market yet',
          script:
            "She might initially contact a workshop owner and discover that a different person handles scheduling. She can test that new route on the next call. Or a buyer may object to the trial's scope. She can ask which part is unsuitable. These conversations inform her next move. A handful of answers does not describe every potential customer.",
        },
        {
          slug: 'you-do-not-know-your-numbers-yet',
          title: 'You do not know your numbers yet',
          script:
            'On the first day, there are no completed deals to measure. A week later, several conversations may still be open. The founder cannot hurry their final outcomes by filling in a spreadsheet. Keep recording what happens. Until there is enough evidence, use explicit scenarios rather than treating our invented conversion rate as her own.',
        },
        {
          slug: 'separate-the-sources-of-delay',
          title: 'Separate the sources of delay',
          script:
            'Ask what kind of waiting you are dealing with. Are you still building the prospect list? Are you learning how to explain the offer? Or is a buyer considering a decision? Those questions point to different actions. They are not three standard durations to add together. Name the unfinished work instead of guessing a universal clock.',
        },
        {
          slug: 'balance-new-leads-with-current-work',
          title: 'Balance new leads with current work',
          script:
            "Our founder has one afternoon. She could research Alder, prepare Birch's scope meeting or fulfil a trial promise. All three might matter. Put the dates and responsibilities together before deciding. Do not celebrate a long contact list if the active opportunity goes unanswered. Choose work that moves the actual customer conversations and commitments forward.",
        },
        {
          slug: 'start-learning-before-cash-is-urgent',
          title: 'Start learning before cash is urgent',
          script:
            'Starting now gives the founder time to make contacts, record responses and try the next steps. As agreements become clearer, update the receipt scenarios in the cashflow view. Some answers may be uncomfortable. Better to see them while there are choices to consider. The process does not promise a completion date. Waiting does not provide one either.',
        },
      ],
    };
    // ACT
    const record = recordOf('why-pipeline-takes-time--why-ramp-up-takes-time');
    // ASSERT
    expect(record).toEqual(expected);
  });
  it('reads "Why it takes time to ramp up" as three boxes, a band of separate mechanisms and an evidence footer', () => {
    // ARRANGE
    const expected = {
      caption: 'Separate the sources of delay: they are not three standard durations to add together.',
      boxes: [
        'Preparation list, offer, stage rules',
        'Unknown market test buyer response',
        'Unknown metrics wait for outcomes',
      ],
      band: ['Construct the pipeline', 'Learn the selling work', 'Buyer decision time'],
      footer: 'No measured pipeline-from-zero duration here',
    };
    const $ = sceneOf(RAMP_UP);
    // ACT
    const seen = {
      caption: wordsOf($, '[data-target="caption"]'),
      boxes: $('[data-boxes] > li')
        .toArray()
        .map((box) => wordsOf($, box)),
      band: $('[data-band] > li')
        .toArray()
        .map((cell) => wordsOf($, cell)),
      footer: wordsOf($, '[data-target="footer"]'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
  it('places the "Start when?" cashflow callback in the Section with its Dossier h3, Speaker notes, sources and Voice script, verbatim', () => {
    // ARRANGE
    const expected = {
      id: 'why-pipeline-takes-time--cashflow-start-when',
      level: 'h3',
      title: 'Watch your cashflow, "Start when?"',
      notes: [
        {
          slug: 'an-unpaid-earned-amount-is-not-spendable-cash',
          header: 'An unpaid earned amount is not spendable cash',
          description:
            'IFRS 15 distinguishes contract assets and receivables after transfer from cash settlement. A receivable can record a right to payment while the account still lacks the funds needed for an outgoing payment [1].',
          target: 'board',
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
          slug: 'payment-risk-is-distinct-from-deal-risk',
          header: 'Payment risk is distinct from deal risk',
          description:
            'The EU directive documents that invoices may be paid after agreed terms, with consequences for liquidity. A cash scenario should therefore allow receipt-date uncertainty even after the sales opportunity has become an agreement [1].',
          target: 'april-receipt',
          sources: [
            {
              slug: 'eu-directive-2011-7',
              url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011L0007',
              title:
                'European Parliament and Council, Directive 2011/7/EU on combating late payment in commercial transactions',
            },
          ],
        },
      ],
      script: [
        {
          slug: 'return-to-the-unfunded-month',
          title: 'Return to the unfunded month',
          script:
            'Return once more to the original company. One hundred thousand dollars at the start. Fifty thousand paid each month. January ends with fifty thousand. February ends with zero. March cannot be funded. The million is still in April. We have not fixed that story by discussing sales. We have identified the work the founder postponed.',
        },
        {
          slug: 'plan-backwards-act-forwards',
          title: 'Plan backwards, act forwards',
          script:
            'Plan backwards from the cash you need. Ask what delivery and payment arrangement would support it. Ask what decision must come before that work. Ask which opportunity conversations would support the decision. Then act forwards: research a plausible customer, make contact and pursue the agreed next step. Start that chain before the cash becomes urgent.',
        },
        {
          slug: 'do-not-mix-the-two-illustrations',
          title: 'Do not mix the two illustrations',
          script:
            'Our January-to-April cash story and our nine-and-a-half-month sales path were separate examples. Do not squeeze the long path into those four months. Starting in January is not a proven rescue for the March gap. The lesson is the direction of planning. Find the deadline, then examine how much unfinished work sits before it.',
        },
        {
          slug: 'take-the-cash-action-now',
          title: 'Take the cash action now',
          script:
            'Your first action is to build the monthly cashflow view and find your zero-cash month. Use your own opening balance, receipts and payments. Write down the month the plan runs out. Try the plan without your largest unconfirmed deal too. That gives you a concrete cash deadline to work with, rather than a general feeling that sales can wait.',
        },
        {
          slug: 'take-the-customer-actions-now',
          title: 'Take the customer actions now',
          script:
            "Your next actions are to research and maintain a prospect list, then make first contact. Choose a plausible buyer and a suitable cold, inbound or network route. Ask for one useful next step. If a conversation opens, do the opportunity work. A list alone will not prepare the proposal or answer the buyer's questions.",
        },
        {
          slug: 'keep-evidence-as-you-go',
          title: 'Keep evidence as you go',
          script:
            'Finally, track deals in a simple pipeline. Keep dates, next actions and outcomes. Measure conversion with a clear starting count. Measure the sales cycle with clear endpoints. Use what you learn to adjust your plan. You do not need all the answers before the first contact. You need to start finding them now, before you depend on the money.',
        },
      ],
    };
    // ACT
    const record = recordOf('why-pipeline-takes-time--cashflow-start-when');
    // ASSERT
    expect(record).toEqual(expected);
  });
  it('reads the "Start when?" callback as the arrow and quarters above the unchanged board, then a reminder and four actions', () => {
    // ARRANGE
    const expected = {
      caption: 'Plan backwards from the cash you need, then act forwards.',
      arrow:
        'Start when? Q1 is not a proven latest safe start Start now · before you need the cash First contact Opportunities Closing Planned April receipt',
      legend: 'Q1: January–March; Q2: April',
      months: [
        { tone: 'neutral', text: 'January Opening cash $100,000 Cash costs $50,000 Receipts $0 Closing cash $50,000' },
        {
          tone: 'warning',
          text: 'February Zero-cash month Opening cash $50,000 Cash costs $50,000 Receipts $0 Closing cash $0',
        },
        { tone: 'neutral', text: 'March Cash costs $50,000 Cannot fund $50,000 payment' },
        {
          tone: 'neutral',
          text: 'April Cash costs $50,000 Customer receipt $1,000,000 Too late without bridge funding',
        },
      ],
      rule: 'Closing cash = opening cash + receipts − payments',
      label: 'Fictional example · cash received, not booked revenue',
      reminder: 'February receipt would change the outcome',
      actions: [
        '1 Find your zero-cash month',
        '2 Research and maintain a prospect list',
        '3 Make first contact',
        '4 Track stages, conversion and cycle',
      ],
    };
    const $ = sceneOf(START_WHEN);
    // ACT
    const seen = {
      caption: wordsOf($, '[data-target="caption"]'),
      arrow: wordsOf($, 'figure [data-arrow]'),
      legend: wordsOf($, 'figure [data-target="quarters"] p'),
      months: $('figure ol > li[data-tone]')
        .toArray()
        .map((month) => ({ tone: $(month).attr('data-tone'), text: wordsOf($, month) })),
      rule: wordsOf($, 'figure > p'),
      label: wordsOf($, 'figcaption'),
      reminder: wordsOf($, '[data-target="reminder"]'),
      actions: $('[data-target="actions"] > li')
        .toArray()
        .map((action) => wordsOf($, action)),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('brackets January to March as Q1 and April as Q2 by column count, hidden from assistive technology', () => {
    // ARRANGE
    const expected = [
      { label: 'Q1', style: 'grid-column:span 3' },
      { label: 'Q2', style: 'grid-column:span 1' },
    ];
    const expectedHidden = 'true';
    const $ = sceneOf(START_WHEN);
    // ACT
    const bracket = $('figure [data-target="quarters"] [data-quarter]')
      .toArray()
      .map((quarter) => ({ label: wordsOf($, quarter), style: $(quarter).attr('style') }));
    const hidden = $('figure [data-target="quarters"] [data-quarter]').parent().attr('aria-hidden');
    // ASSERT
    expect(bracket).toEqual(expected);
    expect(hidden).toBe(expectedHidden);
  });
});

describe('failure cases', () => {
  it('resolves every Speaker note of the Section to exactly one element of its own Slide', () => {
    // ARRANGE
    const expected = [
      `${WHAT_IS} default-report-populations-differ: 1`,
      `${WHAT_IS} forecast-weights-are-settings: 1`,
      `${BY_NUMBERS} real-reports-may-skip-gates: 1`,
      `${BY_NUMBERS} buying-groups-vary-without-a-measured-clock: 1`,
      `${BY_NUMBERS} public-procurement-is-a-bounded-special-case: 1`,
      `${TOOLS} stage-evidence-can-be-made-explicit: 1`,
      `${TOOLS} qualification-can-leave-an-audit-trail: 1`,
      `${MARKETING} marketing-and-sales-qualification-are-distinct-definitions: 1`,
      `${MARKETING} entry-routes-are-broader-than-one-funnel: 1`,
      `${RAMP_UP} tenure-is-not-a-stopwatch-for-ramp-up: 1`,
      `${RAMP_UP} training-evidence-has-a-narrow-setting: 1`,
      `${RAMP_UP} budget-association-is-not-a-timing-prescription: 1`,
      `${RAMP_UP} buyer-led-journeys-are-conceptual-evidence: 1`,
      `${START_WHEN} an-unpaid-earned-amount-is-not-spendable-cash: 1`,
      `${START_WHEN} payment-risk-is-distinct-from-deal-risk: 1`,
    ];
    // ACT
    const resolved = SLIDES.flatMap((id) => {
      const $ = sceneOf(id);
      return slideAt(id).notes.map(({ slug, target }) => `${id} ${slug}: ${$(`[data-target="${target}"]`).length}`);
    });
    // ASSERT
    expect(resolved).toEqual(expected);
  });
  it('renders the section slide with its h2 alone, no caption', () => {
    // ARRANGE
    const expected = { heading: 'Why building an effective sales pipeline takes time', captions: 0 };
    const $ = sceneOf(SECTION);
    // ACT
    const seen = { heading: wordsOf($, 'h2'), captions: $('[data-target="caption"]').length };
    // ASSERT
    expect(seen).toEqual(expected);
  });
  it('gives "What is a sales pipeline" one element per target and draws the funnel as unnumbered hidden bars', () => {
    // ARRANGE
    const expectedTargets = { volume: 1, offering: 1, efficiency: 1, pipeline: 1, funnel: 1, definitions: 1 };
    const expectedBars = { bars: 3, hidden: 3, digits: '' };
    const $ = sceneOf(WHAT_IS);
    // ACT
    const targets = Object.fromEntries(
      Object.keys(expectedTargets).map((name) => [name, $(`[data-target="${name}"]`).length]),
    );
    const bars = $('[data-target="funnel"] [data-bar]');
    const seenBars = {
      bars: bars.length,
      hidden: bars.filter('[aria-hidden="true"]').length,
      digits: wordsOf($, '[data-target="funnel"]').replace(/\D/g, ''),
    };
    // ASSERT
    expect(targets).toEqual(expectedTargets);
    expect(seenBars).toEqual(expectedBars);
  });
  it('gives "Pipeline by the numbers" one element per target and keeps counts and time in separate figures', () => {
    // ARRANGE
    const expectedTargets = {
      funnel: 1,
      overall: 1,
      condition: 1,
      'time-rail': 1,
      'opportunity-work': 1,
      'rail-label': 1,
      'cash-note': 1,
    };
    const expectedNesting = { railInFunnel: 0, funnelInRail: 0 };
    const $ = sceneOf(BY_NUMBERS);
    // ACT
    const targets = Object.fromEntries(
      Object.keys(expectedTargets).map((name) => [name, $(`[data-target="${name}"]`).length]),
    );
    const nesting = {
      railInFunnel: $('[data-target="funnel"] [data-target="time-rail"]').length,
      funnelInRail: $('[data-target="time-rail"] [data-target="funnel"]').length,
    };
    // ASSERT
    expect(targets).toEqual(expectedTargets);
    expect(nesting).toEqual(expectedNesting);
  });
  it('gives "Pipeline tools in practice" one element per target and draws its board without images', () => {
    // ARRANGE
    const expectedTargets = { board: 1, lost: 1, birch: 1, 'birch-dates': 1, checklist: 1 };
    const expectedImages = 0;
    const $ = sceneOf(TOOLS);
    // ACT
    const targets = Object.fromEntries(
      Object.keys(expectedTargets).map((name) => [name, $(`[data-target="${name}"]`).length]),
    );
    const images = $('img, picture, svg:not([aria-hidden="true"])').length;
    // ASSERT
    expect(targets).toEqual(expectedTargets);
    expect(images).toBe(expectedImages);
  });
  it('gives "How marketing feeds the pipeline" one element per target and keeps the viewers outside the pipeline', () => {
    // ARRANGE
    const expectedTargets = { gate: 1, routes: 1, viewers: 1, pipeline: 1, handoff: 1, footer: 1 };
    const expectedPlacement = { viewersInPipeline: 0, gateInPipeline: 1, hiddenDots: 12 };
    const $ = sceneOf(MARKETING);
    // ACT
    const targets = Object.fromEntries(
      Object.keys(expectedTargets).map((name) => [name, $(`[data-target="${name}"]`).length]),
    );
    const placement = {
      viewersInPipeline: $('[data-target="pipeline"] [data-target="viewers"]').length,
      gateInPipeline: $('[data-target="pipeline"] [data-target="gate"]').length,
      hiddenDots: $('[data-target="viewers"] [aria-hidden="true"] > span').length,
    };
    // ASSERT
    expect(targets).toEqual(expectedTargets);
    expect(placement).toEqual(expectedPlacement);
  });
  it('gives "Why it takes time to ramp up" one element per target and draws no sum, arrow or axis in its band', () => {
    // ARRANGE
    const expectedTargets = { preparation: 1, 'learn-selling-work': 1, 'buyer-decision-time': 1, footer: 1 };
    const expectedBand = { icons: 0, plusSigns: '' };
    const $ = sceneOf(RAMP_UP);
    // ACT
    const targets = Object.fromEntries(
      Object.keys(expectedTargets).map((name) => [name, $(`[data-target="${name}"]`).length]),
    );
    const band = {
      icons: $('[data-band] svg').length,
      plusSigns: wordsOf($, '[data-band]').replace(/[^+]/g, ''),
    };
    // ASSERT
    expect(targets).toEqual(expectedTargets);
    expect(band).toEqual(expectedBand);
  });
  it('gives the "Start when?" callback one element per target, and its board no stamp', () => {
    // ARRANGE
    const expectedTargets = { board: 1, 'april-receipt': 1, 'start-now': 1, quarters: 1, actions: 1, reminder: 1 };
    const expectedBoard = { stamps: 0, figures: 1 };
    const $ = sceneOf(START_WHEN);
    // ACT
    const targets = Object.fromEntries(
      Object.keys(expectedTargets).map((name) => [name, $(`[data-target="${name}"]`).length]),
    );
    const board = {
      stamps: $('[data-target="board"] p.uppercase').length,
      figures: $('[data-target="board"] figure').length,
    };
    // ASSERT
    expect(targets).toEqual(expectedTargets);
    expect(board).toEqual(expectedBoard);
  });
});

describe('edge cases', () => {
  it('shows German readers every Slide of the Section in the approved provisional English text', () => {
    // ARRANGE
    const expected = [
      'Why building an effective sales pipeline takes time',
      [
        'What is a sales pipeline',
        'A pipeline is our working record of potential deals; a funnel counts how many progress.',
        'Volume how many enter each stage?',
        'Offering / conversion which advance?',
        'Efficiency / cycle how long does progress take?',
        'Pipeline: records and next actions Leads Opportunities Won',
        'Funnel: how many progress Leads Opportunities Won',
        'Define entry, exit, cohort and dates before comparing numbers',
      ].join(' '),
      [
        'Pipeline by the numbers',
        'An invented, completed cohort: the ratios count progress; the time rail adds duration separately.',
        'Illustration, not benchmark',
        '27 leads',
        '3 leads : 1 opportunity · 1/3 advance',
        '9 opportunities',
        '9 opportunities : 1 deal · 1/9 advance',
        '1 won deal',
        '27 leads : 1 deal · 1/27 ≈ 3.7% overall',
        'One completed cohort; every successful path passes both gates in order',
        'Lead work: 2 weeks',
        'Opportunity work: 6 months',
        'Closing: 3 months',
        'About 9.5 months, counting 2 weeks as about half a month',
        'Illustrative sequential first-contact-to-win path, not time to cash receipt',
        'Cash timing also needs delivery and payment terms',
      ].join(' '),
      [
        'Pipeline tools in practice',
        'Track your deals in a simple pipeline.',
        'Example records, not a product screenshot',
        'Leads Alder Works Not contacted · owner: founder · next: request introduction, 6 Jan',
        'Opportunities Birch Studio Problem confirmed · next: scope meeting, 10 Jan',
        'Closing Cedar Labs Proposal discussed · next: payment-terms review, 14 Jan',
        'Won Delta Office Agreed 5 Jan · receipt expected 20 Feb',
        'Lost Elm Services No current budget · revisit only if timing changes',
        'Birch Studio First contact: 3 Jan opportunity entered: 7 Jan last contact: 8 Jan next step: 10 Jan receipt date: not agreed',
        'Update after contact review next actions weekly keep open, won and lost separate',
      ].join(' '),
      [
        'How marketing feeds the pipeline',
        'Marketing hands a named entry to the pipeline; qualification still decides what becomes an opportunity.',
        'Attention Anonymous viewers · outside the pipeline',
        'Useful article → enquiry Relevant event → requested follow-up Network introduction → conversation',
        'Pipeline Identified lead Buyer response, plausible fit, agreed next step Not qualified / not now Qualified opportunity',
        'Birch Studio · scheduling problem · source: article enquiry · owner: founder · next: discovery call',
        'More attention is not automatically more deals',
      ].join(' '),
      [
        'Why it takes time to ramp up',
        'Separate the sources of delay: they are not three standard durations to add together.',
        'Preparation list, offer, stage rules',
        'Unknown market test buyer response',
        'Unknown metrics wait for outcomes',
        'Construct the pipeline Learn the selling work Buyer decision time',
        'No measured pipeline-from-zero duration here',
      ].join(' '),
      [
        'Watch your cashflow, "Start when?"',
        'Plan backwards from the cash you need, then act forwards.',
        'Fictional example · cash received, not booked revenue',
        'Start when? Q1 is not a proven latest safe start',
        'Start now · before you need the cash First contact Opportunities Closing Planned April receipt',
        'Q1: January–March; Q2: April Q1 Q2',
        'January Opening cash $100,000 Cash costs $50,000 Receipts $0 Closing cash $50,000',
        'February Zero-cash month Opening cash $50,000 Cash costs $50,000 Receipts $0 Closing cash $0',
        'March Cash costs $50,000 Cannot fund $50,000 payment',
        'April Cash costs $50,000 Customer receipt $1,000,000 Too late without bridge funding',
        'Closing cash = opening cash + receipts − payments',
        'February receipt would change the outcome',
        '1 Find your zero-cash month 2 Research and maintain a prospect list 3 Make first contact 4 Track stages, conversion and cycle',
      ].join(' '),
    ];
    // ACT
    const german = SLIDES.map((id) => wordsOf(sceneOf(id, 'de'), 'article'));
    // ASSERT
    expect(german).toEqual(expected);
  });
  it('keeps the "Start when?" arrow in forward reading order while it points backwards', () => {
    // ARRANGE
    const expected = ['start-now', 'first-contact', 'opportunities', 'closing', 'april-receipt'];
    const $ = sceneOf(START_WHEN);
    // ACT
    const order = $('[data-arrow] ol > li')
      .toArray()
      .map((step) => $(step).attr('data-target'));
    // ASSERT
    expect(order).toEqual(expected);
  });
});
