import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { LoadOnClick } from '@/episodes/components/slide-shared/load-on-click/load-on-click.client';
import { PollJoin } from '@/episodes/components/slide-shared/poll-join/poll-join';
import { PollQuestion, type PollTone } from '@/episodes/components/slide-shared/poll-question/poll-question';
import de from './i18n/de.json';
import en from './i18n/en.json';

// evidence: docs/llm-wiki/research/AIE/AIE-0016__audience-ai-mental-model/dataset.md
const NO_RESPONDENTS_ON_EVENT_DAY_VOTES = undefined;

const QUESTIONS = [
  {
    key: 'seen',
    votes: [0, 3, 2, 0, 0],
    answers: [
      'questions.seen.answers.often',
      'questions.seen.answers.sometimes',
      'questions.seen.answers.never',
      'questions.seen.answers.forgot',
      'questions.seen.answers.unused',
    ],
    tone: 'info',
  },
  {
    key: 'known',
    votes: [0, 3, 0],
    answers: ['questions.known.answers.practice', 'questions.known.answers.heard', 'questions.known.answers.new'],
    tone: 'accent',
  },
  {
    key: 'modelAfter',
    answers: [
      'questions.modelAfter.answers.search',
      'questions.modelAfter.answers.chat',
      'questions.modelAfter.answers.assistant',
      'questions.modelAfter.answers.colleague',
      'questions.modelAfter.answers.team',
      'questions.modelAfter.answers.factory',
      'questions.modelAfter.answers.unsure',
    ],
    votes: NO_RESPONDENTS_ON_EVENT_DAY_VOTES,
    tone: 'info',
  },
  {
    key: 'shift',
    votes: [1, 2, 1],
    answers: ['questions.shift.answers.no', 'questions.shift.answers.somewhat', 'questions.shift.answers.clearly'],
    tone: 'accent',
  },
] as const satisfies readonly {
  key: 'seen' | 'known' | 'modelAfter' | 'shift';
  answers: readonly string[];
  votes?: readonly number[];
  tone: PollTone;
}[];

export const checkIn3 = slide({
  slug: 'check-in-3',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'questions' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="flex flex-col items-center justify-center gap-5 rounded-xl bg-primary p-8 text-primary-foreground shadow-md md:col-span-4">
          <p className="text-subheading font-semibold">{t('poll.stillOpen')}</p>
          <PollJoin
            voteUrl={t('poll.voteUrl')}
            label={t('poll.scan')}
            qrLabel={t('poll.qrLabel')}
            note={t('poll.createNote')}
            openLabel={t('poll.open')}
            newTab={t('poll.newTabHint')}
          />
          <p className="text-center text-caption opacity-80">{t('poll.notice')}</p>
        </div>
        <div className="flex flex-col gap-4 md:col-span-8">
          <ol {...target('questions')} className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {QUESTIONS.map(({ key, answers, votes, tone }, index) => (
              <PollQuestion
                key={key}
                marker={index + 1}
                question={t(`questions.${key}.question`)}
                answers={answers.map((answer) => t(answer))}
                votes={votes}
                tone={tone}
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
