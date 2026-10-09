import { SpineStepper } from '@/components/episodes/page-template/client/spine-stepper.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('page-template');

// Notes: `target` is the Canvas element a note explains. Mark it with the kit's `{...target('name')}`, as the spine and
// the prose below do; the kit's `<Title>` marks `title`, and a Slide layout such as BasicPageSlide marks its own.
// Add `sources: [{ slug, url }]` to cite; its title goes under `notes.<note>.sources.<slug>.title`.
// Reading time is counted from the Voice script's words (`speaking-time.pure.ts`): no minutes or spans to set.
export const whyATemplate = slide({
  slug: 'why-a-template',
  notes: [
    { slug: 'reference-episode', target: 'prose' },
    { slug: 'spine', target: 'spine' },
  ],
  segments: [{ slug: 'one-breath' }, { slug: 'the-spine', bridge: true }],
  content: ({ t, ref, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('spine')} className="mt-10">
        <SpineStepper
          labels={{ episode: t('spine.episode'), section: t('spine.section'), slide: t('spine.slide') }}
          button={t('spine.next')}
        />
      </div>
      <div className="mt-auto pt-10">
        <SlideProse {...target('prose')}>{t.rich('prose', { ref: ref('reference-episode') })}</SlideProse>
      </div>
    </SlideFrame>
  ),
});
