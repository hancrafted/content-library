import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { LoadOnClick } from '@/episodes/components/slide-shared/load-on-click/load-on-click.client';
import { PollJoin } from '@/episodes/components/slide-shared/poll-join/poll-join';
import { PollQuestion, type PollTone } from '@/episodes/components/slide-shared/poll-question/poll-question';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * Poll v1's baseline questions as keys of `questions`, the picture of AI first so no ladder primes it,, with their answers' Translation keys in poll order. The wording is frozen: it is the
 * question register of research AIE-0016 (docs/llm-wiki/research/AIE/AIE-0016__audience-ai-mental-model/dataset.md),
 * and a change to it is a new poll version there first.
 */
const QUESTIONS = [
  {
    key: 'model',
    answers: [
      'questions.model.answers.search',
      'questions.model.answers.chat',
      'questions.model.answers.assistant',
      'questions.model.answers.colleague',
      'questions.model.answers.team',
      'questions.model.answers.factory',
      'questions.model.answers.unsure',
    ],
    tone: 'accent',
  },
  {
    key: 'fluency',
    answers: [
      'questions.fluency.answers.beginner',
      'questions.fluency.answers.basic',
      'questions.fluency.answers.confident',
      'questions.fluency.answers.advanced',
      'questions.fluency.answers.expert',
    ],
    tone: 'info',
  },
  {
    key: 'scope',
    answers: [
      'questions.scope.answers.self',
      'questions.scope.answers.team',
      'questions.scope.answers.unit',
      'questions.scope.answers.org',
      'questions.scope.answers.open',
    ],
    tone: 'accent',
  },
  {
    key: 'usage',
    answers: [
      'questions.usage.answers.none',
      'questions.usage.answers.ask',
      'questions.usage.answers.documents',
      'questions.usage.answers.embedded',
      'questions.usage.answers.delegate',
      'questions.usage.answers.build',
      'questions.usage.answers.orchestrate',
      'questions.usage.answers.product',
    ],
    tone: 'info',
  },
] as const satisfies readonly {
  key: 'model' | 'fluency' | 'scope' | 'usage';
  answers: readonly string[];
  tone: PollTone;
}[];

// A live poll on directpoll: the QR (drawn at build time from `poll.voteUrl`) on a filled panel with the anonymity notice, the baseline questions printed as text beside it, and a button that loads the Result page only after the click. The Slide header shows the title and caption; the Scene holds the poll.
export const poll = slide({
  slug: 'poll',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'questions' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex flex-col items-center justify-center gap-5 rounded-xl bg-primary p-8 text-primary-foreground shadow-md md:col-span-4">
          <PollJoin
            voteUrl={t('poll.voteUrl')}
            label={t('poll.scan')}
            qrLabel={t('poll.qrLabel')}
            note={t('poll.createNote')}
          />
          <p className="text-center text-caption opacity-80">{t('poll.notice')}</p>
        </div>
        <div className="flex flex-col gap-4 md:col-span-8">
          <ol {...target('questions')} className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {QUESTIONS.map((question, index) => (
              <PollQuestion
                key={question.key}
                marker={index + 1}
                question={t(`questions.${question.key}.question`)}
                answers={question.answers.map((answer) => t(answer))}
                tone={question.tone}
              />
            ))}
          </ol>
          <LoadOnClick
            src={t('poll.resultUrl')}
            buttonLabel={t('poll.showResults')}
            hint={t('poll.resultsHint')}
            fallbackNote={t('poll.resultsFallback')}
            newTabHint={t('poll.newTabHint')}
            title={t('poll.resultsTitle')}
          />
        </div>
      </div>
    </SlideFrame>
  ),
});
