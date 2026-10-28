import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { PresetReadme } from '@/episodes/components/slide-shared/preset-readme/preset-readme';
import { AiCapability } from '@/explorables/ai-capability/ai-capability';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The timeline in its `timeline` Preset: nothing lit, every scene at rest until the mouse enters. The readme sits under
 * it, collapsed, so the Explorable fits the first screen; it says what it shows, what to try, what to notice.
 */
export const timeline = slide({
  slug: 'timeline',
  messages: { en, de },
  notes: [{ slug: 'timeline', target: 'timeline' }],
  content: ({ t, locale, target }) => (
    <SlideFrame className="mt-6 gap-6">
      <div {...target('timeline')}>
        <AiCapability preset="timeline" locale={locale} />
      </div>
      <PresetReadme
        heading={t('readme.heading')}
        preset="timeline"
        collapsed
        items={[
          { label: t('readme.labels.shows'), text: t('readme.shows') },
          { label: t('readme.labels.tryit'), text: t('readme.tryit') },
          { label: t('readme.labels.notice'), text: t('readme.notice') },
        ]}
      />
    </SlideFrame>
  ),
});
