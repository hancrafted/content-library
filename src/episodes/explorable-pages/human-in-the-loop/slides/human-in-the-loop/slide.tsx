import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { PresetReadme } from '@/episodes/components/slide-shared/preset-readme/preset-readme';
import { HumanInTheLoop } from '@/explorables/human-in-the-loop/human-in-the-loop';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const humanInTheLoop = slide({
  slug: 'human-in-the-loop',
  messages: { en, de },
  notes: [{ slug: 'workflow', target: 'workflow' }],
  content: ({ t, locale, target }) => (
    <SlideFrame className="mt-10 gap-6">
      <PresetReadme
        heading={t('readme.heading')}
        items={[
          { label: t('readme.labels.shows'), text: t('readme.shows') },
          { label: t('readme.labels.tryit'), text: t('readme.tryit') },
          { label: t('readme.labels.notice'), text: t('readme.notice') },
        ]}
      />
      <div {...target('workflow')}>
        <HumanInTheLoop workflow="source-to-quiz" locale={locale} />
      </div>
    </SlideFrame>
  ),
});
