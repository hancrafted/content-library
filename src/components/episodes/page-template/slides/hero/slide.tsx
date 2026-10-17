import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/components/slide-master/slide-master';
import { SectionTrack } from '@/components/slide-shared/page-template-section-track';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The Title slide's hero Scene (the record's `title`): the visual only, since the container renders the Episode's
// `h1` and caption above it. It sets the Hero motif, every Section a stop on one track, and each section slide echoes
// it. Its notes and Voice script, if any, stay on the record.
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
