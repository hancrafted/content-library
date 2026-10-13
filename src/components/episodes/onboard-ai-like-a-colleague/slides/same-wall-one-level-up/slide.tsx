import { slide } from '@/components/slide-master/slide';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The three-column master unchanged: you, your team, your organization, each
 * with where the effort went. The shared "reinvest" is carried by the
 * caption; the Dossier's drawn arrow is dropped pending Han (see #102).
 * Built without motion (Han's decision for this Episode).
 */
export const sameWallOneLevelUp = slide({
  slug: 'same-wall-one-level-up',
  messages: { en, de },
  notes: [
    {
      slug: 'complementary-investment',
      target: 'caption',
      sources: [{ slug: 'productivity-j-curve', url: 'https://www.nber.org/papers/w25148' }],
    },
    {
      slug: 'adoption-without-impact',
      target: 'organization',
      sources: [{ slug: 'firm-data-on-ai', url: 'https://www.nber.org/papers/w34836' }],
    },
    {
      slug: 'disputed-headline',
      target: 'organization',
      sources: [
        {
          slug: 'genai-divide',
          url: 'https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf',
        },
        {
          slug: 'accountable-acceleration',
          url: 'https://ai.wharton.upenn.edu/wp-content/uploads/2025/10/2025-Wharton-GBK-AI-Adoption-Report_Executive-Summary.pdf',
        },
      ],
    },
    {
      slug: 'skills-lag-usage',
      target: 'organization',
      sources: [
        {
          slug: 'accountable-acceleration',
          url: 'https://ai.wharton.upenn.edu/wp-content/uploads/2025/10/2025-Wharton-GBK-AI-Adoption-Report_Executive-Summary.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'not-only-you' }, { slug: 'adopted-not-absorbed' }, { slug: 'reinvest' }],
  content: ({ t, Title }) => {
    const column = (slug: 'you' | 'team' | 'organization') => ({
      slug,
      title: t(`columns.${slug}.title`),
      prose: t(`columns.${slug}.prose`),
    });
    return (
      <ThreeColumnSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        columns={[column('you'), column('team'), column('organization')]}
      />
    );
  },
});
