import { SpineStepper } from '@/components/episodes/page-template/client/spine-stepper.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('page-template');

// Notes: `target` is the Canvas element a note explains (title, caption, prose, or a name set with the kit's `target`).
// Add `sources: [{ slug, url }]` to cite; its title goes under `notes.<note>.sources.<slug>.title`.
// Minutes are spoken time, so set them only on a Slide with a Voice script.
export const whyATemplate = slide({
  slug: 'why-a-template',
  minutes: { en: 2, de: 2 },
  notes: [
    { slug: 'reference-episode', target: 'prose' },
    { slug: 'spine', target: 'spine' },
  ],
  segments: [
    { slug: 'one-breath', from: 0, to: 1 },
    { slug: 'the-spine', from: 1, to: 2, bridge: true },
  ],
  content: ({ t, ref, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div {...target('spine')} className="mt-10">
        <SpineStepper
          labels={{ episode: t('spine.episode'), section: t('spine.section'), slide: t('spine.slide') }}
          button={t('spine.next')}
        />
      </div>
      <div className="mt-auto pt-10">
        <SlideProse data-target="prose">{t.rich('prose', { ref: ref('reference-episode') })}</SlideProse>
      </div>
    </SlideFrame>
  ),
});
