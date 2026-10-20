import { episode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { managingTheAttentionSpanSection } from './sections/managing-the-attention-span';
import { theAisAttentionSpanSection } from './sections/the-ais-attention-span';
import { theLongPhoneCallSection } from './sections/the-long-phone-call';
import { whatFillsTheWindowSection } from './sections/what-fills-the-window';
import { hero } from './slides/hero/slide';

/*
 * "Why AI has a weird attention span you must learn to manage": AI's attention span, its context window, is a
 * limited resource you manage. Built from the approved Spec under docs/episodes/ai-attention-span/. Upcoming until
 * its video is live.
 *
 * Each Section is one placement marker under `sections/`, named after the Section's slug and listed here in Spec
 * order: a Section job adds its page Slides to its own marker, so parallel Section branches never edit one line.
 */
export const aiAttentionSpan = episode({
  slug: 'ai-attention-span',
  messages: { en, de },
  title: hero,
  sections: [
    theLongPhoneCallSection,
    theAisAttentionSpanSection,
    whatFillsTheWindowSection,
    managingTheAttentionSpanSection,
  ],
});
