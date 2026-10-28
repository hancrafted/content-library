import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { PresetReadme } from '@/episodes/components/slide-shared/preset-readme/preset-readme';
import { HumanInTheLoop } from '@/explorables/human-in-the-loop/human-in-the-loop';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The human in the loop Workflow in this Preset, with a readme on the Slide: what it shows, what to try, what to notice. */
export const inTheCommandLine = slide({
  slug: 'in-the-command-line',
  messages: { en, de },
  content: ({ t, locale }) => (
    <SlideFrame className="mt-10 gap-6">
      <PresetReadme
        heading={t('readme.heading')}
        items={[
          { label: t('readme.labels.shows'), text: t('readme.shows') },
          { label: t('readme.labels.tryit'), text: t('readme.tryit') },
          { label: t('readme.labels.notice'), text: t('readme.notice') },
        ]}
      />
      <HumanInTheLoop workflow="project-plan" level="technical" locale={locale} />
    </SlideFrame>
  ),
});
