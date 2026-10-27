import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { LoadOnClick } from '@/episodes/components/slide-shared/load-on-click/load-on-click.client';
import { PollJoin } from '@/episodes/components/slide-shared/poll-join/poll-join';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A live poll on directpoll: the QR (drawn at build time from `poll.voteUrl`) on a filled panel, the questions printed as text beside it, and a button that loads the Result page only after the click. The Slide header shows the title and caption; the Scene holds the poll.
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
        </div>
        <div className="flex flex-col gap-4 md:col-span-8">
          <ol {...target('questions')} className="flex flex-col gap-4">
            <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--info) text-body font-semibold text-info-foreground">
                  1
                </span>
                <p className="text-body font-semibold">{t('poll.q1.question')}</p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {(['a', 'b', 'c'] as const).map((answer) => (
                  <li
                    key={answer}
                    className="rounded-full bg-(--info)/10 px-4 py-1.5 text-body font-medium text-foreground"
                  >
                    {t(`poll.q1.answers.${answer}`)}
                  </li>
                ))}
              </ul>
            </li>
            <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-body font-semibold text-primary-foreground">
                  2
                </span>
                <p className="text-body font-semibold">{t('poll.q2.question')}</p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {(['a', 'b', 'c', 'd'] as const).map((answer) => (
                  <li
                    key={answer}
                    className="rounded-full bg-brand-accent/10 px-4 py-1.5 text-body font-medium text-foreground"
                  >
                    {t(`poll.q2.answers.${answer}`)}
                  </li>
                ))}
              </ul>
            </li>
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
