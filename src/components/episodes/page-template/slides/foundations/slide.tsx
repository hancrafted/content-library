import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { SectionTrack } from '@/components/slide-shared/section-track';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A Section's first Slide is its section slide: the `title` in its own Translation files names the Section, and the
// Slide header shows it. Its Scene echoes the Hero motif: the track, reached up to this Section.
export const foundations = slide({
  slug: 'foundations',
  messages: { en, de },
  content: () => (
    <SlideFrame>
      <SectionTrack sections={2} reached={1} className="mt-10" />
    </SlideFrame>
  ),
});
