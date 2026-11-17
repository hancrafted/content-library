import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame, SlideProse } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { SpineStepper } from './spine-stepper.client';

// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
// decision: docs/decision-records/0013-context-markers.md
export const whyATemplate = slide({
  slug: 'why-a-template',
  messages: { en, de },
  notes: [
    { slug: 'reference-episode', target: 'prose' },
    { slug: 'spine', target: 'spine' },
  ],
  segments: [{ slug: 'one-breath' }, { slug: 'the-spine', bridge: true }],
  content: ({ t, marker, Marker, target }) => (
    <SlideFrame>
      <div {...target('spine')} className="relative mt-10 w-fit pr-8">
        <SpineStepper
          labels={{ episode: t('spine.episode'), section: t('spine.section'), slide: t('spine.slide') }}
          button={t('spine.next')}
        />
        <Marker note="spine" />
      </div>
      <div className="mt-auto pt-10">
        <SlideProse {...target('prose')}>{t.rich('prose', { marker: marker('reference-episode') })}</SlideProse>
      </div>
    </SlideFrame>
  ),
});
