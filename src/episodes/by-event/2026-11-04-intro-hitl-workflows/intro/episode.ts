import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { agendaSection } from './sections/agenda';
import { checkIn1Section } from './sections/check-in-1';
import { checkIn2Section } from './sections/check-in-2';
import { checkIn3Section } from './sections/check-in-3';
import { groundingSection } from './sections/grounding';
import { pollSection } from './sections/poll';
import { hero } from './slides/hero/slide';

export const introHitlWorkflows = episode({
  slug: 'intro',
  messages: { en, de },
  title: hero,
  sections: [groundingSection, agendaSection, pollSection, checkIn1Section, checkIn2Section, checkIn3Section],
});
