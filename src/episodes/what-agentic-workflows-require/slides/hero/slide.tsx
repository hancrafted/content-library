import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Seam } from './seam';

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif of picked Option 0b: the party board zoomed onto
 * one seam, Food & drinks handing "31 vegetarian" to the venue's kitchen, with the contract card agreed at the seam as
 * the focal part and the goal note at the right edge. The shared header renders the `h1` and this Slide's caption
 * above it. Each section slide echoes the same seam at its Section's state. The empty Backdrop is the Title slide's
 * one Backdrop, holding no glow, so the board stays the one thing to look at.
 */
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
              label: t('contract.label'),
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
