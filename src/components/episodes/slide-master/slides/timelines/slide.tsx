import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const timelines = slide({
  slug: 'timelines',
  messages: { en, de },
  // The Slide header shows the Section's title and caption; the Scene echoes the Title slide's glow, this Episode's Hero motif.
  content: () => (
    <SlideBackdrop mobile>
      <div className="hero-glow absolute inset-0 text-primary" />
    </SlideBackdrop>
  ),
});
