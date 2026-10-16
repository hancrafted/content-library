import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { StageLanes } from './stage-lanes';
import type { Lane } from './stage-notes';

const LATE_PAYMENT_DIRECTIVE = {
  slug: 'late-payment-directive',
  url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0007',
};

const AFTER_SALE = 'after-sale';

/** The invented lead list, shared by name with Slide 4's deal board. */
const LEAD_LIST = ['brightfield', 'kestrel', 'orbit'] as const;

/** The opportunity work, one strip each. */
const WORK = ['followUp', 'material', 'meetings', 'negotiation'] as const;

/** What follows the signature before the cash, one dashed strip each. */
const AFTER = ['production', 'delivery', 'success'] as const;

const CHIPS = ['coldCall', 'inbound', 'network'] as const;

/**
 * The stages of a sale as board lanes (Spec Option 3a): Leads, ringed as the part in your hands, then Opportunities,
 * Closing and a faint After-sale lane that ends in the cash note, under two brackets and over a time axis. Read, not
 * built: no motion.
 */
export const stagesOfSale = slide({
  slug: 'stages-of-sale',
  messages: { en, de },
  notes: [
    { slug: 'cash-waits-on-paperwork', target: AFTER_SALE, sources: [LATE_PAYMENT_DIRECTIVE] },
    { slug: 'the-lags-add-up', target: 'title', sources: [LATE_PAYMENT_DIRECTIVE] },
  ],
  segments: [
    { slug: 'leads-step-one' },
    { slug: 'first-contact-step-two' },
    { slug: 'opportunities-are-the-work' },
    { slug: 'closing-is-not-cash' },
  ],
  content: ({ t, Title, target }) => {
    const lanes: Lane[] = [
      {
        slug: 'leads',
        label: t('lanes.leads.label'),
        span: 3,
        emphasis: 'primary',
        notes: [
          {
            slug: 'generation',
            step: t('lanes.leads.notes.generation.step'),
            title: t('lanes.leads.notes.generation.title'),
            text: t('lanes.leads.notes.generation.text'),
            list: LEAD_LIST.map((slug) => ({
              slug,
              company: t(`lanes.leads.notes.generation.list.${slug}.company`),
              contact: t(`lanes.leads.notes.generation.list.${slug}.contact`),
            })),
          },
          {
            slug: 'contact',
            step: t('lanes.leads.notes.contact.step'),
            title: t('lanes.leads.notes.contact.title'),
            chips: CHIPS.map((chip) => t(`lanes.leads.notes.contact.chips.${chip}`)),
          },
        ],
      },
      {
        slug: 'opportunities',
        label: t('lanes.opportunities.label'),
        span: 3,
        footnote: t('lanes.opportunities.footnote'),
        notes: [
          {
            slug: 'interest',
            title: t('lanes.opportunities.notes.interest.title'),
            text: t('lanes.opportunities.notes.interest.text'),
          },
          ...WORK.map((slug) => ({ slug, title: t(`lanes.opportunities.notes.${slug}`) })),
        ],
      },
      {
        slug: 'closing',
        label: t('lanes.closing.label'),
        span: 3,
        footnote: t('lanes.closing.footnote'),
        notes: [
          {
            slug: 'agreement',
            title: t('lanes.closing.notes.agreement.title'),
            text: t('lanes.closing.notes.agreement.text'),
            signature: t('lanes.closing.notes.agreement.signature'),
          },
        ],
      },
      {
        slug: AFTER_SALE,
        label: t('lanes.afterSale.label'),
        span: 3,
        emphasis: 'faint',
        target: target(AFTER_SALE)['data-target'],
        notes: [
          ...AFTER.map((slug) => ({ slug, title: t(`lanes.afterSale.notes.${slug}`) })),
          {
            slug: 'cash',
            kind: 'cash',
            kindLabel: t('lanes.afterSale.notes.cash.kind'),
            title: t('lanes.afterSale.notes.cash.title'),
            text: t('lanes.afterSale.notes.cash.text'),
          },
        ],
      },
    ];
    return (
      <SlideFrame className="gap-10">
        <div>
          <p className="font-mono text-caption font-semibold tracking-widest text-muted-foreground uppercase">
            {t('kicker')}
          </p>
          <div className="mt-3">
            <Title>{t('title')}</Title>
          </div>
          <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
        </div>
        <StageLanes
          lanes={lanes}
          brackets={[
            { slug: 'yours', label: t('brackets.yours'), from: 1, to: 1, emphasis: 'primary' },
            { slug: 'calendar', label: t('brackets.calendar'), from: 2, to: 4, emphasis: 'muted' },
          ]}
          axis={[
            { slug: 'week', label: t('axis.week'), emphasis: true },
            { slug: 'months', label: t('axis.months') },
            { slug: 'signature', label: t('axis.signature') },
            { slug: 'money', label: t('axis.money') },
          ]}
        />
      </SlideFrame>
    );
  },
});
