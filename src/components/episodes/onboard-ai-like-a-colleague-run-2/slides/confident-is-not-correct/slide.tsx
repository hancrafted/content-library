import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { DayOneNote } from '@/components/slide-shared/day-one-note';
import { Check, Flag } from 'lucide-react';
import styles from './confident-is-not-correct.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';

const PLAN_ROWS = ['date', 'venue', 'catering', 'budget', 'programme'] as const;
const FLAGGED = 'catering';

/*
 * The plan that came back: a Scene from the basic-page parts (FE-002 §3), its body the day-one note as the newcomer's
 * output. Each verified claim gets a check in your colour, one by one in reading order; the catering line stays
 * unverified and is flagged last, its caption readable at rest. CSS only, so no client widget.
 */
export const confidentIsNotCorrect = slide({
  slug: 'confident-is-not-correct',
  messages: { en, de },
  notes: [
    {
      slug: 'invented-sources-defended',
      target: 'flag',
      sources: [
        {
          slug: 'mata-v-avianca',
          url: 'https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf',
        },
      ],
    },
    {
      slug: 'wrong-answers-read-as-coherent',
      target: 'plan',
      sources: [
        {
          slug: 'jagged-technological-frontier',
          url: 'https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf',
        },
      ],
    },
    {
      slug: 'a-check-can-be-cheap',
      target: 'caption',
      sources: [{ slug: 'surgical-safety-checklist', url: 'https://pubmed.ncbi.nlm.nih.gov/19144931/' }],
    },
  ],
  segments: [{ slug: 'the-profile-again' }, { slug: 'you-check-as-with-any-new-hire' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption {...target('caption')}>{t('caption')}</SlideCaption>
      <div className="my-auto w-full max-w-2xl self-center pt-10">
        <DayOneNote
          {...target('plan')}
          label={
            <>
              <span aria-hidden className="mr-2 inline-block size-2 rounded-full bg-ai" />
              {t('plan.label')}
            </>
          }
          rows={PLAN_ROWS.map((id) =>
            id === FLAGGED
              ? {
                  id,
                  term: t(`plan.rows.${id}.term`),
                  text: (
                    <>
                      {t(`plan.rows.${id}.text`)}
                      <span {...target('flag')} className="block text-caption font-medium text-primary">
                        {t('plan.flagCaption')}
                      </span>
                    </>
                  ),
                  className: '-mx-3 rounded-md px-3 ring-1 ring-primary',
                  marker: <Flag aria-label={t('plan.flagged')} className={`size-5 text-primary ${styles.flag}`} />,
                }
              : {
                  id,
                  term: t(`plan.rows.${id}.term`),
                  text: t(`plan.rows.${id}.text`),
                  marker: <Check aria-label={t('plan.checked')} className={`size-5 text-human ${styles.mark}`} />,
                },
          )}
        />
      </div>
    </SlideFrame>
  ),
});
