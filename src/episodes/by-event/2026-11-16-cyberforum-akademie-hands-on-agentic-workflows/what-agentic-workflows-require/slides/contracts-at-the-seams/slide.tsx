import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ContractCard } from '@/episodes/components/slide-shared/contract-card/contract-card';
import { BoardNote, DoerBadge, ExternalNote } from '@/episodes/components/slide-shared/party-board/sticky-note';
import de from './i18n/de.json';
import en from './i18n/en.json';

const MEYER = {
  slug: 'meyer-design-by-contract',
  url: 'https://pages.mtu.edu/~aebnenas/teaching/spring2010/cs3141/readings/meyerPDF.pdf',
};
const EIFFEL = { slug: 'eiffel-design-by-contract', url: 'https://www.eiffel.com/values/design-by-contract/' };

function HandoffArrow() {
  return (
    <svg viewBox="0 0 400 24" className="hidden h-6 w-full @4xl:block" preserveAspectRatio="none" aria-hidden="true">
      <path d="M2 12 H392" className="fill-none stroke-foreground" strokeWidth={3} vectorEffect="non-scaling-stroke" />
      <path
        d="M380 2 L396 12 L380 22"
        className="fill-none stroke-foreground"
        strokeWidth={3}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export const contractsAtTheSeams = slide({
  slug: 'contracts-at-the-seams',
  messages: { en, de },
  captionNote: 'a-contract-has-two-sides',
  notes: [
    { slug: 'a-contract-has-two-sides', target: 'caption', sources: [MEYER] },
    { slug: 'pre-and-postcondition', target: 'contract', sources: [MEYER] },
    { slug: 'no-defensive-duplication', target: 'one-side', sources: [MEYER] },
    { slug: 'same-split-in-eiffel', target: 'contract', sources: [EIFFEL] },
  ],
  segments: [
    { slug: 'design-by-contract' },
    { slug: 'receives-delivers-checked-by' },
    { slug: 'leave-the-how-open' },
    { slug: 'the-egg-dishes' },
  ],
  content: ({ t, marker, Marker, target }) => (
    <SlideFrame className="@container">
      <div className="grid grid-cols-1 items-center gap-6 rounded-xl bg-muted p-5 @3xl:p-8 @4xl:grid-cols-12">
        <div className="@4xl:col-span-3">
          <BoardNote
            kicker={t('food.kicker')}
            text={t('food.task')}
            hint={t('food.hint')}
            tilt="left"
            badge={<DoerBadge doer="ai" label={t('badges.agent')} />}
            className="p-5"
          />
        </div>
        <div className="flex flex-col gap-4 @4xl:col-span-6">
          <HandoffArrow />
          <div {...target('contract')}>
            <ContractCard
              heading={t('contract.heading')}
              tag={t('contract.seam')}
              terms={{
                receives: t('contract.terms.receives'),
                delivers: t('contract.terms.delivers'),
                checkedBy: t('contract.terms.checkedBy'),
              }}
              termMarkers={{ receives: <Marker note="pre-and-postcondition" placement="beside" /> }}
              receives={
                <>
                  {t('contract.receives')} <b>{t('contract.definition')}</b>
                </>
              }
              delivers={t('contract.delivers')}
              checkedBy={t('contract.checkedBy')}
              how={t('contract.how')}
            />
          </div>
          <p {...target('one-side')} className="text-caption text-muted-foreground">
            {t.rich('oneSide', { side: marker('no-defensive-duplication') })}
          </p>
        </div>
        <div className="flex flex-col gap-4 @4xl:col-span-3">
          <ExternalNote
            kicker={t('kitchen.kicker')}
            text={t('kitchen.text')}
            hint={t('kitchen.hint')}
            badge={<DoerBadge doer="human" label={t('badges.person')} />}
            className="p-5"
          />
          <BoardNote
            kicker={t('dinner.kicker')}
            text={t('dinner.text')}
            tilt="left"
            mark="fixed"
            markLabel={t('fixed')}
          />
        </div>
      </div>
    </SlideFrame>
  ),
});
