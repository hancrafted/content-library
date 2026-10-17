import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { SectionTrack } from '@/components/slide-shared/section-track';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const nextSteps = slide({
  slug: 'next-steps',
  messages: { en, de },
  content: () => (
    <SlideFrame>
      <SectionTrack sections={2} reached={2} className="mt-10" />
    </SlideFrame>
  ),
});
