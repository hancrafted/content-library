import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { PresetReadme } from '@/episodes/components/slide-shared/preset-readme/preset-readme';
import { HumanInTheLoop } from '@/explorables/human-in-the-loop/human-in-the-loop';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The human in the loop workflow in its own words: the project-plan Workflow in its Stages view (Vacation one pill
 * away), every toolbar control and every stage's "Try it", with a readme on the Slide. The AI attention span Episode
 * shows it with that Slide's words on top.
 */
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
        <HumanInTheLoop workflow="project-plan" locale={locale} />
      </div>
    </SlideFrame>
  ),
});
