import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PolishedPlan } from './polished-plan';

const ROWS = ['date', 'venue', 'food', 'budget', 'evening', 'playlist'] as const;

/*
 * A Scene on the basic-page parts: the title and caption, then the plan as it
 * comes back, polished and confident, with the budget one zero too high and a
 * pen hovering at that row. No red mark: a warning colour would answer the
 * question the viewer should ask. Built without motion (Han's decision for
 * this Episode).
 */
export const fourOclockThePlanComesBack = slide({
  slug: 'four-oclock-the-plan-comes-back',
  messages: { en, de },
  notes: [
    {
      slug: 'confident-and-wrong',
      target: 'plan',
      sources: [
        {
          slug: 'jagged-frontier',
          url: 'https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf',
        },
      ],
    },
    {
      slug: 'delegating-raises-confidence',
      target: 'off-line',
      sources: [
        { slug: 'insecure-code-with-ai-assistants', url: 'https://arxiv.org/abs/2211.03622' },
        { slug: 'lost-at-c', url: 'https://arxiv.org/abs/2208.09727' },
      ],
    },
    {
      slug: 'gatekeeper',
      target: 'pen',
      sources: [
        {
          slug: 'mata-v-avianca',
          url: 'https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'the-plan-lands' }, { slug: 'one-line-is-off' }, { slug: 'you-catch-it-or-not' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <PolishedPlan
        {...target('plan')}
        heading={t('plan.heading')}
        rows={ROWS.map((slug) => ({
          slug,
          label: t(`plan.rows.${slug}.label`),
          value: t(`plan.rows.${slug}.value`),
        }))}
        offRow="budget"
        offTarget={target('off-line')}
        penTarget={target('pen')}
      />
    </SlideFrame>
  ),
});
