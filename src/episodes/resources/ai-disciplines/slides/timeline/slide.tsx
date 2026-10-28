import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { PresetReadme } from '@/episodes/components/slide-shared/preset-readme/preset-readme';
import { AiDisciplines } from '@/explorable-explanations/ai-disciplines/ai-disciplines';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The timeline in its `timeline` Preset: nothing lit, every scene at rest until the mouse enters. A readme on the Slide says what it shows, what to try, what to notice. */
export const timeline = slide({
  slug: 'timeline',
  messages: { en, de },
  notes: [{ slug: 'timeline', target: 'timeline' }],
  content: ({ t, locale, target }) => (
    <SlideFrame className="mt-8 gap-6">
      <PresetReadme
        heading={t('readme.heading')}
        preset="timeline"
        items={[
          { label: t('readme.labels.shows'), text: t('readme.shows') },
          { label: t('readme.labels.tryit'), text: t('readme.tryit') },
          { label: t('readme.labels.notice'), text: t('readme.notice') },
        ]}
      />
      <div {...target('timeline')}>
        <AiDisciplines preset="timeline" locale={locale} />
      </div>
    </SlideFrame>
  ),
});
