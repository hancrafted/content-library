import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { HumanInTheLoop } from '@/explorable-explanations/human-in-the-loop/human-in-the-loop';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The human in the loop workflow in its own words: the project-plan Workflow (Vacation one pill away), every toolbar
 * control and every stage's "Try it". The AI attention span Episode shows it with that Slide's words on top.
 */
export const humanInTheLoop = slide({
  slug: 'human-in-the-loop',
  messages: { en, de },
  notes: [{ slug: 'workflow', target: 'workflow' }],
  content: ({ locale, target }) => (
    <SlideFrame className="mt-10">
      <div {...target('workflow')}>
        <HumanInTheLoop workflow="project-plan" locale={locale} />
      </div>
    </SlideFrame>
  ),
});
