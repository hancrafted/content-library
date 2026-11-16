import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The move in four steps, as keys of `flow`, left to right. */
const FLOW = ['stuck', 'help', 'copy', 'next'] as const;

// Teaches the one move every hands-on relies on: stuck, paste what you see, copy the prompt, one next step. The statement above, the four steps as a row, and Help live in this Slide's own header to try at once.
export const askAiForHelp = slide({
  slug: 'ask-ai-for-help',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'flow' }],
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
  content: ({ t, target }) => (
    <SlideFrame className="justify-center gap-8">
      <p className="max-w-3xl rounded-2xl border border-(--info)/40 border-l-8 border-l-(--info) bg-(--info)/10 p-8 text-subheading font-semibold text-balance">
        {t('statement')}
      </p>
      <ol {...target('flow')} className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {FLOW.map((key, index) => (
          <li key={key} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-md">
            <span className="flex size-10 items-center justify-center rounded-full bg-(--info) text-body font-semibold text-info-foreground">
              {index + 1}
            </span>
            <p className="text-body font-semibold">{t(`flow.${key}.label`)}</p>
            <p className="text-body text-muted-foreground">{t(`flow.${key}.text`)}</p>
          </li>
        ))}
      </ol>
      <p className="text-body font-semibold text-(--info)">{t('tryIt')}</p>
    </SlideFrame>
  ),
});
