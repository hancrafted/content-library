import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Seam } from './seam';

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <div className="grid grid-cols-1 items-start gap-5 rounded-xl bg-muted p-6 shadow-inner md:grid-cols-12">
          <Seam
            from={{
              team: t('seam.from.team'),
              fact: t('seam.from.fact'),
              detail: t('seam.from.detail'),
              agent: t('agent'),
            }}
            to={{
              team: t('seam.to.team'),
              fact: t('seam.to.fact'),
              detail: t('seam.how'),
              external: { tag: t('external.tag'), label: t('external.label') },
            }}
            handoff={t('seam.handoff')}
            contract={{
              heading: t('contract.label'),
              size: 'compact',
              terms: {
                receives: t('contract.terms.receives'),
                delivers: t('contract.terms.delivers'),
                checkedBy: t('contract.terms.checkedBy'),
              },
              receives: t.rich('contract.receives'),
              delivers: t('contract.delivers'),
              checkedBy: t('contract.checkedBy'),
            }}
          />
          <div
            data-goal
            className="mt-4 flex -rotate-1 flex-col gap-2 rounded-sm bg-card p-4 shadow-md ring-2 ring-foreground md:col-span-2"
          >
            <span className="text-caption font-semibold uppercase">{t('goal.label')}</span>
            <p className="text-caption font-semibold">{t('goal.text')}</p>
          </div>
        </div>
      </SlideFrame>
    </>
  ),
});
