import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { SectionTrack } from '@/episodes/components/slide-shared/episode-template-section-track';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: () => (
    <>
      <SlideBackdrop mobile>
        <div className="hero-glow absolute inset-0 text-primary" />
      </SlideBackdrop>
      <SlideFrame>
        <SectionTrack sections={2} className="mt-10" />
      </SlideFrame>
    </>
  ),
});
