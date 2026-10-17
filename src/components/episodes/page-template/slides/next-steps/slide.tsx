import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { SectionTrack } from './section-track';

export const nextSteps = slide({
  slug: 'next-steps',
  messages: { en, de },
  content: () => (
    <SlideFrame>
      <SectionTrack sections={2} reached={2} className="mt-10" />
    </SlideFrame>
  ),
});
