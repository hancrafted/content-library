import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { PresetReadme } from '@/episodes/components/slide-shared/preset-readme/preset-readme';
import { Context } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The context window in its `slide-4` Preset, with a readme on the Slide: what it shows, what to try, what to notice. */
export const compaction = slide({
  slug: 'compaction',
  messages: { en, de },
  content: ({ t, locale }) => (
    <SlideFrame className="mt-8 gap-6">
      <PresetReadme
        heading={t('readme.heading')}
        preset="slide-4"
        items={[
          { label: t('readme.labels.shows'), text: t('readme.shows') },
          { label: t('readme.labels.tryit'), text: t('readme.tryit') },
          { label: t('readme.labels.notice'), text: t('readme.notice') },
        ]}
      />
      <Context preset="slide-4" locale={locale} />
    </SlideFrame>
  ),
});
