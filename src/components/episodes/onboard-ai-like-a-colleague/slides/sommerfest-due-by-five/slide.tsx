import { slide } from '@/components/slide-master/slide';
import { ThreeColumnSlide } from '@/components/slide-master/three-column-slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The thought experiment's set-up as three plain facts: the job, the clock and
 * the new colleague. No labels beyond the three card heads. Built without
 * motion (Han's decision for this Episode).
 */
export const sommerfestDueByFive = slide({
  slug: 'sommerfest-due-by-five',
  messages: { en, de },
  notes: [
    {
      slug: 'colleague-not-tool',
      target: 'colleague',
      sources: [
        {
          slug: 'anthropic-be-clear-and-direct',
          url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct',
        },
      ],
    },
    {
      slug: 'same-lens',
      target: 'colleague',
      sources: [
        {
          slug: 'pragmatic-engineer-matt-pocock',
          url: 'https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock',
        },
        {
          slug: 'mollick-good-enough-prompting',
          url: 'https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough',
        },
      ],
    },
    {
      slug: 'intern-wrong-rank',
      target: 'colleague',
      sources: [
        {
          slug: 'mollick-good-enough-prompting',
          url: 'https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough',
        },
      ],
    },
  ],
  segments: [{ slug: 'the-job' }, { slug: 'who-walks-in' }, { slug: 'take-a-second' }],
  content: ({ t, Title }) => {
    const column = (slug: 'job' | 'clock' | 'colleague') => ({
      slug,
      title: t(`columns.${slug}.title`),
      prose: t(`columns.${slug}.prose`),
    });
    return (
      <ThreeColumnSlide
        title={<Title>{t('title')}</Title>}
        caption={t('caption')}
        columns={[column('job'), column('clock'), column('colleague')]}
      />
    );
  },
});
