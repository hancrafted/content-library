import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import { HandsOnStep } from '@/episodes/components/slide-shared/hands-on-step/hands-on-step';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The page holding every hands-on instruction: the Human in the loop Explorable, where the quiz Workflow is picked. */
const WORKFLOW_PATH = '/explorables/human-in-the-loop';

const STEPS = ['steps.first', 'steps.second', 'steps.third', 'steps.fourth'] as const;

// Hands-on 1b, from the spec to a quiz page a partner plays. The Scene points to the quiz Workflow and lists the steps; Help in the header turns being stuck into a prompt for an AI.
export const specAndQuizPage = slide({
  slug: 'spec-and-quiz-page',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'steps' }],
  headerAction: ({ t, template }) => (
    <GuideHelp
      step={t('help.step')}
      words={{
        button: t('help.button'),
        label: t('help.label'),
        placeholder: t('help.placeholder'),
        copy: t('help.copy'),
        copied: t('help.copied'),
        copyTip: t('help.copyTip'),
        prompt: template('help.prompt'),
        noError: t('help.noError'),
        chats: {
          openAIChats: t('help.chats.openAIChats'),
          openAIChatTip: template('help.chats.openAIChatTip'),
          newTab: t('help.chats.newTab'),
        },
      }}
    />
  ),
  content: ({ t, target, locale }) => (
    <SlideFrame className="justify-center">
      <div {...target('steps')}>
        <HandsOnStep
          stage={t('stage')}
          timebox={t('timebox')}
          steps={STEPS.map((key) => t(key))}
          workflow={{
            path: WORKFLOW_PATH,
            fragment: 'play',
            locale,
            label: t('workflow.label'),
            pick: t('workflow.pick'),
            newTab: t('workflow.newTab'),
          }}
          done={{ label: t('doneLabel'), text: t('done') }}
        />
      </div>
    </SlideFrame>
  ),
});
