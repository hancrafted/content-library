import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { HumanJudgmentCard } from './human-judgment-card';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whatRemainsHuman = slide({
  slug: 'what-remains-human',
  messages: { en, de },
  notes: [
    { slug: 'ground-truth', target: 'title' },
    { slug: 'accountability', target: 'judgment-card' },
  ],
  segments: [{ slug: 'accountability-ground-truth' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <HumanJudgmentCard {...target('judgment-card')} />
    </SlideFrame>
  ),
});
