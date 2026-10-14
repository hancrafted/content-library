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
 * The third Section of "Why it's never too early to start with sales", "How
 * to start doing sales", read through the registry and its record as the page
 * renders it. English is the approved Dossier's text; German holds the same
 * English strings as an explicit provisional fallback until Promotion.
 */

const SLUG = 'never-too-early-sales';
const OPENER = 'how-to-start-sales';
const SALE = `${OPENER}--stages-of-sale`;
const AFTER_SALE = `${OPENER}--stages-of-after-sale`;
const PULLED_IN = `${OPENER}--cashflow-receipt-pulled-in`;

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
  it('opens the third Section with its Dossier h2, no notes and its two Voice script beats, verbatim', () => {
    // ARRANGE
    const expected = {
      id: OPENER,
      level: 'h2',
      title: 'How to start doing sales',
      notes: [],
      script: [
        {
          slug: 'make-the-first-moves-concrete',
          title: 'Make the first moves concrete',
          script:
            'What should our founder do tomorrow? Find potential customers. Contact one. If a useful conversation opens, work out whether there is a real opportunity. Then do the work needed to reach an agreement. There is work after agreement too. We will follow that route, because the cashflow question remains at the end of it.',
        },
        {
          slug: 'keep-the-method-small',
          title: 'Keep the method small',
          script:
            'You do not need to build a sales department before taking the first step. You need somewhere to record who you might contact and what you will do next. Keep the first version small enough to use tomorrow. A method that you maintain is more useful here than an elaborate system you never open.',
        },
      ],
    };
    // ACT
    const opener = slideAt(OPENER);
    // ASSERT
    expect({
      id: opener.id,
      level: opener.level,
      title: opener.title,
      notes: opener.notes,
      script: scriptOf(opener),
    }).toEqual(expected);
  });

  it('places "Stages of sale" second with its Dossier Speaker notes, each citing its own source', () => {
    // ARRANGE
    const microsoft = {
      slug: 'microsoft-qualify-lead',
      url: 'https://learn.microsoft.com/en-us/dynamics365/sales/qualify-lead-convert-opportunity-sales',
      title: 'Microsoft, Qualify and convert a lead to opportunity',
    };
    const expected = {
      id: SALE,
      level: 'h3',
      title: 'Stages of sale',
      notes: [
        {
          slug: 'qualification-is-a-separate-transition',
          header: 'Qualification is a separate transition',
          description:
            'Dynamics 365 distinguishes a lead record from the opportunity record created through qualification. Budget and a clear decision timeline are its example of qualification evidence, not mandatory criteria imposed here on every startup [1].',
          target: 'gate',
          sources: [microsoft],
        },
        {
          slug: 'do-not-erase-disqualified-leads',
          header: 'Do not erase disqualified leads',
          description:
            "Microsoft's model retains a disqualified lead as an audit trail. The simple instructional flow uses that principle without copying a vendor's entire stage model [1].",
          target: 'lost',
          sources: [microsoft],
        },
      ],
    };
    // ACT
    const { id, level, title, notes } = slideAt(SALE);
    // ASSERT
    expect({ id, level, title, notes }).toEqual(expected);
  });

  it('gives "Stages of sale" its seven Voice script beats, verbatim', () => {
    // ARRANGE
    const expected = [
      {
        slug: 'choose-who-might-have-the-problem',
        title: 'Choose who might have the problem',
        script:
          "Let us introduce two fictional prospects. Alder Works is a workshop. Birch Studio is a small design team. Our founder thinks both might struggle to schedule jobs. At Alder, she wants to reach the person organising workshop operations. At Birch, she wants to find whoever plans the team's work. These are starting hypotheses, not confirmed needs.",
      },
      {
        slug: 'build-and-maintain-the-list',
        title: 'Build and maintain the list',
        script:
          'Start lead generation now. Research and maintain a list of potential customers. For Alder, record the company name, the relevant role and your scheduling hypothesis. Add where you found it, how you could reach someone, its contact status and your next action. After a response, update the entry. The list should reflect what you know today.',
      },
      {
        slug: 'research-is-not-contact',
        title: 'Research is not contact',
        script:
          'Our founder could spend all week finding more workshops. But a longer list would not answer whether Alder wants a conversation. Once she has a plausible reason for contact and a suitable route, she should use it. Research prepares the first move. It should not become a way to postpone hearing an answer.',
      },
      {
        slug: 'make-the-first-contact',
        title: 'Make the first contact',
        script:
          "Make first contact to open a conversation. That could be an appropriate cold call. It could be answering an inbound enquiry. It could be asking someone in your network for an introduction. Our founder chooses an introduction to Alder's operations manager. She explains the scheduling question she wants to discuss, rather than sending her entire product story.",
      },
      {
        slug: 'ask-for-one-next-step',
        title: 'Ask for one next step',
        script:
          'Birch has asked about the scheduling offer. Our founder proposes a short conversation about how the team plans jobs today. That is one clear next step. She does not assume Birch wants to buy. She asks whether the conversation would be useful and waits for an answer. The invitation gives the buyer something specific to accept or decline.',
      },
      {
        slug: 'open-an-opportunity-with-evidence',
        title: 'Open an opportunity with evidence',
        script:
          'For this example, our founder sets a simple rule. She opens an opportunity when a conversation reveals plausible fit and the buyer agrees to a next step. Birch describes a scheduling problem and agrees to discuss a trial. That gives her work to pursue. Alder has not replied yet. She cannot treat that silence as an active deal.',
      },
      {
        slug: 'work-opportunities-deliberately',
        title: 'Work opportunities deliberately',
        script:
          'This is where the real work sits. With Birch, our founder must understand the problem, arrange the scope meeting and answer practical questions. She may need to revise a proposal or negotiate what is included. Each conversation ends with a next action and date. Follow up on that action. Record whether the deal is won or lost. Do not just move a card and wait for money. Agreement still needs its own payment plan.',
      },
    ];
    // ACT
    const script = scriptOf(slideAt(SALE));
    // ASSERT
    expect(script).toEqual(expected);
  });

  it('reads the sale route in order: Leads, the qualification gate, Opportunities, Closing', () => {
    // ARRANGE
    const expected = {
      label: 'From lead to closing',
      stages: [
        'Leads Research and maintain a prospect list Company and the relevant role Your problem hypothesis Where you found it How you could reach someone Contact status and next action Update the entry after every response Sample list card · fictional Alder Works operations buyer manual scheduling problem source: trade directory contact route: introduction status: not contacted Make first contact A plausible reason and a suitable route? Use it Cold call · inbound enquiry · network introduction Open with the problem you want to discuss Ask for one next step',
        'Qualify Buyer response + plausible fit + agreed next step First contact alone does not cross it',
        'Opportunities Agreed problem and next conversation Follow-up Meetings Proposal Negotiation Every step ends with a next action and a date Fictional: Birch Studio described a scheduling problem and agreed to discuss a trial',
        'Closing Won: agreement Lost: record reason Won is not cash received',
      ],
    };
    const $ = sceneOf(SALE);
    // ACT
    const flow = $('ol[aria-label]').first();
    const stages = flow
      .children('li')
      .toArray()
      .map((stage) => wordsOf($, stage));
    // ASSERT
    expect({ label: flow.attr('aria-label'), stages }).toEqual(expected);
  });

  it('stacks the Leads checklists in one column at every width: research, its sample card, then contact', () => {
    // ARRANGE
    const expected = {
      stack: 'flex flex-col gap-4',
      order: ['Research and maintain a prospect list', 'Sample list card · fictional', 'Make first contact'],
    };
    const $ = sceneOf(SALE);
    // ACT
    const stack = $('[data-target="leads"] > div').first();
    const order = stack
      .children()
      .toArray()
      .map((block) => wordsOf($, $(block).children().first()));
    const classes = stack.attr('class');
    // ASSERT
    expect({ stack: classes, order }).toEqual(expected);
  });

  it('gives Opportunities the one primary emphasis, and the success colour only to the labelled win', () => {
    // ARRANGE
    const expected = { primary: ['opportunities'], success: ['Won: agreement'] };
    const $ = sceneOf(SALE);
    // ACT
    const primary = $('.border-primary')
      .toArray()
      .map((element) => $(element).attr('data-target'));
    const success = $('[data-tone="success"]')
      .toArray()
      .map((note) => wordsOf($, note));
    // ASSERT
    expect({ primary, success }).toEqual(expected);
  });

  it('links the gate and the lost note to their Speaker notes', () => {
    // ARRANGE
    const expected = {
      gate: 'qualification-is-a-separate-transition',
      lost: 'do-not-erase-disqualified-leads',
    };
    const $ = sceneOf(SALE);
    // ACT
    const refs = {
      gate: $('[data-target="gate"] [data-context-ref]').attr('data-context-ref'),
      lost: $('[data-target="lost"] [data-context-ref]').attr('data-context-ref'),
    };
    // ASSERT
    expect(refs).toEqual(expected);
  });

  it('places "Stages of after-sale" third with its Dossier Speaker notes and sources', () => {
    // ARRANGE
    const expected = {
      id: AFTER_SALE,
      level: 'h3',
      title: 'Stages of after-sale',
      notes: [
        {
          slug: 'relationship-performance-is-broader-than-trust',
          header: 'Relationship performance is broader than trust',
          description:
            "Palmatier et al.'s meta-analysis reports relationship-marketing performance effects and stronger effectiveness in certain relationship-relevant settings and with an individual person. It does not establish that a customer-success step automatically creates renewals, nor does its moderator isolate trust [1].",
          target: 'customer-success',
          sources: [
            {
              slug: 'palmatier-relationship-marketing',
              url: 'https://doi.org/10.1509/jmkg.70.4.136',
              title:
                'Palmatier et al., Factors Influencing the Effectiveness of Relationship Marketing: A Meta-Analysis',
            },
          ],
        },
        {
          slug: 'doing-work-by-hand-can-reveal-process-details',
          header: 'Doing work by hand can reveal process details',
          description:
            "Graham's practitioner example describes a hardware startup assembling early watches and learning details such as the importance of sourcing good screws. It is an example about early users and production, not measured evidence of paying-customer retention [1].",
          target: 'production',
          sources: [
            {
              slug: 'graham-do-things-that-dont-scale',
              url: 'https://paulgraham.com/ds.html',
              title: "Graham, Do Things that Don't Scale",
            },
          ],
        },
      ],
    };
    // ACT
    const { id, level, title, notes } = slideAt(AFTER_SALE);
    // ASSERT
    expect({ id, level, title, notes }).toEqual(expected);
  });

  it('gives "Stages of after-sale" its four Voice script beats, verbatim', () => {
    // ARRANGE
    const expected = [
      {
        slug: 'a-win-starts-another-responsibility',
        title: 'A win starts another responsibility',
        script:
          "Suppose Birch agrees to the trial. Now our company has a promise to fulfil. Someone must prepare the scheduling setup. Someone must make time to support it. The founder puts those tasks into the work plan and their payments into the cash plan. Signing the trial does not switch off the company's monthly bills.",
      },
      {
        slug: 'delivery-must-reach-the-buyer',
        title: 'Delivery must reach the buyer',
        script:
          "A finished setup on our founder's laptop is not yet a handoff to Birch. They need to agree who receives it, how the team starts using it and what counts as the promised delivery. In this fictional trial, the founder arranges a setup session. Another offer might need a different handoff. Name the responsibilities.",
      },
      {
        slug: 'ask-whether-the-outcome-happened',
        title: 'Ask whether the outcome happened',
        script:
          "After the trial begins, ask Birch what happened to the scheduling problem. Can the team plan next week's jobs? Where does it still get stuck? If nobody is using the setup, find out why before proposing more work. The next conversation is about the customer's result, not just whether our team completed its task.",
      },
      {
        slug: 'recurring-is-conditional',
        title: 'Recurring is conditional',
        script:
          "Our founder can ask whether Birch wants another project or an ongoing arrangement. Put that possible work back into a new opportunity. Do not put money into next month's plan just because the trial went well. Any repeat purchase needs an agreement. Specify its price and payment schedule instead of assuming the first agreement covers it.",
      },
    ];
    // ACT
    const script = scriptOf(slideAt(AFTER_SALE));
    // ASSERT
    expect(script).toEqual(expected);
  });

  it('reads the after-sale flow, then the conditional return path, then the payment-terms marker', () => {
    // ARRANGE
    const expected = {
      label: "From agreement to the customer's outcome",
      stages: [
        "Production Do the promised work Fictional: prepare Birch's scheduling setup and make time to support it",
        "Delivery / operations Get it into the customer's hands Fictional: a setup session that agrees who receives it, how the team starts and what counts as delivered",
        "Customer success Check the customer's outcome Fictional: can Birch plan next week's jobs? Where does it still get stuck?",
      ],
      after: [
        "Repeat or recurring business, if earned and agreed New opportunity Needs its own agreement, price and payment schedule. Not in next month's cash plan before then",
        'Payment follows agreed terms: before, during or after delivery Before delivery During After delivery',
      ],
      targets: ['return', 'payment'],
    };
    const $ = sceneOf(AFTER_SALE);
    // ACT
    const flow = $('ol[aria-label]').first();
    const stages = flow
      .children('li')
      .toArray()
      .map((stage) => wordsOf($, $(stage).find('[data-target]')));
    const following = flow.nextAll().toArray();
    const after = following.map((part) => wordsOf($, part));
    const targets = following.map((part) => $(part).attr('data-target'));
    // ASSERT
    expect({ label: flow.attr('aria-label'), stages, after, targets }).toEqual(expected);
  });

  it('gives the payment marker the one primary emphasis, and the return path neither primary nor success', () => {
    // ARRANGE
    const expected = { primary: ['payment'], returnTones: [] };
    const $ = sceneOf(AFTER_SALE);
    // ACT
    const primary = $('.border-primary')
      .toArray()
      .map((element) => $(element).attr('data-target'));
    const returnTones = $('[data-target="return"], [data-target="return"] *')
      .toArray()
      .flatMap((element) => ($(element).attr('class') ?? '').split(' '))
      .filter((name) => /-(primary|success)$/.test(name));
    // ASSERT
    expect({ primary, returnTones }).toEqual(expected);
  });

  it('links production and customer success to their Speaker notes', () => {
    // ARRANGE
    const expected = {
      production: 'doing-work-by-hand-can-reveal-process-details',
      success: 'relationship-performance-is-broader-than-trust',
    };
    const $ = sceneOf(AFTER_SALE);
    // ACT
    const refs = {
      production: $('[data-target="production"] [data-context-ref]').attr('data-context-ref'),
      success: $('[data-target="customer-success"] [data-context-ref]').attr('data-context-ref'),
    };
    // ASSERT
    expect(refs).toEqual(expected);
  });

  it('places "Watch your cashflow, revenue pulled in" last with its Dossier Speaker notes and sources', () => {
    // ARRANGE
    const expected = {
      id: PULLED_IN,
      level: 'h3',
      title: 'Watch your cashflow, revenue pulled in',
      notes: [
        {
          slug: 'a-prepayment-reverses-the-receipt-lag',
          header: 'A prepayment reverses the receipt lag',
          description:
            'IFRS 15 describes a contract liability when a customer pays, or payment becomes due, before transfer of the promised goods or services. Cash can arrive before recognised revenue; an advance payment brings obligations as well as liquidity [1].',
          target: 'moved-receipt',
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
          slug: 'deferred-payment-carries-liquidity-risk',
          header: 'Deferred payment carries liquidity risk',
          description:
            "The EU late-payment directive describes deferred-payment B2B trade and the adverse liquidity effects of late payment. Its contractual-period rules are jurisdiction-specific, not a universal promise about when a customer's invoice will clear [1].",
          target: 'original-receipt',
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
    };
    // ACT
    const { id, level, title, notes } = slideAt(PULLED_IN);
    // ASSERT
    expect({ id, level, title, notes }).toEqual(expected);
  });

  it('gives "Watch your cashflow, revenue pulled in" its five Voice script beats, verbatim', () => {
    // ARRANGE
    const expected = [
      {
        slug: 'move-cash-not-the-signature',
        title: 'Move cash, not the signature',
        script:
          'Return to our company with one hundred thousand dollars at the start of January. Let us change one assumption. Instead of receiving the million in April, suppose it receives the money in February. This is an alternative story, not a prediction. The monthly payments stay at fifty thousand dollars. Only the receipt date moves.',
      },
      {
        slug: 'check-februarys-arithmetic',
        title: "Check February's arithmetic",
        script:
          "January still ends with fifty thousand dollars. February starts there, adds one million and pays out fifty thousand. It closes with one million dollars. March's payment leaves nine hundred and fifty thousand. April's payment leaves nine hundred thousand. In this version, March is funded. Moving the receipt changes the result without changing the deal's size.",
      },
      {
        slug: 'ask-what-could-make-receipt-earlier',
        title: 'Ask what could make receipt earlier',
        script:
          "What would have to change for that version to happen? Our founder would need to discuss timing with the buyer. When could a decision happen? What work must be delivered? Which payment arrangement would both sides accept? Starting sales earlier creates time to explore those questions. It does not give the founder control over the buyer's answer.",
      },
      {
        slug: 'keep-the-backup-question-open',
        title: 'Keep the backup question open',
        script:
          'The founder should still ask what happens if this earlier receipt is not available. Could the company reduce its planned payments? Would anyone agree to provide bridge funding? Those options need their own work and decisions. Keep the original unfunded case visible. A sales conversation is not a replacement for an emergency funding plan.',
      },
      {
        slug: 'find-the-work-before-the-payment',
        title: 'Find the work before the payment',
        script:
          'Now walk backwards from the required receipt. What must happen after agreement? What must be settled to close? Which questions need opportunity work? Which first conversation could open that work? Which prospects must we research to get that conversation? This chain gives the founder a starting point long before she needs the money.',
      },
    ];
    // ACT
    const script = scriptOf(slideAt(PULLED_IN));
    // ASSERT
    expect(script).toEqual(expected);
  });

  it('returns the same fictional board with the receipt moved to February, every balance written out', () => {
    // ARRANGE
    const expected = [
      { tone: 'neutral', text: 'January Opening cash $100,000 Cash costs $50,000 Receipts $0 Closing cash $50,000' },
      {
        tone: 'neutral',
        text: 'February February: $0 → $1,000,000 Opening cash $50,000 Customer receipt $1,000,000 Moved from April Cash costs $50,000 Closing cash $1,000,000',
      },
      {
        tone: 'neutral',
        text: 'March Opening cash $1,000,000 Cash costs $50,000 Receipts $0 Closing cash $950,000',
      },
      {
        tone: 'neutral',
        text: 'April Opening cash $950,000 Original receipt date Moved to February Cash costs $50,000 Closing cash $900,000',
      },
    ];
    const $ = sceneOf(PULLED_IN);
    // ACT
    const months = $('figure ol > li')
      .toArray()
      .map((month) => ({ tone: $(month).attr('data-tone'), text: wordsOf($, month) }));
    // ASSERT
    expect(months).toEqual(expected);
  });

  it('marks only the moved receipt as the primary focus, with the vacated and counterfactual papers in words', () => {
    // ARRANGE
    const expected = [
      {
        target: 'counterfactual',
        state: 'counterfactual',
        tone: 'neutral',
        text: 'Counterfactual: customer cash arrives in February; costs unchanged',
      },
      {
        target: 'moved-receipt',
        state: 'actual',
        tone: 'primary',
        text: 'Customer receipt $1,000,000 Moved from April',
      },
      {
        target: 'original-receipt',
        state: 'vacated',
        tone: 'neutral',
        text: 'Original receipt date Moved to February',
      },
    ];
    const $ = sceneOf(PULLED_IN);
    // ACT
    const marked = $('figure [data-state][data-target]')
      .toArray()
      .map((paper) => ({
        target: $(paper).attr('data-target'),
        state: $(paper).attr('data-state'),
        tone: $(paper).attr('data-tone'),
        text: wordsOf($, paper),
      }));
    // ASSERT
    expect(marked).toEqual(expected);
  });

  it('keeps the rule on the board and the labelled warning beneath it', () => {
    // ARRANGE
    const expected = {
      label: 'Fictional example · cash received, not booked revenue',
      rule: 'Closing cash = opening cash + receipts − payments',
      warning: { role: 'note', text: 'An earlier signature alone changes none of these cash balances' },
    };
    const $ = sceneOf(PULLED_IN);
    // ACT
    const warning = $('figure > div').last().find('[data-target="warning"]');
    const seen = {
      label: wordsOf($, 'figcaption'),
      rule: wordsOf($, $('figure ol').next('p')),
      warning: { role: warning.attr('role'), text: wordsOf($, warning) },
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('links the moved receipt and the original receipt date to their Speaker notes', () => {
    // ARRANGE
    const expected = {
      moved: 'a-prepayment-reverses-the-receipt-lag',
      original: 'deferred-payment-carries-liquidity-risk',
    };
    const $ = sceneOf(PULLED_IN);
    // ACT
    const refs = {
      moved: $('[data-target="moved-receipt"] [data-context-ref]').attr('data-context-ref'),
      original: $('[data-target="original-receipt"] [data-context-ref]').attr('data-context-ref'),
    };
    // ASSERT
    expect(refs).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('gives the section slide no caption, since the Dossier names none', () => {
    // ARRANGE
    const expected = 0;
    // ACT
    const captions = sceneOf(OPENER)('[data-target="caption"]').length;
    // ASSERT
    expect(captions).toBe(expected);
  });

  it.each([
    { id: SALE, targets: ['title', 'caption', 'leads', 'prospect', 'gate', 'opportunities', 'closing', 'lost'] },
    {
      id: AFTER_SALE,
      targets: ['title', 'caption', 'production', 'delivery', 'customer-success', 'return', 'payment'],
    },
    {
      id: PULLED_IN,
      targets: ['title', 'caption', 'counterfactual', 'moved-receipt', 'original-receipt', 'warning'],
    },
  ])('marks every target of $id on exactly one element', ({ id, targets }) => {
    // ARRANGE
    const expected = targets.map((name) => ({ name, count: 1 }));
    const $ = sceneOf(id);
    // ACT
    const counts = targets.map((name) => ({ name, count: $(`[data-target="${name}"]`).length }));
    // ASSERT
    expect(counts).toEqual(expected);
  });

  it.each([SALE, AFTER_SALE])('keeps the drawn arrows of %s out of the words a reader hears', (id) => {
    // ARRANGE
    const expected: string[] = [];
    const $ = sceneOf(id);
    // ACT
    const spoken = $('[aria-hidden="true"]')
      .toArray()
      .map((element) => wordsOf($, element))
      .filter((words) => words !== '');
    // ASSERT
    expect(spoken).toEqual(expected);
  });

  it('draws the receipt move as a hidden lane whose words the papers already say', () => {
    // ARRANGE
    const expected = {
      lane: ['Receipt moved from April to February'],
      words: ['Moved from April', 'Moved to February'],
    };
    const $ = sceneOf(PULLED_IN);
    // ACT
    const lane = $('figure [aria-hidden="true"]')
      .toArray()
      .map((element) => wordsOf($, element))
      .filter((words) => words !== '');
    const words = $('figure ol [data-state] > span:last-child')
      .toArray()
      .map((line) => wordsOf($, line))
      .filter((line) => line.startsWith('Moved'));
    // ASSERT
    expect({ lane, words }).toEqual(expected);
  });
});

describe('edge cases', () => {
  it.each([OPENER, SALE, AFTER_SALE, PULLED_IN])(
    'shows German readers %s as an explicit provisional English fallback',
    (id) => {
      // ARRANGE
      const english = wordsOf(sceneOf(id, 'en'), 'article');
      // ACT
      const german = wordsOf(sceneOf(id, 'de'), 'article');
      // ASSERT
      expect(german).toBe(english);
    },
  );
});
